import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ 
        success: false,
        error: 'Forbidden: Admin access required' 
      }, { status: 403 });
    }

    const { payout_request_id, action, admin_notes } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return Response.json({ 
        success: false,
        error: 'Invalid action. Must be "approve" or "reject"' 
      }, { status: 400 });
    }

    // Get payout request
    const requests = await base44.asServiceRole.entities.PayoutRequest.filter({
      id: payout_request_id
    });

    if (requests.length === 0) {
      return Response.json({ 
        success: false,
        error: 'Payout request not found' 
      }, { status: 404 });
    }

    const request = requests[0];

    if (request.status !== 'pending') {
      return Response.json({ 
        success: false,
        error: `Request already ${request.status}` 
      }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update payout request
    await base44.asServiceRole.entities.PayoutRequest.update(payout_request_id, {
      status: newStatus,
      admin_notes: admin_notes,
      processed_by: user.email,
      processed_date: new Date().toISOString()
    });

    // If rejected, refund the amount to user's balance
    if (action === 'reject') {
      const userData = await base44.asServiceRole.entities.User.filter({
        email: request.user_email
      });

      if (userData.length > 0) {
        const currentUser = userData[0];
        const currentBalance = currentUser.total_earnings || 0;
        await base44.asServiceRole.entities.User.update(currentUser.id, {
          total_earnings: currentBalance + request.amount
        });
      }
    }

    // Notify user
    try {
      const message = action === 'approve' 
        ? `Your $${request.amount.toFixed(2)} payout has been approved and will be sent to your ${request.payout_method} account shortly.`
        : `Your $${request.amount.toFixed(2)} payout request was rejected. ${admin_notes || 'Please contact support for details.'}`;

      await base44.asServiceRole.entities.Notification.create({
        user_email: request.user_email,
        type: 'payout',
        title: action === 'approve' ? 'Payout Approved' : 'Payout Rejected',
        message: message,
        is_read: false
      });
    } catch (notifError) {
      console.log('User notification failed:', notifError.message);
    }

    return Response.json({
      success: true,
      message: `Payout request ${newStatus}`,
      request: {
        ...request,
        status: newStatus,
        admin_notes,
        processed_by: user.email
      }
    });

  } catch (error) {
    console.error('Approve payout error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});