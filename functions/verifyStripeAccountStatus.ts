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
        error: 'Forbidden: Admin access required'
      }, { status: 403 });
    }

    const results = {
      checked: 0,
      healthy: 0,
      issues: 0,
      accounts: []
    };

    // Get all users with Stripe accounts
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const usersWithStripe = allUsers.filter(u => u.stripe_account_id);

    console.log(`Checking ${usersWithStripe.length} Stripe accounts...`);

    for (const targetUser of usersWithStripe) {
      results.checked++;
      const userEmail = targetUser.email;
      const stripeAccountId = targetUser.stripe_account_id;

      try {
        // Retrieve full account details from Stripe
        const account = await stripe.accounts.retrieve(stripeAccountId);

        const accountStatus = {
          user_email: userEmail,
          account_id: stripeAccountId,
          healthy: true,
          issues: [],
          details: {
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted
          }
        };

        // Check for issues
        if (!account.payouts_enabled) {
          accountStatus.healthy = false;
          accountStatus.issues.push('Payouts disabled');
        }

        if (!account.charges_enabled) {
          accountStatus.healthy = false;
          accountStatus.issues.push('Charges disabled');
        }

        if (!account.details_submitted) {
          accountStatus.healthy = false;
          accountStatus.issues.push('Account details incomplete');
        }

        // Check for restrictions
        if (account.requirements?.disabled_reason) {
          accountStatus.healthy = false;
          accountStatus.issues.push(`Disabled: ${account.requirements.disabled_reason}`);
        }

        // Check for currently due requirements
        if (account.requirements?.currently_due?.length > 0) {
          accountStatus.healthy = false;
          accountStatus.issues.push(`Requirements due: ${account.requirements.currently_due.join(', ')}`);
        }

        // Check for eventually due requirements (warning)
        if (account.requirements?.eventually_due?.length > 0) {
          accountStatus.issues.push(`Future requirements: ${account.requirements.eventually_due.join(', ')}`);
        }

        // Update user record with status
        const statusValue = accountStatus.healthy ? 'active' : 'issues_detected';
        await base44.asServiceRole.entities.User.update(targetUser.id, {
          stripe_account_status: statusValue,
          stripe_account_issues: accountStatus.issues.length > 0 ? accountStatus.issues.join(' | ') : null,
          stripe_status_last_checked: new Date().toISOString()
        });

        if (accountStatus.healthy) {
          results.healthy++;
          console.log(`✅ Account healthy: ${userEmail}`);
        } else {
          results.issues++;
          console.log(`⚠️ Issues detected for ${userEmail}: ${accountStatus.issues.join(', ')}`);

          // Notify user about issues
          try {
            await base44.asServiceRole.entities.Notification.create({
              user_email: userEmail,
              type: 'account_issue',
              title: 'Stripe Account Requires Attention',
              message: `Your payout account has issues that need to be resolved: ${accountStatus.issues.join(', ')}. Please update your account in Settings → Payout Settings.`,
              is_read: false
            });
          } catch (notifError) {
            console.log('User notification failed:', notifError.message);
          }

          // Notify admin
          try {
            await base44.asServiceRole.entities.Notification.create({
              user_email: 'robertdavisiv87@gmail.com',
              type: 'admin_alert',
              title: 'User Stripe Account Issue Detected',
              message: `User ${userEmail} has Stripe account issues: ${accountStatus.issues.join(', ')}`,
              is_read: false
            });
          } catch (adminNotifError) {
            console.log('Admin notification failed:', adminNotifError.message);
          }
        }

        results.accounts.push(accountStatus);

      } catch (error) {
        console.error(`Failed to check account for ${userEmail}:`, error.message);
        
        results.issues++;
        results.accounts.push({
          user_email: userEmail,
          account_id: stripeAccountId,
          healthy: false,
          issues: [`Check failed: ${error.message}`],
          error: error.message
        });

        // Update user with error status
        await base44.asServiceRole.entities.User.update(targetUser.id, {
          stripe_account_status: 'check_failed',
          stripe_account_issues: error.message,
          stripe_status_last_checked: new Date().toISOString()
        });
      }
    }

    return Response.json({
      success: true,
      checked: results.checked,
      healthy: results.healthy,
      issues: results.issues,
      accounts: results.accounts,
      message: `Checked ${results.checked} accounts. ${results.healthy} healthy, ${results.issues} with issues.`
    });

  } catch (error) {
    console.error('Stripe account verification error:', error);
    return Response.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
});