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

    const results = {
      processed: 0,
      transferred: 0,
      skipped: 0,
      errors: 0,
      details: []
    };

    // Get all users with earnings
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    
    for (const targetUser of allUsers) {
      try {
        const userEmail = targetUser?.email;
        const totalEarnings = targetUser?.total_earnings || 0;
        
        if (!userEmail || totalEarnings <= 0) {
          continue;
        }

        results.processed++;

        // Check if user has Stripe account connected
        const stripeAccountId = targetUser?.stripe_account_id;
        
        if (!stripeAccountId) {
          results.skipped++;
          results.details.push({
            email: userEmail,
            status: 'skipped',
            reason: 'No Stripe account connected',
            balance: totalEarnings
          });
          continue;
        }

        // Transfer the current balance to their Stripe account
        try {
          const transfer = await stripe.transfers.create({
            amount: Math.round(totalEarnings * 100),
            currency: 'usd',
            destination: stripeAccountId,
            description: `Balance sync for ${userEmail}`,
            metadata: {
              user_email: userEmail,
              user_id: targetUser.id,
              type: 'balance_sync'
            }
          });

          console.log(`✅ Transferred $${totalEarnings} to ${userEmail}'s Stripe account`);
          
          results.transferred++;
          results.details.push({
            email: userEmail,
            status: 'success',
            amount: totalEarnings,
            transfer_id: transfer.id
          });

        } catch (transferError) {
          console.error(`❌ Transfer failed for ${userEmail}:`, {
            code: transferError.code,
            message: transferError.message
          });
          
          results.errors++;
          results.details.push({
            email: userEmail,
            status: 'error',
            error: transferError.message,
            error_code: transferError.code,
            balance: totalEarnings
          });
        }

      } catch (error) {
        console.error(`Error processing user ${targetUser?.email}:`, error.message);
        results.errors++;
      }
    }

    return Response.json({
      success: true,
      processed: results.processed,
      transferred: results.transferred,
      skipped: results.skipped,
      errors: results.errors,
      details: results.details,
      message: `Synced balances to Stripe. Transferred: ${results.transferred}, Skipped: ${results.skipped}, Errors: ${results.errors}`
    });

  } catch (error) {
    console.error('Balance sync error:', error);
    return Response.json({ 
      success: false,
      error: error?.message || 'Unknown error occurred',
      stack: error?.stack
    }, { status: 500 });
  }
});