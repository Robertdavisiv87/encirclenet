import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, price } = await req.json();
    
    if (!tier || !price) {
      return Response.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Create/update subscription
    const existingSubs = await base44.entities.Subscription.filter({ 
      user_email: user.email,
      status: 'active'
    });

    let subscription;
    if (existingSubs.length > 0) {
      // Update existing subscription
      subscription = await base44.entities.Subscription.update(existingSubs[0].id, {
        tier: tier,
        price: price
      });
    } else {
      // Create new subscription with 60-day free trial (30 days + 30 days free)
      const freeTrial = 60 * 24 * 60 * 60 * 1000;
      subscription = await base44.entities.Subscription.create({
        user_email: user.email,
        tier: tier,
        status: 'active',
        price: price,
        billing_cycle: 'monthly',
        next_billing_date: new Date(Date.now() + freeTrial).toISOString().split('T')[0]
      });
    }

    // Calculate earnings split
    const adminCommission = price * 0.10; // 10% platform fee
    const userShare = price * 0.90; // 90% to user

    // Track admin commission
    await base44.asServiceRole.entities.AdminCommission.create({
      transaction_type: 'subscription',
      reference_id: subscription.id,
      amount: adminCommission,
      creator_email: user.email,
      status: 'pending'
    });

    // If user was referred, credit referrer
    if (user.referred_by) {
      const referrals = await base44.asServiceRole.entities.Referral.filter({
        referrer_code: user.referred_by,
        referred_email: user.email
      });

      if (referrals.length > 0) {
        const referral = referrals[0];
        const referrerCommission = userShare * 0.90; // Referrer gets 90% of user's 90% share
        
        // Update referral earnings
        await base44.asServiceRole.entities.Referral.update(referral.id, {
          commission_earned: (referral.commission_earned || 0) + referrerCommission,
          status: 'active'
        });

        // Update referrer's total earnings
        const referrers = await base44.asServiceRole.entities.User.filter({
          email: referral.referrer_email
        });
        if (referrers.length > 0) {
          const referrer = referrers[0];
          await base44.asServiceRole.entities.User.update(referrer.id, {
            total_earnings: (referrer.total_earnings || 0) + referrerCommission
          });
        }
      }
    }

    return Response.json({ 
      success: true, 
      subscription,
      user_share: userShare,
      admin_commission: adminCommission,
      message: tier === 'free' ? 'Subscription updated' : '🎉 Subscription activated! You get 1 month FREE!'
    });

  } catch (error) {
    console.error('Subscription processing error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to process subscription'
    }, { status: 500 });
  }
});