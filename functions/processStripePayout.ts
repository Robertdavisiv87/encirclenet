import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount < 5) {
      return Response.json({ error: 'Minimum payout is $5' }, { status: 400 });
    }

    if (!user.stripe_account_id) {
      return Response.json({ 
        error: 'Please complete Stripe Connect setup first' 
      }, { status: 400 });
    }

    // Calculate total available balance
    const referrals = await base44.entities.Referral.filter({ 
      referrer_email: user.email 
    });
    const referralEarnings = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);

    const tips = await base44.entities.Transaction.filter({ 
      to_email: user.email,
      type: 'tip'
    });
    const tipEarnings = tips.reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalBalance = referralEarnings + tipEarnings;

    if (totalBalance < amount) {
      return Response.json({ 
        error: 'Insufficient balance',
        available: totalBalance 
      }, { status: 400 });
    }

    // Create Stripe transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: user.stripe_account_id,
      description: `Payout to ${user.full_name}`,
      metadata: {
        user_email: user.email,
        user_id: user.id
      }
    });

    // Create payout transaction record
    const payout = await base44.asServiceRole.entities.Transaction.create({
      from_email: 'system@encirclenet.net',
      to_email: user.email,
      type: 'payout',
      amount: amount,
      status: 'completed',
      description: `Stripe payout`,
      metadata: {
        stripe_transfer_id: transfer.id,
        stripe_account_id: user.stripe_account_id
      }
    });

    // Update user's payout history
    await base44.asServiceRole.entities.User.update(user.id, {
      last_payout_date: new Date().toISOString(),
      total_payouts: (user.total_payouts || 0) + amount
    });

    // Send notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: user.email,
      type: 'payout',
      title: 'Payout Successful! 💰',
      message: `$${amount.toFixed(2)} has been transferred via Stripe. Funds arrive in 1-2 business days.`,
      from_user: 'system@encirclenet.net',
      from_user_name: 'EncircleNet',
      is_read: false
    });

    return Response.json({ 
      success: true,
      payout_id: payout.id,
      transfer_id: transfer.id,
      amount: amount,
      status: 'completed',
      message: 'Payout successful! Funds will arrive in 1-2 business days.'
    });

  } catch (error) {
    console.error('Stripe payout error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to process payout'
    }, { status: 500 });
  }
});