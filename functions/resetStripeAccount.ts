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

    // Clear Stripe account association
    if (user.stripe_account_id) {
      try {
        // Delete the Stripe Express account
        await stripe.accounts.del(user.stripe_account_id);
        console.log(`Deleted Stripe account ${user.stripe_account_id} for ${user.email}`);
      } catch (error) {
        console.log('Stripe account deletion note:', error.message);
      }
    }

    // Reset user's Stripe-related fields
    await base44.asServiceRole.auth.updateMe({
      stripe_account_id: null,
      earnings_migrated: false,
      stripe_balance: 0,
      stripe_transfer_id: null
    });

    console.log(`Reset Stripe account for ${user.email}`);

    return Response.json({ 
      success: true,
      message: 'Stripe account reset successfully. You can now connect your real bank account.'
    });

  } catch (error) {
    console.error('Reset error:', error);
    return Response.json({ 
      error: error.message || 'Reset failed' 
    }, { status: 500 });
  }
});