import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all revenue sources
    const referrals = await base44.entities.Referral.filter({ 
      referrer_email: user.email 
    });
    const referralsTotal = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);

    const tips = await base44.entities.Transaction.filter({ 
      to_email: user.email,
      type: 'tip'
    });
    const tipsTotal = tips
      .filter(t => t.status === 'completed' || !t.status)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const subscriptions = await base44.entities.Subscription.filter({ 
      user_email: user.email,
      status: 'active'
    });
    const subscriptionsTotal = subscriptions.reduce((sum, s) => sum + (s.price || 0), 0) * 0.90;

    const affiliateLinks = await base44.entities.AffiliateLink.filter({ 
      user_email: user.email 
    });
    const affiliateTotal = affiliateLinks.reduce((sum, a) => sum + (a.earnings || 0), 0);

    const shops = await base44.entities.CreatorShop.filter({ 
      creator_email: user.email 
    });
    const shopTotal = shops.reduce((sum, s) => sum + (s.total_revenue || 0), 0);

    const brandAccounts = await base44.entities.BrandAccount.filter({ 
      owner_email: user.email 
    });
    const brandsTotal = brandAccounts.reduce((sum, b) => sum + (b.total_spent || 0), 0);

    // Calculate total
    const totalEarnings = referralsTotal + tipsTotal + subscriptionsTotal + affiliateTotal + shopTotal + brandsTotal;

    // Update user record
    await base44.asServiceRole.entities.User.update(user.id, {
      total_earnings: totalEarnings,
      last_earnings_sync: new Date().toISOString()
    });

    return Response.json({
      success: true,
      earnings: {
        referrals: referralsTotal,
        tips: tipsTotal,
        subscriptions: subscriptionsTotal,
        affiliate: affiliateTotal,
        shop: shopTotal,
        brands: brandsTotal,
        total: totalEarnings
      },
      message: 'Earnings synced successfully'
    });

  } catch (error) {
    console.error('Sync earnings error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to sync earnings'
    }, { status: 500 });
  }
});