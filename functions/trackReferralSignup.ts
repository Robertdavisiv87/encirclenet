import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Auto-sync all referrals first to catch any new signups
        try {
            await base44.functions.invoke('syncReferrals', {});
        } catch (e) {
            console.log('Auto-sync during tracking:', e);
        }
    
    // Get the current user who just signed up
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referral_code } = await req.json();
    
    if (!referral_code) {
      return Response.json({ error: 'No referral code provided' }, { status: 400 });
    }

    // Find the referrer by their code
    const referrals = await base44.asServiceRole.entities.Referral.filter({
      referrer_code: referral_code
    });

    let referrer_email = null;
    
    if (referrals.length > 0) {
      referrer_email = referrals[0].referrer_email;
    } else {
      // Try to find user with this referral code
      const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
      const referrerUser = users.find(u => 
        u.email?.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8) === referral_code.toLowerCase()
      );
      
      if (referrerUser) {
        referrer_email = referrerUser.email;
      }
    }

    if (!referrer_email) {
      return Response.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Check if this referral already exists
    const existingReferrals = await base44.asServiceRole.entities.Referral.filter({
      referrer_email: referrer_email,
      referred_email: user.email
    });

    if (existingReferrals.length > 0) {
      return Response.json({ 
        success: true, 
        message: 'Referral already tracked',
        referral: existingReferrals[0]
      });
    }

    // Store referrer in new user's profile for tracking chain
    const newUserData = await base44.asServiceRole.entities.User.filter({
      email: user.email
    });

    if (newUserData.length > 0) {
      await base44.asServiceRole.entities.User.update(newUserData[0].id, {
        referred_by: referrer_email
      });
    }

    // Multi-level commission structure
    const isAdmin = referrer_email === 'robertdavisiv87@gmail.com';
    const level1Commission = isAdmin ? 50.00 : 5.00; // Direct referrer
    const level2Commission = 2.50; // Their upline
    const level3Commission = 1.00; // Their upline's upline
    const newUserBonus = 5.00; // New user signup bonus
    
    let totalPaid = 0;
    const commissionsLog = [];

    // Level 1: Direct referrer
    const referral = await base44.asServiceRole.entities.Referral.create({
      referrer_email: referrer_email,
      referrer_code: referral_code,
      referred_email: user.email,
      commission_earned: level1Commission,
      status: 'completed',
      conversion_type: 'signup'
    });
    
    await base44.asServiceRole.entities.AdminCommission.create({
      transaction_type: 'referral',
      reference_id: referral.id,
      amount: level1Commission,
      creator_email: referrer_email,
      status: 'completed'
    });

    const level1Users = await base44.asServiceRole.entities.User.filter({
      email: referrer_email
    });

    if (level1Users.length > 0) {
      const level1User = level1Users[0];
      
      // Transfer to Stripe if account connected
      if (level1User.stripe_account_id) {
        try {
          await stripe.transfers.create({
            amount: Math.round(level1Commission * 100),
            currency: 'usd',
            destination: level1User.stripe_account_id,
            description: `Referral commission for ${user.email} signup`,
            metadata: { referral_id: referral.id, level: '1' }
          });
          console.log(`✅ Transferred $${level1Commission} referral commission to ${referrer_email}`);
        } catch (transferError) {
          console.error(`❌ Stripe transfer failed for ${referrer_email}:`, transferError.message);
        }
      }
      
      const currentEarnings = level1User.total_earnings || 0;
      await base44.asServiceRole.entities.User.update(level1User.id, {
        total_earnings: currentEarnings + level1Commission
      });
      totalPaid += level1Commission;
      commissionsLog.push({ email: referrer_email, level: 1, amount: level1Commission });
    }

    // Level 2: Find who referred the direct referrer
    if (level1Users.length > 0 && level1Users[0].referred_by) {
      const level2Email = level1Users[0].referred_by;
      
      await base44.asServiceRole.entities.Referral.create({
        referrer_email: level2Email,
        referrer_code: 'LEVEL2',
        referred_email: user.email,
        commission_earned: level2Commission,
        status: 'completed',
        conversion_type: 'signup'
      });

      const level2Users = await base44.asServiceRole.entities.User.filter({
        email: level2Email
      });

      if (level2Users.length > 0) {
        const level2User = level2Users[0];
        
        // Transfer to Stripe if account connected
        if (level2User.stripe_account_id) {
          try {
            await stripe.transfers.create({
              amount: Math.round(level2Commission * 100),
              currency: 'usd',
              destination: level2User.stripe_account_id,
              description: `Level 2 referral commission for ${user.email} signup`,
              metadata: { level: '2' }
            });
            console.log(`✅ Transferred $${level2Commission} level 2 commission to ${level2Email}`);
          } catch (transferError) {
            console.error(`❌ Stripe transfer failed for ${level2Email}:`, transferError.message);
          }
        }
        
        const currentEarnings = level2User.total_earnings || 0;
        await base44.asServiceRole.entities.User.update(level2User.id, {
          total_earnings: currentEarnings + level2Commission
        });
        totalPaid += level2Commission;
        commissionsLog.push({ email: level2Email, level: 2, amount: level2Commission });

        // Level 3: Find who referred level 2
        if (level2User.referred_by) {
          const level3Email = level2User.referred_by;
          
          await base44.asServiceRole.entities.Referral.create({
            referrer_email: level3Email,
            referrer_code: 'LEVEL3',
            referred_email: user.email,
            commission_earned: level3Commission,
            status: 'completed',
            conversion_type: 'signup'
          });

          const level3Users = await base44.asServiceRole.entities.User.filter({
            email: level3Email
          });

          if (level3Users.length > 0) {
            const level3User = level3Users[0];
            
            // Transfer to Stripe if account connected
            if (level3User.stripe_account_id) {
              try {
                await stripe.transfers.create({
                  amount: Math.round(level3Commission * 100),
                  currency: 'usd',
                  destination: level3User.stripe_account_id,
                  description: `Level 3 referral commission for ${user.email} signup`,
                  metadata: { level: '3' }
                });
                console.log(`✅ Transferred $${level3Commission} level 3 commission to ${level3Email}`);
              } catch (transferError) {
                console.error(`❌ Stripe transfer failed for ${level3Email}:`, transferError.message);
              }
            }
            
            const currentEarnings = level3User.total_earnings || 0;
            await base44.asServiceRole.entities.User.update(level3User.id, {
              total_earnings: currentEarnings + level3Commission
            });
            totalPaid += level3Commission;
            commissionsLog.push({ email: level3Email, level: 3, amount: level3Commission });
          }
        }
      }
    }

    // Give new user signup bonus
    if (newUserData.length > 0) {
      const newUser = newUserData[0];
      const currentEarnings = newUser.total_earnings || 0;
      await base44.asServiceRole.entities.User.update(newUser.id, {
        total_earnings: currentEarnings + newUserBonus
      });

      await base44.asServiceRole.entities.Referral.create({
        referrer_email: user.email,
        referrer_code: 'SIGNUP_BONUS',
        referred_email: user.email,
        commission_earned: newUserBonus,
        status: 'completed',
        conversion_type: 'signup'
      });
    }

    return Response.json({ 
      success: true, 
      referral,
      new_user_bonus: newUserBonus,
      total_commissions_paid: totalPaid,
      commissions_breakdown: commissionsLog,
      message: `Multi-level commissions paid: $${totalPaid.toFixed(2)} across ${commissionsLog.length} levels. New user earned $${newUserBonus}`
    });

  } catch (error) {
    console.error('Referral tracking error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to track referral'
    }, { status: 500 });
  }
});