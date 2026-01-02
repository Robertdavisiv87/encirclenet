import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription_id, action, user_email, creator_email, monthly_amount } = await req.json();

    // Admin gets free subscriptions
    if (user_email === 'robertdavisiv87@gmail.com') {
      return Response.json({ 
        success: true, 
        message: 'Admin subscription granted free',
        free_subscription: true
      });
    }

    if (action === 'create') {
      // Auto-create Revenue when subscription is created
      const subscription = await base44.entities.CreatorSubscription.filter({ id: subscription_id });
      
      if (subscription.length > 0) {
        const sub = subscription[0];
        
        // Calculate platform commission (10%)
        const platformCommission = sub.monthly_amount * 0.1;
        
        // Record admin commission
        await base44.asServiceRole.entities.AdminCommission.create({
          transaction_type: 'subscription',
          reference_id: sub.id,
          amount: platformCommission,
          creator_email: sub.creator_email,
          status: 'completed'
        });
        
        // Create Revenue record
        await base44.asServiceRole.entities.Revenue.create({
          user_email: sub.creator_email,
          source: 'subscription',
          amount: sub.monthly_amount,
          transaction_date: new Date().toISOString(),
          status: 'pending',
          related_id: sub.id,
          subscriber_email: sub.subscriber_email,
          tier: sub.tier
        });

        // Check if referral exists and mark as completed
        const referrals = await base44.asServiceRole.entities.Referral.filter({
          referred_email: sub.subscriber_email,
          status: 'pending'
        });

        if (referrals.length > 0) {
          await base44.asServiceRole.entities.Referral.update(referrals[0].id, {
            status: 'completed',
            conversion_date: new Date().toISOString()
          });
        }

        return Response.json({ 
          success: true, 
          message: 'Revenue record created and referral updated' 
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Subscription processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});