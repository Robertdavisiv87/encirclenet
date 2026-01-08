import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can trigger automated payouts
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { threshold = 50, auto_approve = true } = await req.json();

    // Get all pending payouts above threshold
    const pendingPayouts = await base44.asServiceRole.entities.Revenue.filter({
      status: 'pending'
    }).then(items => items.filter(item => (item.amount || 0) >= threshold));

    // Get all completed referrals that haven't been paid out
    const completedReferrals = await base44.asServiceRole.entities.Referral.filter({
      status: 'completed'
    });

    const results = {
      processed: 0,
      approved: 0,
      rejected: 0,
      referrals_processed: 0,
      errors: []
    };

    // Process referral payouts - DON'T create Transaction records, referrals are already counted
    for (const referral of completedReferrals) {
      try {
        if (referral.commission_earned > 0) {
          // Mark referral as paid (but don't create duplicate transaction)
          await base44.asServiceRole.entities.Referral.update(referral.id, {
            status: 'paid'
          });

          results.referrals_processed++;
          results.approved++;
        }
      } catch (error) {
        results.errors.push({
          referral_id: referral.id,
          error: error.message
        });
      }
    }

    // Process revenue payouts
    for (const payout of pendingPayouts) {
      try {
        // Auto-approve logic: check if creator meets criteria
        const creatorRevenue = await base44.asServiceRole.entities.Revenue.filter({
          creator_email: payout.creator_email
        });

        const totalEarned = creatorRevenue.reduce((sum, r) => sum + (r.amount || 0), 0);
        const shouldApprove = auto_approve && totalEarned >= 100; // Minimum $100 total earned

        if (shouldApprove) {
          await base44.asServiceRole.entities.Revenue.update(payout.id, {
            status: 'paid',
            paid_date: new Date().toISOString()
          });

          // Create notification (skip if entity doesn't exist)
          try {
            await base44.asServiceRole.entities.Notification.create({
              user_email: payout.user_email || payout.creator_email,
              type: 'payout',
              title: 'Payout Processed',
              message: `Your payout of $${payout.amount || 0} has been automatically approved and processed.`,
              is_read: false
            });
          } catch (notifError) {
            console.log('Notification creation skipped:', notifError.message);
          }

          results.approved++;
        }

        results.processed++;
      } catch (error) {
        results.errors.push({
          payout_id: payout.id,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      ...results,
      message: `Processed ${results.processed} revenue payouts and ${results.referrals_processed} referral payouts, total approved: ${results.approved}`
    });
  } catch (error) {
    console.error('Automated payout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});