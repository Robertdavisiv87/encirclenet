import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { 
      user_email, 
      type, 
      title, 
      message, 
      from_user, 
      from_user_name,
      related_id,
      related_type,
      link 
    } = await req.json();

    if (!user_email || !type || !title || !message) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Create notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      user_email,
      type,
      title,
      message,
      from_user,
      from_user_name,
      related_id,
      related_type,
      is_read: false,
      link
    });

    return Response.json({ 
      success: true, 
      notification 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});