import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user_email } = await req.json();
        const emailToCheck = user_email || user.email;

        // Get all active tiers (sorted by level)
        const allTiers = await base44.entities.ReferralTier.filter({ is_active: true });
        const tiers = allTiers.sort((a, b) => a.tier_level - b.tier_level);

        if (tiers.length === 0) {
            return Response.json({ 
                error: 'No tiers configured',
                message: 'Please configure referral tiers first'
            }, { status: 400 });
        }

        // Get user's referrals
        const referrals = await base44.entities.Referral.filter({ 
            referrer_email: emailToCheck 
        });

        const totalReferrals = referrals.length;
        const successfulReferrals = referrals.filter(r => 
            r.status === 'completed' || r.status === 'active'
        ).length;
        const totalCommission = referrals.reduce((sum, r) => 
            sum + (r.commission_earned || 0), 0
        );

        // Determine current tier
        let currentTier = tiers[0]; // Default to lowest tier
        for (const tier of tiers) {
            if (successfulReferrals >= tier.min_referrals && 
                totalCommission >= (tier.min_commission || 0)) {
                currentTier = tier;
            }
        }

        // Find next tier
        const currentIndex = tiers.findIndex(t => t.id === currentTier.id);
        const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;

        // Calculate progress to next tier
        let progressToNext = 100;
        if (nextTier) {
            const referralProgress = (successfulReferrals / nextTier.min_referrals) * 100;
            const commissionProgress = (totalCommission / (nextTier.min_commission || 1)) * 100;
            progressToNext = Math.min(referralProgress, commissionProgress);
        }

        // Get or create user tier record
        let userTierRecords = await base44.entities.UserReferralTier.filter({ 
            user_email: emailToCheck 
        });
        let userTierRecord = userTierRecords[0];

        const tierData = {
            user_email: emailToCheck,
            current_tier_id: currentTier.id,
            current_tier_name: currentTier.tier_name,
            current_tier_level: currentTier.tier_level,
            total_referrals: totalReferrals,
            successful_referrals: successfulReferrals,
            total_commission_earned: totalCommission,
            next_tier_id: nextTier?.id || null,
            next_tier_name: nextTier?.tier_name || null,
            progress_to_next_tier: progressToNext
        };

        // Check if tier changed (tier up)
        let tierBonus = 0;
        let tierChanged = false;
        if (userTierRecord && userTierRecord.current_tier_level < currentTier.tier_level) {
            tierBonus = currentTier.tier_bonus || 0;
            tierChanged = true;
            
            // Update tier history
            const tierHistory = userTierRecord.tier_history || [];
            tierHistory.push({
                tier_name: currentTier.tier_name,
                achieved_date: new Date().toISOString(),
                bonus_earned: tierBonus
            });
            tierData.tier_history = tierHistory;
            tierData.tier_bonuses_earned = (userTierRecord.tier_bonuses_earned || 0) + tierBonus;
        } else if (!userTierRecord) {
            // First time setup
            tierData.tier_history = [{
                tier_name: currentTier.tier_name,
                achieved_date: new Date().toISOString(),
                bonus_earned: 0
            }];
            tierData.tier_bonuses_earned = 0;
        }

        // Save or update user tier
        if (userTierRecord) {
            await base44.entities.UserReferralTier.update(userTierRecord.id, tierData);
        } else {
            await base44.entities.UserReferralTier.create(tierData);
        }

        return Response.json({
            success: true,
            current_tier: currentTier,
            next_tier: nextTier,
            stats: {
                total_referrals: totalReferrals,
                successful_referrals: successfulReferrals,
                total_commission: totalCommission,
                progress_to_next: progressToNext
            },
            tier_changed: tierChanged,
            tier_bonus: tierBonus
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});