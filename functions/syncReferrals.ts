import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate user's referral code
    const referralCode = `CREATOR${user.email.slice(0, 4).toUpperCase()}`;
    
    // Get all users who have this referral code in their profile/metadata
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Get existing referrals for this user
    const existingReferrals = await base44.entities.Referral.filter({
      referrer_email: user.email
    });
    
    const existingReferredEmails = new Set(existingReferrals.map(r => r.referred_email));
    
    // Find new referrals (users with matching referral code who aren't already tracked)
    const newReferrals = [];
    for (const potentialReferral of allUsers) {
      if (potentialReferral.email === user.email) continue; // Skip self
      if (existingReferredEmails.has(potentialReferral.email)) continue; // Already tracked
      
      // Check if user has the referral code in their metadata or was created with it
      if (potentialReferral.referral_code === referralCode || 
          potentialReferral.referred_by === user.email ||
          potentialReferral.signup_referral_code === referralCode) {
        newReferrals.push(potentialReferral);
      }
    }

    // Create referral records for newly found referrals
    let totalNewEarnings = 0;
    const createdReferrals = [];
    
    for (const referred of newReferrals) {
      // Base commission: $5 per verified signup
      const commission = 5.00;
      
      const referralRecord = await base44.asServiceRole.entities.Referral.create({
        referrer_email: user.email,
        referrer_code: referralCode,
        referred_email: referred.email,
        referred_name: referred.full_name || referred.email.split('@')[0],
        commission_earned: commission,
        status: 'completed',
        conversion_type: 'signup'
      });
      
      createdReferrals.push(referralRecord);
      totalNewEarnings += commission;
    }

    // Update affiliate program if exists
    if (totalNewEarnings > 0) {
      const affiliatePrograms = await base44.entities.AffiliateProgram.filter({ 
        user_email: user.email 
      });
      
      if (affiliatePrograms.length > 0) {
        const program = affiliatePrograms[0];
        await base44.asServiceRole.entities.AffiliateProgram.update(program.id, {
          referrals_count: (program.referrals_count || 0) + newReferrals.length,
          conversions_count: (program.conversions_count || 0) + newReferrals.length,
          total_commission_earned: (program.total_commission_earned || 0) + totalNewEarnings
        });
      }
    }

    return Response.json({
      success: true,
      new_referrals_found: newReferrals.length,
      new_earnings: totalNewEarnings,
      total_referrals: existingReferrals.length + newReferrals.length,
      referrals_added: createdReferrals
    });

  } catch (error) {
    console.error('Sync referrals error:', error);
    return Response.json({ 
      error: error.message || 'Sync failed' 
    }, { status: 500 });
  }
});