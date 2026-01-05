import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get all referrals with @example.com emails
        const testReferrals = await base44.asServiceRole.entities.Referral.filter({});
        
        const testEmails = testReferrals.filter(r => 
            r.referred_email && r.referred_email.includes('@example.com')
        );

        // Delete each test referral
        let deletedCount = 0;
        let totalCommissionRemoved = 0;

        for (const referral of testEmails) {
            await base44.asServiceRole.entities.Referral.delete(referral.id);
            deletedCount++;
            totalCommissionRemoved += referral.commission_earned || 0;
        }

        return Response.json({
            success: true,
            deleted_count: deletedCount,
            commission_removed: totalCommissionRemoved,
            message: `Removed ${deletedCount} test referrals totaling $${totalCommissionRemoved.toFixed(2)}`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});