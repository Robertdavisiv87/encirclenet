import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Get booking details
    const bookings = await base44.entities.Booking.filter({ id: booking_id });
    if (bookings.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookings[0];

    // Send confirmation email to customer
    await base44.integrations.Core.SendEmail({
      to: booking.customer_email,
      subject: '✅ Booking Confirmed - EncircleNet Services',
      body: `
        <h2>Your Service Booking is Confirmed! 🎉</h2>
        
        <p>Hi there!</p>
        
        <p>Your booking has been successfully confirmed. Here are the details:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>📅 Date:</strong> ${booking.scheduled_date}</p>
          <p><strong>🕐 Time:</strong> ${booking.scheduled_time}</p>
          <p><strong>💵 Total:</strong> $${booking.total_price}</p>
          <p><strong>📍 Status:</strong> ${booking.booking_status}</p>
        </div>
        
        <p>Your provider will contact you 24 hours before the appointment.</p>
        
        <p><strong>Payment Status:</strong> Payment authorized - will be charged after service completion.</p>
        
        <p>Questions? Reply to this email or contact support.</p>
        
        <p>Thank you for using EncircleNet!</p>
      `
    });

    // Send notification to provider
    await base44.integrations.Core.SendEmail({
      to: booking.provider_email,
      subject: '🔔 New Booking - EncircleNet Services',
      body: `
        <h2>You have a new booking! 💼</h2>
        
        <p>A customer has booked your services:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>📅 Date:</strong> ${booking.scheduled_date}</p>
          <p><strong>🕐 Time:</strong> ${booking.scheduled_time}</p>
          <p><strong>💵 Payout:</strong> $${(booking.total_price * 0.85).toFixed(2)} (85% after completion)</p>
          <p><strong>👤 Customer:</strong> ${booking.customer_email}</p>
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Review booking details in your dashboard</li>
          <li>Contact customer 24h before appointment</li>
          <li>Complete service and upload confirmation</li>
        </ul>
        
        <p>Payment will be released after customer verification.</p>
      `
    });

    // Update booking confirmation status
    await base44.entities.Booking.update(booking.id, {
      confirmation_sent: true
    });

    // Create notification
    await base44.entities.Notification.create({
      user_email: booking.customer_email,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your ${booking.service_vertical} service is confirmed for ${booking.scheduled_date} at ${booking.scheduled_time}`,
      from_user: 'system',
      from_user_name: 'EncircleNet',
      related_id: booking.id,
      related_type: 'booking'
    });

    return Response.json({ 
      success: true, 
      message: 'Confirmation sent to customer and provider' 
    });

  } catch (error) {
    console.error('Confirmation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});