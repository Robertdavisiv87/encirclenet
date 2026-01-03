import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🔄 Auto-syncing earnings for ${user.email}`);

    // 1️⃣ Clear fake payout transactions
    const fakePayouts = await base44.asServiceRole.entities.Transaction.filter({
      to_email: user.email,
      type: 'payout',
      created_by: 'service+521fac30-210a-44fe-b4c9-b99b6589fa22@no-reply.base44.com'
    });

    for (const payout of fakePayouts) {
      await base44.asServiceRole.entities.Transaction.delete(payout.id);
    }
    console.log(`Cleared ${fakePayouts.length} fake payouts`);

    // 2️⃣ Fetch all earnings sources
    const referrals = await base44.entities.Referral.filter({
      referrer_email: user.email
    });

    const tips = await base44.entities.Transaction.filter({
      to_email: user.email,
      type: 'tip'
    });

    const subscriptions = await base44.entities.Subscription.filter({
      user_email: user.email,
      status: 'active'
    });

    const affiliateLinks = await base44.entities.AffiliateLink.filter({
      user_email: user.email
    });

    // 3️⃣ Calculate total earnings
    const referralEarnings = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
    const tipEarnings = tips.reduce((sum, t) => sum + (t.amount || 0), 0);
    const subscriptionEarnings = subscriptions.reduce((sum, s) => sum + (s.price || 0), 0) * 0.90;
    const affiliateEarnings = affiliateLinks.reduce((sum, a) => sum + (a.earnings || 0), 0);

    const totalEarnings = referralEarnings + tipEarnings + subscriptionEarnings + affiliateEarnings;
    const availableBalance = Math.max(totalEarnings, 0);

    console.log(`💰 Total earnings: $${totalEarnings}`);

    // 4️⃣ Update user's stripe_balance
    await base44.asServiceRole.entities.User.update(user.id, {
      stripe_balance: availableBalance,
      earnings_migrated: user.stripe_account_id ? true : false
    });

    // 5️⃣ Mark all referrals as completed
    for (const referral of referrals) {
      if (referral.commission_earned > 0 && referral.status !== 'completed') {
        await base44.asServiceRole.entities.Referral.update(referral.id, {
          status: 'completed'
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Earnings auto-synced successfully',
      earnings: {
        referrals: referralEarnings,
        tips: tipEarnings,
        subscriptions: subscriptionEarnings,
        affiliates: affiliateEarnings,
        total: totalEarnings,
        available: availableBalance
      },
      fake_payouts_cleared: fakePayouts.length,
      referrals_credited: referrals.length
    });

  } catch (error) {
    console.error('Auto-sync error:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to auto-sync earnings'
    }, { status: 500 });
  }
});