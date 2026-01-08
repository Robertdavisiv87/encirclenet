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
      stripe_transfers: 0,
      errors: []
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
        const stripeAccountId = targetUser?.stripe_connect_account_id;
        
        if (!stripeAccountId) {
          console.log(`User ${userEmail} has no Stripe account - skipping`);
          results.rejected++;
          results.errors.push({
            user_email: userEmail,
            error: 'No Stripe account connected'
          });
          continue;
        }

        // Validate minimum payout
        if (!auto_approve || totalEarnings < 100) {
          console.log(`User ${userEmail} below auto-approve threshold`);
          results.rejected++;
          continue;
        }

        // Create Stripe transfer
        try {
          const amountInCents = Math.floor(totalEarnings * 100);
          
          const transfer = await stripe.transfers.create({
            amount: amountInCents,
            currency: 'usd',
            destination: stripeAccountId,
            description: `Encircle Net Payout - ${userEmail}`
          });

          if (!transfer?.id) {
            throw new Error('Stripe transfer failed - no transfer ID returned');
          }

          console.log(`✅ Stripe transfer ${transfer.id} created for ${userEmail}: $${totalEarnings}`);

          // Update user earnings to 0
          await base44.asServiceRole.entities.User.update(targetUser.id, {
            total_earnings: 0
          });

          // Create revenue record
          await base44.asServiceRole.entities.Revenue.create({
            user_email: userEmail,
            source: 'payout',
            amount: -totalEarnings,
            status: 'paid',
            related_id: transfer.id
          });

          // Notification
          try {
            await base44.asServiceRole.entities.Notification.create({
              user_email: userEmail,
              type: 'payout',
              title: 'Payout Completed',
              message: `$${totalEarnings} has been transferred to your Stripe account.`,
              is_read: false
            });
          } catch (notifError) {
            console.log('Notification skipped:', notifError?.message);
          }

          results.approved++;
          results.stripe_transfers++;

        } catch (stripeError) {
          console.error(`Stripe transfer failed for ${userEmail}:`, stripeError);
          results.errors.push({
            user_email: userEmail,
            error: `Stripe error: ${stripeError?.message || 'Unknown error'}`
          });
          results.rejected++;
        }

      } catch (error) {
        console.error(`Error processing user ${targetUser?.email}:`, error);
        results.errors.push({
          user_email: targetUser?.email || 'unknown',
          error: error?.message || 'Unknown error'
        });
      }
    }

    return Response.json({
      success: true,
      processed: results.processed,
      approved: results.approved,
      rejected: results.rejected,
      stripe_transfers: results.stripe_transfers,
      errors: results.errors,
      message: `Processed ${results.processed} users. Successfully transferred $${results.stripe_transfers} payouts via Stripe. Approved: ${results.approved}, Rejected: ${results.rejected}`
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