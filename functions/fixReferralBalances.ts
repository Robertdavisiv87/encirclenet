import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🔧 Fixing balances for ${user.email}`);

    // 1️⃣ Fetch all real referrals
    const allReferrals = await base44.entities.Referral.filter({
      referrer_email: user.email
    });

    console.log(`Found ${allReferrals.length} referrals`);

    // 2️⃣ Calculate total real referral earnings
    const totalReferralEarnings = allReferrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);

    // 3️⃣ Fetch tips
    const tips = await base44.entities.Transaction.filter({
      to_email: user.email,
      type: 'tip'
    });
    const totalTips = tips.reduce((sum, t) => sum + (t.amount || 0), 0);

    // 4️⃣ Fetch other earnings sources
    const subscriptions = await base44.entities.Subscription.filter({
      user_email: user.email,
      status: 'active'
    });
    const subscriptionEarnings = subscriptions.reduce((sum, s) => sum + (s.price || 0), 0) * 0.90;

    const affiliateLinks = await base44.entities.AffiliateLink.filter({
      user_email: user.email
    });
    const affiliateEarnings = affiliateLinks.reduce((sum, a) => sum + (a.earnings || 0), 0);

    // 5️⃣ Calculate total available balance
    const totalEarnings = totalReferralEarnings + totalTips + subscriptionEarnings + affiliateEarnings;
    const availableBalance = Math.max(totalEarnings, 0); // Prevent negative

    console.log(`📊 Earnings breakdown:
      - Referrals: $${totalReferralEarnings}
      - Tips: $${totalTips}
      - Subscriptions: $${subscriptionEarnings}
      - Affiliates: $${affiliateEarnings}
      - TOTAL: $${totalEarnings}
      - Available (no negatives): $${availableBalance}
    `);

    // 6️⃣ Update user record with corrected balance
    await base44.asServiceRole.entities.User.update(user.id, {
      stripe_balance: availableBalance,
      earnings_migrated: user.stripe_account_id ? true : false
    });

    // 7️⃣ Mark all referrals as completed if they have earnings
    for (const referral of allReferrals) {
      if (referral.commission_earned > 0 && referral.status !== 'completed') {
        await base44.asServiceRole.entities.Referral.update(referral.id, {
          status: 'completed'
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Balances fixed and synced',
      earnings: {
        referrals: totalReferralEarnings,
        tips: totalTips,
        subscriptions: subscriptionEarnings,
        affiliates: affiliateEarnings,
        total: totalEarnings,
        available: availableBalance
      },
      referrals_count: allReferrals.length
    });

  } catch (error) {
    console.error('Fix balance error:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to fix balances'
    }, { status: 500 });
  }
});