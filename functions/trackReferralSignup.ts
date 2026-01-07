import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    // Create referral record with commission ($50 for admin, $5 for others)
    const isAdmin = referrer_email === 'robertdavisiv87@gmail.com';
    const commissionAmount = isAdmin ? 50.00 : 5.00;
    const newUserBonus = 5.00; // New user also gets $5 signup bonus
    
    const referral = await base44.asServiceRole.entities.Referral.create({
      referrer_email: referrer_email,
      referrer_code: referral_code,
      referred_email: user.email,
      commission_earned: commissionAmount,
      status: 'completed',
      conversion_type: 'signup'
    });
    
    // Record admin commission for referrals (platform also earns)
    await base44.asServiceRole.entities.AdminCommission.create({
      transaction_type: 'referral',
      reference_id: referral.id,
      amount: commissionAmount,
      creator_email: referrer_email,
      status: 'completed'
    });

    // Update referrer's total earnings
    const referrerUsers = await base44.asServiceRole.entities.User.filter({
      email: referrer_email
    });

    if (referrerUsers.length > 0) {
      const referrerUser = referrerUsers[0];
      const currentEarnings = referrerUser.total_earnings || 0;
      await base44.asServiceRole.entities.User.update(referrerUser.id, {
        total_earnings: currentEarnings + commissionAmount
      });
    }

    // Give new user signup bonus
    const newUserData = await base44.asServiceRole.entities.User.filter({
      email: user.email
    });

    if (newUserData.length > 0) {
      const newUser = newUserData[0];
      const currentEarnings = newUser.total_earnings || 0;
      await base44.asServiceRole.entities.User.update(newUser.id, {
        total_earnings: currentEarnings + newUserBonus
      });
    }

    // Create referral record for new user's bonus
    await base44.asServiceRole.entities.Referral.create({
      referrer_email: user.email,
      referrer_code: 'SIGNUP_BONUS',
      referred_email: referrer_email,
      commission_earned: newUserBonus,
      status: 'completed',
      conversion_type: 'signup'
    });

    return Response.json({ 
      success: true, 
      referral,
      referrer_commission: commissionAmount,
      new_user_bonus: newUserBonus,
      message: `Referrer earned $${commissionAmount}, new user earned $${newUserBonus}`
    });

  } catch (error) {
    console.error('Referral tracking error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to track referral'
    }, { status: 500 });
  }
});