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

    // Calculate total pending earnings from all sources
    const referrals = await base44.entities.Referral.filter({ 
      referrer_email: user.email 
    });
    const tipTransactions = await base44.entities.Transaction.filter({ 
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
    const creatorShops = await base44.entities.CreatorShop.filter({ 
      creator_email: user.email 
    });
    const brandAccounts = await base44.entities.BrandAccount.filter({ 
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

    // If no earnings to migrate, mark as migrated anyway
    if (totalPendingEarnings <= 0) {
      await base44.asServiceRole.auth.updateMe({
        earnings_migrated: true,
        stripe_balance: 0
      });
      
      return Response.json({ 
        success: true, 
        message: 'No pending earnings to migrate',
        migrated_amount: 0
      });
    }

    // Check if user has Stripe account connected
    if (!user.stripe_account_id) {
      return Response.json({ 
        error: 'Connect Stripe account first',
        pending_amount: totalPendingEarnings
      }, { status: 400 });
    }

    // Create Stripe transfer to connected account
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(totalPendingEarnings * 100), // Convert to cents
        currency: 'usd',
        destination: user.stripe_account_id,
        description: `One-time migration of platform earnings for ${user.email}`,
        metadata: {
          user_email: user.email,
          migration: 'true',
          referral_earnings: referralEarnings.toFixed(2),
          tips_earnings: tipsEarnings.toFixed(2),
          subscription_earnings: subscriptionEarnings.toFixed(2),
          affiliate_earnings: affiliateEarnings.toFixed(2),
          shop_earnings: shopEarnings.toFixed(2),
          brand_earnings: brandEarnings.toFixed(2)
        }
      });

      // Mark migration as complete and update Stripe balance
      await base44.asServiceRole.auth.updateMe({
        earnings_migrated: true,
        stripe_balance: totalPendingEarnings,
        stripe_transfer_id: transfer.id
      });

      console.log(`✅ Migrated $${totalPendingEarnings.toFixed(2)} to Stripe for ${user.email}`);

      return Response.json({ 
        success: true,
        message: `Successfully migrated $${totalPendingEarnings.toFixed(2)} to your Stripe account`,
        migrated_amount: totalPendingEarnings,
        transfer_id: transfer.id,
        breakdown: {
          referrals: referralEarnings,
          tips: tipsEarnings,
          subscriptions: subscriptionEarnings,
          affiliate: affiliateEarnings,
          shop: shopEarnings,
          brands: brandEarnings
        }
      });

    } catch (stripeError) {
      console.error('Stripe transfer failed:', stripeError);
      return Response.json({ 
        error: 'Stripe transfer failed',
        details: stripeError.message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ 
      error: error.message || 'Migration failed' 
    }, { status: 500 });
  }
});