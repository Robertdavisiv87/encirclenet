import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      console.log('No JSON body provided, using defaults');
    }

    const threshold = body?.threshold || 50;
    const auto_approve = body?.auto_approve !== false;

    const results = {
      processed: 0,
      approved: 0,
      rejected: 0,
      referrals_processed: 0,
      errors: []
    };

    // Get all pending payouts
    let pendingPayouts = [];
    try {
      const allPending = await base44.asServiceRole.entities.Revenue.filter({ status: 'pending' });
      pendingPayouts = allPending?.filter(item => (item?.amount || 0) >= threshold) || [];
      console.log(`Found ${pendingPayouts.length} pending payouts above threshold`);
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      results.errors.push({ type: 'fetch_payouts', error: error?.message || 'Unknown error' });
    }

    // Get completed referrals
    let completedReferrals = [];
    try {
      completedReferrals = await base44.asServiceRole.entities.Referral.filter({ status: 'completed' }) || [];
      console.log(`Found ${completedReferrals.length} completed referrals`);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      results.errors.push({ type: 'fetch_referrals', error: error?.message || 'Unknown error' });
    }

    // Process referral payouts
    for (const referral of completedReferrals) {
      try {
        if (!referral?.id) {
          console.warn('Skipping referral with no ID');
          continue;
        }

        const commissionAmount = referral?.commission_earned || 0;
        if (commissionAmount > 0) {
          await base44.asServiceRole.entities.Referral.update(referral.id, { status: 'paid' });
          console.log(`Paid referral ${referral.id}: $${commissionAmount}`);
          results.referrals_processed++;
          results.approved++;
          results.processed++;
        }
      } catch (error) {
        console.error(`Error processing referral ${referral?.id}:`, error);
        results.errors.push({
          referral_id: referral?.id || 'unknown',
          error: error?.message || 'Unknown error'
        });
      }
    }

    // Process revenue payouts
    for (const payout of pendingPayouts) {
      try {
        if (!payout?.id) {
          console.warn('Skipping payout with no ID');
          continue;
        }

        const userEmail = payout?.user_email || payout?.creator_email;
        if (!userEmail) {
          console.warn(`Skipping payout ${payout.id} - no user email`);
          results.rejected++;
          continue;
        }

        let creatorRevenue = [];
        try {
          creatorRevenue = await base44.asServiceRole.entities.Revenue.filter({ user_email: userEmail }) || [];
        } catch (e) {
          console.error(`Error fetching revenue for ${userEmail}:`, e);
        }

        const totalEarned = creatorRevenue.reduce((sum, r) => sum + (r?.amount || 0), 0);
        const shouldApprove = auto_approve && totalEarned >= 100;

        if (shouldApprove) {
          await base44.asServiceRole.entities.Revenue.update(payout.id, {
            status: 'paid',
            paid_date: new Date().toISOString()
          });

          try {
            await base44.asServiceRole.entities.Notification.create({
              user_email: userEmail,
              type: 'payout',
              title: 'Payout Processed',
              message: `Your payout of $${payout?.amount || 0} has been processed.`,
              is_read: false
            });
          } catch (notifError) {
            console.log('Notification skipped:', notifError?.message);
          }

          results.approved++;
          console.log(`Approved payout ${payout.id} for ${userEmail}: $${payout?.amount || 0}`);
        } else {
          results.rejected++;
          console.log(`Rejected payout ${payout.id} - total earned: $${totalEarned}`);
        }

        results.processed++;
      } catch (error) {
        console.error(`Error processing payout ${payout?.id}:`, error);
        results.errors.push({
          payout_id: payout?.id || 'unknown',
          error: error?.message || 'Unknown error'
        });
      }
    }

    return Response.json({
      success: true,
      processed: results.processed,
      approved: results.approved,
      rejected: results.rejected,
      referrals_processed: results.referrals_processed,
      errors: results.errors,
      message: `Processed ${results.processed} revenue payouts and ${results.referrals_processed} referral payouts. Total approved: ${results.approved}`
    });
  } catch (error) {
    console.error('Critical automated payout error:', error);
    return Response.json({ 
      success: false,
      error: error?.message || 'Unknown error occurred',
      stack: error?.stack
    }, { status: 500 });
  }
});