import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        // Default tiered bonus structure
        const defaultTiers = [
            {
                rule_name: "First 5 Referrals Bonus",
                rule_type: "milestone",
                description: "Get a $10 bonus when you reach your first 5 referrals!",
                trigger_condition: { min_referrals: 5, max_referrals: 5 },
                bonus_amount: 10.00,
                bonus_percentage: 0,
                is_active: true,
                is_recurring: false,
                priority: 100
            },
            {
                rule_name: "10 Referrals Milestone",
                rule_type: "milestone",
                description: "Unlock $25 bonus when you reach 10 referrals",
                trigger_condition: { min_referrals: 10, max_referrals: 10 },
                bonus_amount: 25.00,
                bonus_percentage: 0,
                is_active: true,
                is_recurring: false,
                priority: 90
            },
            {
                rule_name: "25 Referrals Elite Tier",
                rule_type: "milestone",
                description: "Welcome to Elite! Earn $50 bonus + 10% boost on all future referrals",
                trigger_condition: { min_referrals: 25, max_referrals: 25 },
                bonus_amount: 50.00,
                bonus_percentage: 0.10,
                is_active: true,
                is_recurring: false,
                priority: 80
            },
            {
                rule_name: "50 Referrals Champion",
                rule_type: "milestone",
                description: "Champion status achieved! $100 bonus + 15% boost",
                trigger_condition: { min_referrals: 50, max_referrals: 50 },
                bonus_amount: 100.00,
                bonus_percentage: 0.15,
                is_active: true,
                is_recurring: false,
                priority: 70
            },
            {
                rule_name: "100 Referrals Legend",
                rule_type: "milestone",
                description: "You're a legend! $250 bonus + 20% permanent boost",
                trigger_condition: { min_referrals: 100, max_referrals: 100 },
                bonus_amount: 250.00,
                bonus_percentage: 0.20,
                is_active: true,
                is_recurring: false,
                priority: 60
            },
            {
                rule_name: "Elite Tier Boost (25+)",
                rule_type: "percentage_boost",
                description: "10% earnings boost for Elite members (25+ referrals)",
                trigger_condition: { min_referrals: 25 },
                bonus_amount: 0,
                bonus_percentage: 0.10,
                is_active: true,
                is_recurring: true,
                priority: 50
            },
            {
                rule_name: "Champion Tier Boost (50+)",
                rule_type: "percentage_boost",
                description: "15% earnings boost for Champions (50+ referrals)",
                trigger_condition: { min_referrals: 50 },
                bonus_amount: 0,
                bonus_percentage: 0.15,
                is_active: true,
                is_recurring: true,
                priority: 40
            },
            {
                rule_name: "Legend Tier Boost (100+)",
                rule_type: "percentage_boost",
                description: "20% earnings boost for Legends (100+ referrals)",
                trigger_condition: { min_referrals: 100 },
                bonus_amount: 0,
                bonus_percentage: 0.20,
                is_active: true,
                is_recurring: true,
                priority: 30
            }
        ];

        // Check if rules already exist
        const existingRules = await base44.entities.ReferralBonusRule.list();
        
        if (existingRules.length > 0) {
            return Response.json({
                success: false,
                message: 'Bonus rules already exist. Delete existing rules first or create new ones manually.',
                existing_count: existingRules.length
            });
        }

        // Create all tier rules
        const createdRules = [];
        for (const tier of defaultTiers) {
            const rule = await base44.entities.ReferralBonusRule.create(tier);
            createdRules.push(rule);
        }

        return Response.json({
            success: true,
            message: 'Default tiered referral program created',
            tiers_created: createdRules.length,
            rules: createdRules
        });
    } catch (error) {
        console.error('Setup tiers error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});