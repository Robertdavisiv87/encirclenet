import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to_email, amount, post_id } = await req.json();
    
    if (!to_email || !amount || amount <= 0) {
      return Response.json({ error: 'Invalid tip data' }, { status: 400 });
    }

    // Create transaction record
    const transaction = await base44.entities.Transaction.create({
      from_email: user.email,
      from_name: user.full_name,
      to_email: to_email,
      amount: amount,
      type: 'tip',
      post_id: post_id || null
    });

    // Calculate admin commission (10%)
    const adminCommission = amount * 0.10;
    const creatorEarnings = amount * 0.90;

    // Update recipient's total earnings
    const recipients = await base44.asServiceRole.entities.User.filter({ email: to_email });
    if (recipients.length > 0) {
      const recipient = recipients[0];
      await base44.asServiceRole.entities.User.update(recipient.id, {
        total_earnings: (recipient.total_earnings || 0) + creatorEarnings
      });
    }

    // Track admin commission
    await base44.asServiceRole.entities.AdminCommission.create({
      transaction_type: 'tip',
      reference_id: transaction.id,
      amount: adminCommission,
      creator_email: to_email,
      status: 'completed'
    });

    // Update post tips if post_id provided
    if (post_id) {
      const posts = await base44.asServiceRole.entities.Post.filter({ id: post_id });
      if (posts.length > 0) {
        const post = posts[0];
        await base44.asServiceRole.entities.Post.update(post_id, {
          tips_received: (post.tips_received || 0) + amount
        });
      }
    }

    return Response.json({ 
      success: true, 
      transaction,
      creator_earned: creatorEarnings,
      admin_commission: adminCommission
    });

  } catch (error) {
    console.error('Tip processing error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to process tip'
    }, { status: 500 });
  }
});