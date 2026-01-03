import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// This function can be scheduled to run daily to send reminders for upcoming bookings
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find all bookings scheduled for tomorrow that haven't had reminders sent
    const upcomingBookings = await base44.asServiceRole.entities.Booking.filter({
      scheduled_date: tomorrowStr,
      reminder_sent: false,
      booking_status: 'confirmed'
    });

    let remindersSent = 0;

    for (const booking of upcomingBookings) {
      // Send reminder to customer
      await base44.integrations.Core.SendEmail({
        to: booking.customer_email,
        subject: '⏰ Reminder: Your Service Tomorrow',
        body: `
          <h2>Reminder: Your Service is Tomorrow! ⏰</h2>
          
          <p>This is a friendly reminder about your upcoming service:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>📅 Date:</strong> ${booking.scheduled_date}</p>
            <p><strong>🕐 Time:</strong> ${booking.scheduled_time}</p>
            <p><strong>💵 Total:</strong> $${booking.total_price}</p>
          </div>
          
          <p>Your provider will arrive on time. Please ensure someone is available at the scheduled time.</p>
          
          <p>Need to reschedule? Contact us at least 12 hours in advance.</p>
          
          <p>See you tomorrow!</p>
        `
      });

      // Send reminder to provider
      await base44.integrations.Core.SendEmail({
        to: booking.provider_email,
        subject: '📅 Reminder: Service Tomorrow',
        body: `
          <h2>Reminder: You have a service tomorrow! 💼</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>📅 Date:</strong> ${booking.scheduled_date}</p>
            <p><strong>🕐 Time:</strong> ${booking.scheduled_time}</p>
            <p><strong>👤 Customer:</strong> ${booking.customer_email}</p>
            <p><strong>💵 Payout:</strong> $${(booking.total_price * 0.85).toFixed(2)}</p>
          </div>
          
          <p>Please confirm you're ready and arrive on time.</p>
        `
      });

      // Mark reminder as sent
      await base44.asServiceRole.entities.Booking.update(booking.id, {
        reminder_sent: true
      });

      remindersSent++;
    }

    return Response.json({ 
      success: true,
      reminders_sent: remindersSent,
      message: `Sent ${remindersSent} booking reminders`
    });

  } catch (error) {
    console.error('Reminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});