import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    // Check if bank account is linked
    if (!user.bank_account_linked) {
      return Response.json({ error: 'Please link a bank account first' }, { status: 400 });
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

    // Create payout transaction
    const payout = await base44.asServiceRole.entities.Transaction.create({
      from_email: 'system@encirclenet.net',
      to_email: user.email,
      type: 'payout',
      amount: amount,
      status: 'processing',
      description: `Payout to ${user.bank_account_type || 'bank'} account ending in ${user.bank_account?.slice(-4) || 'XXXX'}`,
      metadata: {
        bank_holder: user.bank_account_holder,
        bank_routing: user.bank_routing,
        bank_account: user.bank_account,
        account_type: user.bank_account_type
      }
    });

    // In production, this would integrate with Stripe Connect, PayPal, or banking API
    // For now, we'll mark it as completed immediately for demo purposes
    await base44.asServiceRole.entities.Transaction.update(payout.id, {
      status: 'completed'
    });

    // Update user's payout history
    await base44.asServiceRole.entities.User.update(user.id, {
      last_payout_date: new Date().toISOString(),
      total_payouts: (user.total_payouts || 0) + amount
    });

    // Send notification
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: user.email,
        type: 'payout',
        title: 'Payout Successful! 💰',
        message: `$${amount.toFixed(2)} has been sent to your bank account. Funds typically arrive in 1-3 business days.`,
        from_user: 'system@encirclenet.net',
        from_user_name: 'EncircleNet',
        is_read: false
      });
    } catch (e) {
      console.log('Notification failed:', e);
    }

    return Response.json({ 
      success: true,
      payout_id: payout.id,
      amount: amount,
      status: 'completed',
      message: 'Payout successful! Funds will arrive in 1-3 business days.'
    });

  } catch (error) {
    console.error('Payout error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to process payout'
    }, { status: 500 });
  }
});