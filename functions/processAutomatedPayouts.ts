import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ 
        success: false,
        error: 'Forbidden: Admin access required',
        error_code: 'ADMIN_REQUIRED'
      }, { status: 403 });
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
      payouts: []
    };

    // Get all users with earnings above threshold
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    
    for (const targetUser of allUsers) {
      try {
        const userEmail = targetUser?.email;
        if (!userEmail) continue;

        const totalEarnings = targetUser?.total_earnings || 0;
        
        if (totalEarnings < threshold) continue;

        results.processed++;

        // Check if user has Stripe account
        const stripeAccountId = targetUser?.stripe_account_id;
        
        if (!stripeAccountId) {
          console.log(`User ${userEmail} has no Stripe account - skipping`);
          results.rejected++;
          results.payouts.push({
            user_email: userEmail,
            success: false,
            error: 'No Stripe account connected',
            error_code: 'NO_STRIPE_ACCOUNT'
          });
          continue;
        }

        // Validate minimum payout
        if (!auto_approve || totalEarnings < 100) {
          console.log(`User ${userEmail} below auto-approve threshold`);
          results.rejected++;
          results.payouts.push({
            user_email: userEmail,
            success: false,
            error: 'Below auto-approve threshold',
            error_code: 'THRESHOLD_NOT_MET',
            amount: totalEarnings
          });
          continue;
        }

        // Check Stripe balance before attempting payout
        let stripeBalance;
        try {
          stripeBalance = await stripe.balance.retrieve({
            stripeAccount: stripeAccountId
          });
        } catch (balanceError) {
          console.error(`Balance check failed for ${userEmail}:`, {
            code: balanceError.code,
            message: balanceError.message
          });
          
          results.rejected++;
          results.payouts.push({
            user_email: userEmail,
            success: false,
            error: balanceError.message,
            error_code: balanceError.code || 'BALANCE_CHECK_FAILED'
          });
          continue;
        }

        const availableBalance = stripeBalance.available[0]?.amount || 0;
        const availableBalanceDollars = availableBalance / 100;

        if (availableBalanceDollars < totalEarnings) {
          console.log(`Insufficient Stripe balance for ${userEmail}: $${availableBalanceDollars} available, $${totalEarnings} requested`);
          results.rejected++;
          results.payouts.push({
            user_email: userEmail,
            success: false,
            error: 'Insufficient Stripe balance',
            error_code: 'INSUFFICIENT_BALANCE',
            available_balance: availableBalanceDollars,
            requested_amount: totalEarnings
          });
          continue;
        }

        // Create Stripe payout
        try {
          const amountInCents = Math.floor(totalEarnings * 100);
          
          const payout = await stripe.payouts.create({
            amount: amountInCents,
            currency: 'usd',
            description: `Encircle Net Automated Payout - ${userEmail}`,
            metadata: {
              user_email: userEmail,
              user_id: targetUser.id
            }
          }, {
            stripeAccount: stripeAccountId
          });

          if (payout.status === 'failed') {
            throw new Error(payout.failure_message || 'Payout failed');
          }

          console.log(`✅ Stripe payout ${payout.id} created for ${userEmail}: $${totalEarnings}`);

          // Update user earnings to 0
          await base44.asServiceRole.entities.User.update(targetUser.id, {
            total_earnings: 0,
            last_payout_date: new Date().toISOString(),
            total_payouts: (targetUser.total_payouts || 0) + totalEarnings
          });

          // Create transaction record
          await base44.asServiceRole.entities.Transaction.create({
            from_email: 'system@encirclenet.net',
            to_email: userEmail,
            type: 'payout',
            amount: totalEarnings,
            status: 'completed',
            metadata: {
              stripe_payout_id: payout.id,
              stripe_account_id: stripeAccountId
            }
          });

          // Notification
          try {
            await base44.asServiceRole.entities.Notification.create({
              user_email: userEmail,
              type: 'payout',
              title: 'Automated Payout Completed',
              message: `$${totalEarnings.toFixed(2)} has been transferred to your bank account.`,
              is_read: false
            });
          } catch (notifError) {
            console.log('Notification skipped:', notifError?.message);
          }

          results.approved++;
          results.payouts.push({
            user_email: userEmail,
            success: true,
            payout_id: payout.id,
            amount: totalEarnings,
            status: payout.status
          });

        } catch (stripeError) {
          console.error(`Stripe payout failed for ${userEmail}:`, {
            code: stripeError.code,
            message: stripeError.message,
            type: stripeError.type
          });
          
          results.rejected++;
          results.payouts.push({
            user_email: userEmail,
            success: false,
            error: stripeError.message,
            error_code: stripeError.code || 'PAYOUT_FAILED',
            error_type: stripeError.type
          });
        }

      } catch (error) {
        console.error(`Error processing user ${targetUser?.email}:`, {
          message: error.message,
          stack: error.stack
        });
        
        results.payouts.push({
          user_email: targetUser?.email || 'unknown',
          success: false,
          error: error.message || 'Unknown error',
          error_code: 'INTERNAL_ERROR'
        });
      }
    }

    return Response.json({
      success: true,
      processed: results.processed,
      approved: results.approved,
      rejected: results.rejected,
      payouts: results.payouts,
      message: `Processed ${results.processed} users. Approved: ${results.approved}, Rejected: ${results.rejected}`
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