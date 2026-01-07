import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { user_email } = await req.json();

        if (!user_email) {
            return Response.json({ error: 'user_email required' }, { status: 400 });
        }

        // Get user's referral count
        const referrals = await base44.entities.Referral.filter({ referrer_email: user_email });
        const referralCount = referrals.length;

        // Get active bonus rules
        const bonusRules = await base44.entities.ReferralBonusRule.filter({ is_active: true });
        
        // Sort by priority (highest first)
        bonusRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

        // Get user's bonus history
        const bonusHistory = await base44.entities.UserBonusHistory.filter({ user_email });
        const earnedBonusIds = bonusHistory.map(b => b.bonus_rule_id);

        let totalBonusApplied = 0;
        const appliedBonuses = [];

        for (const rule of bonusRules) {
            const minReferrals = rule.trigger_condition?.min_referrals || 0;
            const maxReferrals = rule.trigger_condition?.max_referrals;

            // Check if already earned (and not recurring)
            if (earnedBonusIds.includes(rule.id) && !rule.is_recurring) {
                continue;
            }

            // Check if user qualifies
            const qualifies = referralCount >= minReferrals && 
                            (!maxReferrals || referralCount <= maxReferrals);

            if (qualifies) {
                let bonusAmount = 0;

                // Calculate bonus
                if (rule.bonus_amount > 0) {
                    bonusAmount += rule.bonus_amount;
                }

                if (rule.bonus_percentage > 0) {
                    // Apply percentage boost to total referral earnings
                    const referralEarnings = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
                    bonusAmount += referralEarnings * rule.bonus_percentage;
                }

                if (bonusAmount > 0) {
                    // Create bonus history record
                    const bonusRecord = await base44.entities.UserBonusHistory.create({
                        user_email,
                        bonus_rule_id: rule.id,
                        bonus_rule_name: rule.rule_name,
                        bonus_amount: bonusAmount,
                        trigger_details: {
                            referral_count: referralCount,
                            rule_type: rule.rule_type
                        },
                        referral_count_at_time: referralCount
                    });

                    // Update user's total earnings
                    const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
                    if (users.length > 0) {
                        const user = users[0];
                        const currentEarnings = user.total_earnings || 0;
                        await base44.asServiceRole.entities.User.update(user.id, {
                            total_earnings: currentEarnings + bonusAmount
                        });
                    }

                    totalBonusApplied += bonusAmount;
                    appliedBonuses.push({
                        rule_name: rule.rule_name,
                        amount: bonusAmount,
                        record_id: bonusRecord.id
                    });
                }
            }
        }

        return Response.json({
            success: true,
            total_bonus_applied: totalBonusApplied,
            bonuses_applied: appliedBonuses,
            referral_count: referralCount
        });
    } catch (error) {
        console.error('Apply bonuses error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});