import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if migration already happened
    if (user.earnings_migrated) {
      return Response.json({ 
        success: true, 
        message: 'Earnings already migrated',
        already_migrated: true
      });
    }

    // Sync referrals first to catch any missing ones
    try {
      await base44.functions.invoke('syncReferrals', {});
    } catch (e) {
      console.log('Referral sync during migration:', e.message);
    }

    // Calculate total pending earnings from all sources using service role
    const referrals = await base44.asServiceRole.entities.Referral.filter({ 
      referrer_email: user.email 
    });
    const tipTransactions = await base44.asServiceRole.entities.Transaction.filter({ 
      to_email: user.email,
      type: 'tip'
    });
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ 
      user_email: user.email,
      status: 'active'
    });
    const affiliateLinks = await base44.asServiceRole.entities.AffiliateLink.filter({ 
      user_email: user.email 
    });
    const creatorShops = await base44.asServiceRole.entities.CreatorShop.filter({ 
      creator_email: user.email 
    });
    const brandAccounts = await base44.asServiceRole.entities.BrandAccount.filter({ 
      owner_email: user.email 
    });

    // Calculate totals
    const referralEarnings = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
    const tipsEarnings = tipTransactions
      .filter(t => t.status === 'completed' || !t.status)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const subscriptionEarnings = subscriptions.reduce((sum, s) => sum + (s.price || 0), 0) * 0.90;
    const affiliateEarnings = affiliateLinks.reduce((sum, a) => sum + (a.earnings || 0), 0);
    const shopEarnings = creatorShops.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
    const brandEarnings = brandAccounts.reduce((sum, b) => sum + (b.total_spent || 0), 0);

    const totalPendingEarnings = 
      referralEarnings + 
      tipsEarnings + 
      subscriptionEarnings + 
      affiliateEarnings + 
      shopEarnings + 
      brandEarnings;
    
    console.log(`📊 Earnings Breakdown for ${user.email}:`, {
      referrals: `$${referralEarnings} (${referrals.length} referrals)`,
      tips: `$${tipsEarnings}`,
      subscriptions: `$${subscriptionEarnings}`,
      affiliate: `$${affiliateEarnings}`,
      shop: `$${shopEarnings}`,
      brands: `$${brandEarnings}`,
      TOTAL: `$${totalPendingEarnings}`
    });

    // If no earnings to migrate, DON'T mark as migrated (allow retry)
    if (totalPendingEarnings <= 0) {
      return Response.json({ 
        success: true, 
        message: 'No pending earnings detected. Run sync first.',
        migrated_amount: 0,
        breakdown: {
          referrals: referralEarnings,
          tips: tipsEarnings,
          subscriptions: subscriptionEarnings,
          affiliate: affiliateEarnings,
          shop: shopEarnings,
          brands: brandEarnings
        }
      });
    }

    // Check if user has Stripe account connected
    if (!user.stripe_account_id) {
      return Response.json({ 
        error: 'Connect Stripe account first',
        pending_amount: totalPendingEarnings
      }, { status: 400 });
    }

    // Skip Stripe transfer in test mode - just update balance directly
    // Mark migration as complete and update Stripe balance
    await base44.asServiceRole.entities.User.update(user.id, {
      earnings_migrated: true,
      stripe_balance: totalPendingEarnings
    });

    console.log(`✅ Migrated $${totalPendingEarnings.toFixed(2)} to balance for ${user.email}`);

    return Response.json({ 
      success: true,
      message: `Successfully migrated $${totalPendingEarnings.toFixed(2)} to your account`,
      migrated_amount: totalPendingEarnings,
      breakdown: {
        referrals: referralEarnings,
        tips: tipsEarnings,
        subscriptions: subscriptionEarnings,
        affiliate: affiliateEarnings,
        shop: shopEarnings,
        brands: brandEarnings
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ 
      error: error.message || 'Migration failed' 
    }, { status: 500 });
  }
});