import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, payout_method, payout_details } = await req.json();

    // Validate minimum payout
    if (amount < 5) {
      return Response.json({ 
        success: false,
        error: 'Minimum payout is $5' 
      }, { status: 400 });
    }

    // Get user's current balance
    const userData = await base44.asServiceRole.entities.User.filter({
      email: user.email
    });

    if (userData.length === 0) {
      return Response.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    const currentUser = userData[0];
    const availableBalance = currentUser.total_earnings || 0;

    if (amount > availableBalance) {
      return Response.json({ 
        success: false,
        error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}` 
      }, { status: 400 });
    }

    // Check for existing pending requests
    const pendingRequests = await base44.asServiceRole.entities.PayoutRequest.filter({
      user_email: user.email,
      status: 'pending'
    });

    if (pendingRequests.length > 0) {
      return Response.json({ 
        success: false,
        error: 'You already have a pending payout request' 
      }, { status: 400 });
    }

    // Create payout request
    const payoutRequest = await base44.asServiceRole.entities.PayoutRequest.create({
      user_email: user.email,
      amount: amount,
      status: 'pending',
      payout_method: payout_method,
      payout_details: payout_details
    });

    // Deduct from user's balance
    await base44.asServiceRole.entities.User.update(currentUser.id, {
      total_earnings: availableBalance - amount
    });

    // Notify admin
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: 'robertdavisiv87@gmail.com',
        type: 'admin_alert',
        title: 'New Payout Request',
        message: `${user.email} requested a $${amount.toFixed(2)} payout via ${payout_method}`,
        is_read: false
      });
    } catch (notifError) {
      console.log('Admin notification failed:', notifError.message);
    }

    // Notify user
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: user.email,
        type: 'payout',
        title: 'Payout Request Submitted',
        message: `Your $${amount.toFixed(2)} payout request has been submitted. Admin will process within 24-72 hours.`,
        is_read: false
      });
    } catch (notifError) {
      console.log('User notification failed:', notifError.message);
    }

    return Response.json({
      success: true,
      message: 'Payout request submitted. Admin will process within 24-72 hours.',
      request: payoutRequest
    });

  } catch (error) {
    console.error('Payout request error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});