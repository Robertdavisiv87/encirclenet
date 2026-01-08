import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ 
        success: false,
        error: 'Unauthorized',
        error_code: 'AUTH_REQUIRED'
      }, { status: 401 });
    }

    const { to_email, amount, post_id, payment_method_id } = await req.json();
    
    if (!to_email || !amount || amount <= 0) {
      return Response.json({ 
        success: false,
        error: 'Invalid tip data',
        error_code: 'INVALID_DATA'
      }, { status: 400 });
    }

    if (!payment_method_id) {
      return Response.json({ 
        success: false,
        error: 'Payment method required',
        error_code: 'PAYMENT_METHOD_REQUIRED'
      }, { status: 400 });
    }

    // Create Stripe PaymentIntent to charge the customer
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method: payment_method_id,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        description: `Tip to ${to_email}`,
        metadata: {
          from_email: user.email,
          to_email: to_email,
          post_id: post_id || '',
          type: 'tip'
        }
      });

      if (paymentIntent.status !== 'succeeded') {
        console.error('Payment failed:', {
          status: paymentIntent.status,
          error_code: paymentIntent.last_payment_error?.code,
          error_message: paymentIntent.last_payment_error?.message
        });
        
        return Response.json({
          success: false,
          payment_id: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message || 'Payment failed',
          error_code: paymentIntent.last_payment_error?.code || 'PAYMENT_FAILED',
          status: paymentIntent.status
        }, { status: 402 });
      }
    } catch (stripeError) {
      console.error('Stripe payment error:', {
        code: stripeError.code,
        message: stripeError.message,
        type: stripeError.type
      });
      
      return Response.json({
        success: false,
        error: stripeError.message,
        error_code: stripeError.code || 'STRIPE_ERROR',
        error_type: stripeError.type
      }, { status: 402 });
    }

    // Create transaction record
    const transaction = await base44.entities.Transaction.create({
      from_email: user.email,
      from_name: user.full_name,
      to_email: to_email,
      amount: amount,
      type: 'tip',
      post_id: post_id || null,
      stripe_payment_id: paymentIntent.id,
      status: 'completed'
    });

    // Calculate admin commission (10%)
    const adminCommission = amount * 0.10;
    const creatorEarnings = amount * 0.90;

    // Update recipient's total earnings AND transfer to Stripe
    const recipients = await base44.asServiceRole.entities.User.filter({ email: to_email });
    if (recipients.length > 0) {
      const recipient = recipients[0];
      
      // If recipient has Stripe account, transfer funds directly
      if (recipient.stripe_account_id) {
        try {
          await stripe.transfers.create({
            amount: Math.round(creatorEarnings * 100),
            currency: 'usd',
            destination: recipient.stripe_account_id,
            description: `Tip earnings from ${user.email}`,
            metadata: {
              transaction_id: transaction.id,
              recipient_email: to_email
            }
          });
          console.log(`✅ Transferred $${creatorEarnings} to ${to_email}'s Stripe account`);
        } catch (transferError) {
          console.error(`❌ Stripe transfer failed for ${to_email}:`, transferError.message);
        }
      }
      
      await base44.asServiceRole.entities.User.update(recipient.id, {
        total_earnings: (recipient.total_earnings || 0) + creatorEarnings
      });
    }

    // Track admin commission
    await base44.asServiceRole.entities.AdminCommission.create({
      transaction_type: 'tip',
      reference_id: transaction.id,
      amount: adminCommission,
      creator_email: to_email,
      status: 'completed'
    });

    // Update post tips if post_id provided
    if (post_id) {
      const posts = await base44.asServiceRole.entities.Post.filter({ id: post_id });
      if (posts.length > 0) {
        const post = posts[0];
        await base44.asServiceRole.entities.Post.update(post_id, {
          tips_received: (post.tips_received || 0) + amount
        });
      }
    }

    return Response.json({ 
      success: true,
      payment_id: paymentIntent.id,
      transaction_id: transaction.id,
      amount: amount,
      creator_earned: creatorEarnings,
      admin_commission: adminCommission,
      status: 'succeeded'
    });

  } catch (error) {
    console.error('Tip processing error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack
    });
    
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to process tip',
      error_code: error.code || 'INTERNAL_ERROR',
      error_type: error.type || 'unknown'
    }, { status: 500 });
  }
});