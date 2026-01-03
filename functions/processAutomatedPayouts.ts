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
      status: 'pending',
      payout_amount: { $gte: threshold }
    });

    const results = {
      processed: 0,
      approved: 0,
      rejected: 0,
      errors: []
    };

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

          // Create notification
          await base44.asServiceRole.entities.Notification.create({
            user_email: payout.creator_email,
            type: 'subscription',
            title: 'Payout Processed',
            message: `Your payout of $${payout.payout_amount} has been automatically approved and processed.`,
            is_read: false
          });

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
      message: `Processed ${results.processed} payouts, approved ${results.approved}`
    });
  } catch (error) {
    console.error('Automated payout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});