import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { service_id, requirements = '' } = await req.json();
    
    if (!service_id) {
      return Response.json({ error: 'Service ID required' }, { status: 400 });
    }

    // Get service details
    const services = await base44.asServiceRole.entities.FreelanceService.filter({ 
      id: service_id 
    });
    if (services.length === 0) {
      return Response.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = services[0];
    const totalAmount = service.price_starting;
    const adminCommission = totalAmount * 0.10; // 10% platform fee
    const freelancerEarnings = totalAmount * 0.90; // 90% to freelancer

    // Create service order
    const order = await base44.asServiceRole.entities.ServiceOrder.create({
      service_id: service_id,
      buyer_email: user.email,
      seller_email: service.freelancer_email,
      amount: totalAmount,
      admin_commission: adminCommission,
      status: 'in_progress',
      requirements: requirements
    });

    // Update service stats
    await base44.asServiceRole.entities.FreelanceService.update(service_id, {
      orders_completed: (service.orders_completed || 0) + 1
    });

    // Update freelancer earnings
    const freelancers = await base44.asServiceRole.entities.User.filter({ 
      email: service.freelancer_email 
    });
    if (freelancers.length > 0) {
      const freelancer = freelancers[0];
      await base44.asServiceRole.entities.User.update(freelancer.id, {
        total_earnings: (freelancer.total_earnings || 0) + freelancerEarnings
      });
    }

    // Track admin commission
    await base44.asServiceRole.entities.AdminCommission.create({
      transaction_type: 'service_order',
      reference_id: order.id,
      amount: adminCommission,
      creator_email: service.freelancer_email,
      status: 'completed'
    });

    // Create transaction record
    await base44.asServiceRole.entities.Transaction.create({
      from_email: user.email,
      from_name: user.full_name,
      to_email: service.freelancer_email,
      amount: totalAmount,
      type: 'purchase'
    });

    return Response.json({ 
      success: true, 
      order,
      freelancer_earned: freelancerEarnings,
      admin_commission: adminCommission,
      message: '✅ Service order placed successfully!'
    });

  } catch (error) {
    console.error('Service order processing error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to process service order'
    }, { status: 500 });
  }
});