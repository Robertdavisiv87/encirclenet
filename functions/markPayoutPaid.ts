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

    const { payout_request_id, transaction_reference } = await req.json();

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

    if (request.status === 'paid') {
      return Response.json({ 
        success: false,
        error: 'Already marked as paid' 
      }, { status: 400 });
    }

    if (request.status !== 'approved') {
      return Response.json({ 
        success: false,
        error: 'Request must be approved first' 
      }, { status: 400 });
    }

    // Mark as paid
    await base44.asServiceRole.entities.PayoutRequest.update(payout_request_id, {
      status: 'paid',
      admin_notes: `${request.admin_notes || ''}\nPaid on ${new Date().toLocaleDateString()}${transaction_reference ? ` - Ref: ${transaction_reference}` : ''}`.trim()
    });

    // Create transaction record
    await base44.asServiceRole.entities.Transaction.create({
      from_email: 'system@encirclenet.net',
      to_email: request.user_email,
      type: 'payout',
      amount: request.amount,
      status: 'completed',
      metadata: {
        payout_request_id: payout_request_id,
        payout_method: request.payout_method,
        transaction_reference: transaction_reference
      }
    });

    // Update user's total_payouts
    const userData = await base44.asServiceRole.entities.User.filter({
      email: request.user_email
    });
    if (userData.length > 0) {
      const currentTotalPayouts = userData[0].total_payouts || 0;
      await base44.asServiceRole.entities.User.update(userData[0].id, {
        total_payouts: currentTotalPayouts + request.amount,
        last_payout_date: new Date().toISOString()
      });
    }

    // Notify user
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: request.user_email,
        type: 'payout',
        title: 'Payout Completed',
        message: `Your $${request.amount.toFixed(2)} payout has been sent to your ${request.payout_method} account.`,
        is_read: false
      });
    } catch (notifError) {
      console.log('User notification failed:', notifError.message);
    }

    return Response.json({
      success: true,
      message: 'Payout marked as paid',
      request: {
        ...request,
        status: 'paid'
      }
    });

  } catch (error) {
    console.error('Mark paid error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});