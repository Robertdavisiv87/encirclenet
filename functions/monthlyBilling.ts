import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get all active subscriptions due for billing today
    const subscriptions = await base44.asServiceRole.entities.CreatorSubscription.filter({
      status: 'active'
    });

    let processed = 0;
    let failed = 0;
    const results = [];

    for (const sub of subscriptions) {
      try {
        const nextBilling = sub.next_billing_date?.split('T')[0];
        
        if (nextBilling === todayStr) {
          // Create Revenue record for recurring payment
          await base44.asServiceRole.entities.Revenue.create({
            user_email: sub.creator_email,
            source: 'subscription',
            amount: sub.monthly_amount,
            transaction_date: today.toISOString(),
            status: 'pending',
            related_id: sub.id,
            subscriber_email: sub.subscriber_email,
            tier: sub.tier
          });

          // Update next billing date (add 1 month)
          const nextMonth = new Date(today);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          
          await base44.asServiceRole.entities.CreatorSubscription.update(sub.id, {
            next_billing_date: nextMonth.toISOString()
          });

          processed++;
          results.push({ subscription_id: sub.id, status: 'success' });
        }
      } catch (error) {
        failed++;
        results.push({ 
          subscription_id: sub.id, 
          status: 'failed', 
          error: error.message 
        });
      }
    }

    return Response.json({ 
      success: true,
      processed,
      failed,
      results
    });
  } catch (error) {
    console.error('Monthly billing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});