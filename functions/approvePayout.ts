import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { revenue_id, action, notes } = await req.json();

    const revenues = await base44.asServiceRole.entities.Revenue.filter({ id: revenue_id });
    
    if (revenues.length === 0) {
      return Response.json({ error: 'Revenue record not found' }, { status: 404 });
    }

    const revenue = revenues[0];

    if (action === 'approve') {
      // Approve payout
      await base44.asServiceRole.entities.Revenue.update(revenue_id, {
        status: 'paid',
        payout_date: new Date().toISOString(),
        approved_by: user.email,
        approval_notes: notes
      });

      // Check and mark referral as completed if this is a referral commission
      if (revenue.source === 'referral') {
        const referrals = await base44.asServiceRole.entities.Referral.filter({
          referrer_email: revenue.user_email,
          status: 'pending'
        });

        for (const referral of referrals) {
          await base44.asServiceRole.entities.Referral.update(referral.id, {
            status: 'completed',
            payout_date: new Date().toISOString()
          });
        }
      }

      // Send notification to creator
      await base44.asServiceRole.functions.invoke('createNotification', {
        user_email: revenue.user_email,
        type: 'revenue',
        title: 'Payout Approved',
        message: `Your payout of $${revenue.amount} has been approved and processed`,
        from_user: user.email,
        from_user_name: user.full_name
      });

      return Response.json({ 
        success: true, 
        message: 'Payout approved and processed' 
      });
    } else if (action === 'reject') {
      // Reject payout
      await base44.asServiceRole.entities.Revenue.update(revenue_id, {
        status: 'rejected',
        approved_by: user.email,
        approval_notes: notes
      });

      // Notify creator
      await base44.asServiceRole.functions.invoke('createNotification', {
        user_email: revenue.user_email,
        type: 'revenue',
        title: 'Payout Rejected',
        message: `Your payout of $${revenue.amount} was rejected. Reason: ${notes}`,
        from_user: user.email,
        from_user_name: user.full_name
      });

      return Response.json({ 
        success: true, 
        message: 'Payout rejected' 
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Payout approval error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});