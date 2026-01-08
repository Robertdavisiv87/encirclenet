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

    const results = {
      processed: 0,
      approved: 0,
      rejected: 0,
      payouts: []
    };

    // Dynamic threshold calculation helper
    const calculatePayoutThreshold = (stripeBalance, accountAge) => {
      const balanceDollars = stripeBalance / 100;
      
      // Tiered thresholds based on Stripe balance
      if (balanceDollars >= 500) return 100;  // High balance: $100 min payout
      if (balanceDollars >= 200) return 50;   // Medium balance: $50 min payout
      if (balanceDollars >= 50) return 25;    // Low balance: $25 min payout
      return 10;                              // Very low balance: $10 min payout
    };

    // Get all users with Stripe accounts
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    
    for (const targetUser of allUsers) {
      try {
        const userEmail = targetUser?.email;
        if (!userEmail) continue;

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

        // Check Stripe balance and calculate dynamic threshold
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

        // Skip if no available balance
        if (availableBalance === 0) {
          console.log(`User ${userEmail} has no available Stripe balance`);
          continue;
        }

        // Calculate dynamic threshold based on Stripe balance
        const accountAge = Math.floor((Date.now() - new Date(targetUser.created_date).getTime()) / (1000 * 60 * 60 * 24));
        const dynamicThreshold = calculatePayoutThreshold(availableBalance, accountAge);

        // Check if available balance meets dynamic threshold
        if (availableBalanceDollars < dynamicThreshold) {
          console.log(`User ${userEmail} balance $${availableBalanceDollars} below threshold $${dynamicThreshold}`);
          continue;
        }

        // Payout the exact available balance from Stripe
        const payoutAmount = availableBalanceDollars;

        // Create Stripe payout with available balance
        try {
          const amountInCents = Math.floor(payoutAmount * 100);
          
          const payout = await stripe.payouts.create({
            amount: amountInCents,
            currency: 'usd',
            description: `Encircle Net Auto Payout - ${userEmail}`,
            metadata: {
              user_email: userEmail,
              user_id: targetUser.id,
              threshold_used: dynamicThreshold
            }
          }, {
            stripeAccount: stripeAccountId
          });

          if (payout.status === 'failed') {
            throw new Error(payout.failure_message || 'Payout failed');
          }

          console.log(`✅ Stripe payout ${payout.id} created for ${userEmail}: $${payoutAmount} (threshold: $${dynamicThreshold})`);

          // Update user payout tracking
          await base44.asServiceRole.entities.User.update(targetUser.id, {
            total_earnings: 0,
            last_payout_date: new Date().toISOString(),
            total_payouts: (targetUser.total_payouts || 0) + payoutAmount
          });

          // Create transaction record
          await base44.asServiceRole.entities.Transaction.create({
            from_email: 'system@encirclenet.net',
            to_email: userEmail,
            type: 'payout',
            amount: payoutAmount,
            status: 'completed',
            metadata: {
              stripe_payout_id: payout.id,
              stripe_account_id: stripeAccountId,
              threshold: dynamicThreshold
            }
          });

          // Notification
          try {
            await base44.asServiceRole.entities.Notification.create({
              user_email: userEmail,
              type: 'payout',
              title: 'Automated Payout Completed',
              message: `$${payoutAmount.toFixed(2)} has been transferred to your bank account.`,
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
            amount: payoutAmount,
            threshold: dynamicThreshold,
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