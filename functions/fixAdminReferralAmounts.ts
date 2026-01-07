import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.email !== 'robertdavisiv87@gmail.com') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // Get all admin referrals
    const adminReferrals = await base44.asServiceRole.entities.Referral.filter({
      referrer_email: 'robertdavisiv87@gmail.com'
    });

    console.log(`Found ${adminReferrals.length} admin referrals to update`);

    let updatedCount = 0;
    let totalNewAmount = 0;

    // Update each referral to $50
    for (const referral of adminReferrals) {
      await base44.asServiceRole.entities.Referral.update(referral.id, {
        commission_earned: 50.00
      });
      updatedCount++;
      totalNewAmount += 50.00;
    }

    // Update admin user's total_earnings
    const adminUsers = await base44.asServiceRole.entities.User.filter({
      email: 'robertdavisiv87@gmail.com'
    });

    if (adminUsers.length > 0) {
      await base44.asServiceRole.entities.User.update(adminUsers[0].id, {
        total_earnings: totalNewAmount
      });
    }

    return Response.json({
      success: true,
      referrals_updated: updatedCount,
      new_total: totalNewAmount,
      message: `Updated ${updatedCount} referrals to $50 each. New total: $${totalNewAmount}`
    });

  } catch (error) {
    console.error('Fix admin referrals error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});