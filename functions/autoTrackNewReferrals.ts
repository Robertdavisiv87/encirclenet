import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        // Get all users
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
        
        // Your referral code
        const referrerEmail = 'robertdavisiv87@gmail.com';
        const referralCode = 'CREATORROBE';
        
        // Get existing referrals
        const existingReferrals = await base44.entities.Referral.filter({
            referrer_email: referrerEmail
        });
        
        const existingEmails = existingReferrals.map(r => r.referred_email);
        
        // Find users that aren't already tracked as referrals
        const newUsers = allUsers.filter(u => 
            u.email !== referrerEmail && 
            !existingEmails.includes(u.email)
        );
        
        let newReferralsCount = 0;
        let newEarnings = 0;
        const createdReferrals = [];
        
        // Create referral records for all new users ($50 for admin)
        const isAdmin = referrerEmail === 'robertdavisiv87@gmail.com';
        const commissionAmount = isAdmin ? 50.0 : 5.0;
        
        for (const newUser of newUsers) {
            const referral = await base44.asServiceRole.entities.Referral.create({
                referrer_email: referrerEmail,
                referrer_code: referralCode,
                referred_email: newUser.email,
                referred_name: newUser.full_name || newUser.email.split('@')[0],
                commission_earned: commissionAmount,
                status: 'completed',
                conversion_type: 'signup'
            });
            
            createdReferrals.push(referral);
            newReferralsCount++;
            newEarnings += commissionAmount;
        }
        
        // Recalculate tier if new referrals were found
        if (newReferralsCount > 0) {
            await base44.functions.invoke('calculateUserTier', { 
                user_email: referrerEmail 
            });
        }

        return Response.json({
            success: true,
            new_referrals_found: newReferralsCount,
            new_earnings: newEarnings,
            total_users: allUsers.length,
            total_referrals: existingReferrals.length + newReferralsCount,
            created_referrals: createdReferrals
        });
    } catch (error) {
        console.error('Auto-track error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});