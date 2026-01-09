import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a referral code
    const existingCode = user.referral_code;
    if (existingCode) {
      return Response.json({
        success: true,
        referral_code: existingCode,
        referral_link: `${Deno.env.get('BASE_URL') || 'https://yourapp.com'}/signup?ref=${existingCode}`,
        message: 'Using existing referral code'
      });
    }

    // Generate unique code
    const generateCode = () => {
      const name = user.full_name || user.email;
      const base = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${base}${random}`;
    };

    let referralCode = generateCode();
    
    // Ensure uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const existing = await base44.asServiceRole.entities.User.filter({
        referral_code: referralCode
      });
      
      if (existing.length === 0) break;
      referralCode = generateCode();
      attempts++;
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          user_id: user.id,
          referral_code: referralCode
        }
      });
      stripeCustomerId = customer.id;
    }

    // Get referral config
    const configs = await base44.asServiceRole.entities.ReferralConfig.list('-created_date', 1);
    const config = configs[0] || {
      referred_discount_type: 'percentage',
      referred_discount_value: 10,
      expiration_days: 0,
      max_uses_per_code: 0
    };

    // Create Stripe coupon
    const couponParams = {
      duration: 'once',
      name: `Referral from ${user.full_name || user.email}`,
      metadata: {
        referrer_email: user.email,
        referrer_id: user.id,
        referral_code: referralCode
      }
    };

    if (config.referred_discount_type === 'percentage') {
      couponParams.percent_off = config.referred_discount_value;
    } else {
      couponParams.amount_off = Math.round(config.referred_discount_value * 100);
      couponParams.currency = 'usd';
    }

    const coupon = await stripe.coupons.create(couponParams);

    // Create Stripe promotion code
    const promoCodeParams = {
      coupon: coupon.id,
      code: referralCode,
      metadata: {
        referrer_email: user.email,
        referrer_id: user.id
      }
    };

    if (config.max_uses_per_code > 0) {
      promoCodeParams.max_redemptions = config.max_uses_per_code;
    }

    if (config.expiration_days > 0) {
      const expiresAt = Math.floor(Date.now() / 1000) + (config.expiration_days * 24 * 60 * 60);
      promoCodeParams.expires_at = expiresAt;
    }

    const promotionCode = await stripe.promotionCodes.create(promoCodeParams);

    // Update user with referral code
    const userData = await base44.asServiceRole.entities.User.filter({
      email: user.email
    });

    if (userData.length > 0) {
      await base44.asServiceRole.entities.User.update(userData[0].id, {
        referral_code: referralCode,
        stripe_customer_id: stripeCustomerId,
        stripe_promotion_code_id: promotionCode.id
      });
    }

    return Response.json({
      success: true,
      referral_code: referralCode,
      referral_link: `${Deno.env.get('BASE_URL') || 'https://yourapp.com'}/signup?ref=${referralCode}`,
      promotion_code_id: promotionCode.id,
      discount: config.referred_discount_type === 'percentage' 
        ? `${config.referred_discount_value}% off`
        : `$${config.referred_discount_value} off`
    });

  } catch (error) {
    console.error('Generate referral code error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});