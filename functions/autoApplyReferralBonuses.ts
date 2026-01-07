import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Auto-apply bonuses when new referrals are detected
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        // Get all users
        const allUsers = await base44.asServiceRole.entities.User.list();
        
        let totalBonusesApplied = 0;
        let usersProcessed = 0;
        const results = [];

        for (const targetUser of allUsers) {
            try {
                // Get user's referrals
                const referrals = await base44.entities.Referral.filter({ 
                    referrer_email: targetUser.email 
                });
                
                if (referrals.length === 0) continue;

                // Call applyReferralBonuses for this user
                const bonusResult = await base44.functions.invoke('applyReferralBonuses', {
                    user_email: targetUser.email
                });

                if (bonusResult.data.total_bonus_applied > 0) {
                    totalBonusesApplied += bonusResult.data.total_bonus_applied;
                    usersProcessed++;
                    results.push({
                        user: targetUser.email,
                        bonus: bonusResult.data.total_bonus_applied,
                        bonuses: bonusResult.data.bonuses_applied
                    });
                }
            } catch (e) {
                console.error(`Failed to process ${targetUser.email}:`, e);
            }
        }

        return Response.json({
            success: true,
            users_processed: usersProcessed,
            total_bonuses_applied: totalBonusesApplied,
            results: results
        });
    } catch (error) {
        console.error('Auto-apply bonuses error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});