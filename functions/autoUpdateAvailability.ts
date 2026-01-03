import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, time_slots, service_vertical } = await req.json();

    if (!date || !time_slots) {
      return Response.json({ error: 'Date and time slots required' }, { status: 400 });
    }

    // Check if availability exists for this date
    const existing = await base44.entities.ProviderAvailability.filter({
      provider_email: user.email,
      service_vertical: service_vertical,
      date: date
    });

    if (existing.length > 0) {
      // Update existing
      await base44.entities.ProviderAvailability.update(existing[0].id, {
        time_slots: time_slots,
        is_available: time_slots.some(slot => slot.available)
      });
    } else {
      // Create new
      await base44.entities.ProviderAvailability.create({
        provider_email: user.email,
        service_vertical: service_vertical,
        date: date,
        time_slots: time_slots,
        is_available: true
      });
    }

    return Response.json({ 
      success: true,
      message: 'Availability updated successfully'
    });

  } catch (error) {
    console.error('Availability update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});