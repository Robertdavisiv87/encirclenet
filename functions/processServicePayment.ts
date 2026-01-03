import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id, payment_method } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Get booking
    const bookings = await base44.entities.Booking.filter({ id: booking_id });
    if (bookings.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookings[0];

    // Simulate payment authorization (would integrate with Stripe in production)
    // In production: Create Stripe PaymentIntent, authorize payment, store intent ID
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update booking with payment authorization
    await base44.entities.Booking.update(booking.id, {
      payment_status: 'authorized',
      payment_intent_id: paymentIntentId
    });

    // Create transaction record (held until service completion)
    await base44.entities.Transaction.create({
      type: 'service_payment',
      from_email: booking.customer_email,
      from_name: user.full_name,
      to_email: booking.provider_email,
      to_name: booking.provider_email,
      amount: booking.total_price,
      status: 'held',
      related_id: booking.id,
      related_type: 'booking'
    });

    return Response.json({ 
      success: true,
      payment_intent_id: paymentIntentId,
      message: 'Payment authorized. Will be charged after service completion.'
    });

  } catch (error) {
    console.error('Payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});