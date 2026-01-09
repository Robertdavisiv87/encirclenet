import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { referral_code, customer_email } = await req.json();

    if (!referral_code) {
      return Response.json({ 
        valid: false,
        error: 'No referral code provided' 
      }, { status: 400 });
    }

    // Get referrer
    const referrerUsers = await base44.asServiceRole.entities.User.filter({
      referral_code: referral_code.toUpperCase()
    });

    if (referrerUsers.length === 0) {
      return Response.json({ 
        valid: false,
        error: 'Invalid referral code' 
      });
    }

    const referrer = referrerUsers[0];

    // Prevent self-referral
    if (customer_email && referrer.email === customer_email) {
      return Response.json({ 
        valid: false,
        error: 'Cannot use your own referral code' 
      });
    }

    // Check if code already used by this user
    if (customer_email) {
      const existingReferrals = await base44.asServiceRole.entities.StripeReferral.filter({
        referred_email: customer_email,
        status: 'completed'
      });

      if (existingReferrals.length > 0) {
        return Response.json({ 
          valid: false,
          error: 'You have already used a referral code' 
        });
      }
    }

    // Get Stripe promotion code
    const promotionCode = await stripe.promotionCodes.retrieve(
      referrer.stripe_promotion_code_id
    );

    if (!promotionCode.active) {
      return Response.json({ 
        valid: false,
        error: 'Referral code is no longer active' 
      });
    }

    // Check max redemptions
    if (promotionCode.max_redemptions && 
        promotionCode.times_redeemed >= promotionCode.max_redemptions) {
      return Response.json({ 
        valid: false,
        error: 'Referral code has reached maximum uses' 
      });
    }

    // Check expiration
    if (promotionCode.expires_at && 
        Date.now() / 1000 > promotionCode.expires_at) {
      return Response.json({ 
        valid: false,
        error: 'Referral code has expired' 
      });
    }

    // Get discount info
    const coupon = promotionCode.coupon;
    const discount = coupon.percent_off 
      ? `${coupon.percent_off}% off`
      : `$${coupon.amount_off / 100} off`;

    return Response.json({
      valid: true,
      referral_code: referral_code.toUpperCase(),
      referrer_name: referrer.full_name || referrer.email,
      discount: discount,
      promotion_code_id: promotionCode.id,
      message: `Valid! You'll receive ${discount} on your first purchase`
    });

  } catch (error) {
    console.error('Validate referral code error:', error);
    return Response.json({ 
      valid: false,
      error: error.message 
    }, { status: 500 });
  }
});