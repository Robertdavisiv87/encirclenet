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

    // Check if user already has a Stripe Connect account
    if (user.stripe_account_id) {
      return Response.json({ 
        account_id: user.stripe_account_id,
        message: 'Account already exists'
      });
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      capabilities: {
        transfers: { requested: true }
      },
      business_type: 'individual',
      business_profile: {
        mcc: '5734', // Computer software
        url: 'https://encirclenet.net'
      }
    });

    // Save Stripe account ID to user
    await base44.auth.updateMe({
      stripe_account_id: account.id
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get('origin')}/creator-economy`,
      return_url: `${req.headers.get('origin')}/creator-economy?stripe_setup=success`,
      type: 'account_onboarding'
    });

    return Response.json({
      success: true,
      account_id: account.id,
      onboarding_url: accountLink.url
    });

  } catch (error) {
    console.error('Stripe Connect error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});