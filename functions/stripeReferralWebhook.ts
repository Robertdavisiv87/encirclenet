import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Check if event already processed (idempotency)
    const existingEvents = await base44.asServiceRole.entities.StripeWebhookEvent.filter({
      event_id: event.id
    });

    if (existingEvents.length > 0 && existingEvents[0].processed) {
      console.log('Event already processed:', event.id);
      return Response.json({ success: true, message: 'Already processed' });
    }

    // Create event record
    await base44.asServiceRole.entities.StripeWebhookEvent.create({
      event_id: event.id,
      event_type: event.type,
      processed: false
    });

    // Get referral config
    const configs = await base44.asServiceRole.entities.ReferralConfig.list('-created_date', 1);
    const config = configs[0] || { enabled: true };

    if (!config.enabled) {
      console.log('Referral system disabled');
      return Response.json({ success: true, message: 'System disabled' });
    }

    // Handle different event types
    let processResult;
    switch (event.type) {
      case 'checkout.session.completed':
        processResult = await handleCheckoutCompleted(event.data.object, base44, config);
        break;
      case 'invoice.paid':
        processResult = await handleInvoicePaid(event.data.object, base44, config);
        break;
      case 'payment_intent.succeeded':
        processResult = await handlePaymentSucceeded(event.data.object, base44, config);
        break;
      default:
        console.log('Unhandled event type:', event.type);
        return Response.json({ success: true, message: 'Unhandled event' });
    }

    // Mark event as processed
    await base44.asServiceRole.entities.StripeWebhookEvent.update(existingEvents[0]?.id || event.id, {
      processed: true,
      metadata: processResult
    });

    return Response.json({ success: true, result: processResult });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});

async function handleCheckoutCompleted(session, base44, config) {
  try {
    const metadata = session.metadata || {};
    const referralCode = metadata.referral_code;

    if (!referralCode) {
      return { message: 'No referral code in session' };
    }

    const customerEmail = session.customer_email || session.customer_details?.email;
    if (!customerEmail) {
      return { error: 'No customer email' };
    }

    // Get referrer
    const referrerUsers = await base44.asServiceRole.entities.User.filter({
      referral_code: referralCode
    });

    if (referrerUsers.length === 0) {
      return { error: 'Referrer not found' };
    }

    const referrer = referrerUsers[0];

    // Prevent self-referral
    if (referrer.email === customerEmail) {
      return { error: 'Self-referral prevented' };
    }

    // Check if referral already exists
    const existing = await base44.asServiceRole.entities.StripeReferral.filter({
      referred_email: customerEmail,
      referral_code: referralCode
    });

    if (existing.length > 0 && existing[0].reward_issued) {
      return { error: 'Reward already issued' };
    }

    const amountPaid = session.amount_total / 100;

    // Check minimum purchase
    if (config.minimum_purchase_amount && amountPaid < config.minimum_purchase_amount) {
      return { error: 'Below minimum purchase amount' };
    }

    // Calculate referrer reward
    let referrerReward;
    if (config.referrer_reward_type === 'percentage') {
      referrerReward = amountPaid * (config.referrer_reward_value / 100);
    } else {
      referrerReward = config.referrer_reward_value;
    }

    // Create or update referral record
    const referralData = {
      referrer_email: referrer.email,
      referrer_stripe_customer_id: referrer.stripe_customer_id,
      referred_email: customerEmail,
      referred_stripe_customer_id: session.customer,
      referral_code: referralCode,
      checkout_session_id: session.id,
      payment_intent_id: session.payment_intent,
      amount_paid: amountPaid,
      referrer_reward_amount: referrerReward,
      referred_reward_amount: config.referred_discount_value,
      status: 'completed',
      reward_issued: false
    };

    let referralRecord;
    if (existing.length > 0) {
      await base44.asServiceRole.entities.StripeReferral.update(existing[0].id, referralData);
      referralRecord = existing[0];
    } else {
      referralRecord = await base44.asServiceRole.entities.StripeReferral.create(referralData);
    }

    // Issue reward to referrer via Stripe Customer Balance
    if (referrer.stripe_customer_id) {
      await stripe.customers.createBalanceTransaction(referrer.stripe_customer_id, {
        amount: Math.round(referrerReward * 100) * -1, // Negative = credit
        currency: 'usd',
        description: `Referral reward for ${customerEmail}`,
        metadata: {
          referral_id: referralRecord.id,
          referred_email: customerEmail
        }
      });

      // Mark reward as issued
      await base44.asServiceRole.entities.StripeReferral.update(referralRecord.id, {
        reward_issued: true,
        reward_issued_date: new Date().toISOString(),
        status: 'rewarded'
      });

      // Update referrer's total earnings
      const currentEarnings = referrer.total_earnings || 0;
      const referrerData = await base44.asServiceRole.entities.User.filter({
        email: referrer.email
      });
      if (referrerData.length > 0) {
        await base44.asServiceRole.entities.User.update(referrerData[0].id, {
          total_earnings: currentEarnings + referrerReward
        });
      }
    }

    return {
      success: true,
      referrer: referrer.email,
      referred: customerEmail,
      reward: referrerReward,
      amount_paid: amountPaid
    };

  } catch (error) {
    console.error('Checkout completed error:', error);
    return { error: error.message };
  }
}

async function handleInvoicePaid(invoice, base44, config) {
  // Similar logic for subscription payments
  return await handleCheckoutCompleted(
    {
      id: invoice.id,
      customer: invoice.customer,
      customer_email: invoice.customer_email,
      amount_total: invoice.amount_paid,
      metadata: invoice.metadata,
      payment_intent: invoice.payment_intent
    },
    base44,
    config
  );
}

async function handlePaymentSucceeded(paymentIntent, base44, config) {
  // Handle one-time payments
  if (!paymentIntent.metadata?.referral_code) {
    return { message: 'No referral code' };
  }

  return await handleCheckoutCompleted(
    {
      id: paymentIntent.id,
      customer: paymentIntent.customer,
      customer_email: paymentIntent.receipt_email,
      amount_total: paymentIntent.amount,
      metadata: paymentIntent.metadata,
      payment_intent: paymentIntent.id
    },
    base44,
    config
  );
}