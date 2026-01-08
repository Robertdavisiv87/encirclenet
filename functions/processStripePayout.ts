import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ 
        success: false,
        error: 'Unauthorized',
        error_code: 'AUTH_REQUIRED'
      }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount < 5) {
      return Response.json({ 
        success: false,
        error: 'Minimum payout is $5',
        error_code: 'AMOUNT_TOO_LOW'
      }, { status: 400 });
    }

    if (!user.stripe_account_id) {
      return Response.json({ 
        success: false,
        error: 'Please complete Stripe Connect setup first',
        error_code: 'NO_STRIPE_ACCOUNT'
      }, { status: 400 });
    }

    // Check Stripe balance for the connected account
    let stripeBalance;
    try {
      stripeBalance = await stripe.balance.retrieve({
        stripeAccount: user.stripe_account_id
      });
    } catch (balanceError) {
      console.error('Stripe balance retrieval error:', {
        code: balanceError.code,
        message: balanceError.message
      });
      
      return Response.json({
        success: false,
        error: 'Failed to retrieve Stripe balance',
        error_code: balanceError.code || 'BALANCE_RETRIEVAL_FAILED',
        error_message: balanceError.message
      }, { status: 500 });
    }

    const availableBalance = stripeBalance.available[0]?.amount || 0;
    const availableBalanceDollars = availableBalance / 100;

    if (availableBalanceDollars < amount) {
      return Response.json({ 
        success: false,
        error: 'Insufficient Stripe balance',
        error_code: 'INSUFFICIENT_BALANCE',
        available_balance: availableBalanceDollars,
        requested_amount: amount
      }, { status: 400 });
    }

    // Create Stripe payout to bank account
    let payout;
    try {
      payout = await stripe.payouts.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        description: `Payout to ${user.full_name}`,
        metadata: {
          user_email: user.email,
          user_id: user.id
        }
      }, {
        stripeAccount: user.stripe_account_id
      });

      if (payout.status === 'failed') {
        console.error('Payout failed:', {
          payout_id: payout.id,
          failure_code: payout.failure_code,
          failure_message: payout.failure_message
        });
        
        return Response.json({
          success: false,
          payout_id: payout.id,
          error: payout.failure_message || 'Payout failed',
          error_code: payout.failure_code || 'PAYOUT_FAILED',
          status: payout.status
        }, { status: 402 });
      }
    } catch (payoutError) {
      console.error('Stripe payout creation error:', {
        code: payoutError.code,
        message: payoutError.message,
        type: payoutError.type
      });
      
      return Response.json({
        success: false,
        error: payoutError.message,
        error_code: payoutError.code || 'PAYOUT_CREATION_FAILED',
        error_type: payoutError.type
      }, { status: 402 });
    }

    // Create payout transaction record
    const payoutRecord = await base44.asServiceRole.entities.Transaction.create({
      from_email: 'system@encirclenet.net',
      to_email: user.email,
      type: 'payout',
      amount: amount,
      status: 'completed',
      description: `Stripe payout`,
      metadata: {
        stripe_payout_id: payout.id,
        stripe_account_id: user.stripe_account_id
      }
    });

    // Update user's total_earnings to 0
    await base44.asServiceRole.entities.User.update(user.id, {
      last_payout_date: new Date().toISOString(),
      total_payouts: (user.total_payouts || 0) + amount,
      total_earnings: 0
    });

    // Send notification
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: user.email,
        type: 'payout',
        title: 'Payout Successful! 💰',
        message: `$${amount.toFixed(2)} has been transferred via Stripe. Funds arrive in 1-2 business days.`,
        from_user: 'system@encirclenet.net',
        from_user_name: 'EncircleNet',
        is_read: false
      });
    } catch (notifError) {
      console.log('Notification skipped:', notifError.message);
    }

    return Response.json({ 
      success: true,
      payout_id: payoutRecord.id,
      stripe_payout_id: payout.id,
      amount: amount,
      status: payout.status,
      arrival_date: payout.arrival_date,
      message: 'Payout successful! Funds will arrive in 1-2 business days.'
    });

  } catch (error) {
    console.error('Stripe payout error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack
    });
    
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to process payout',
      error_code: error.code || 'INTERNAL_ERROR',
      error_type: error.type || 'unknown'
    }, { status: 500 });
  }
});