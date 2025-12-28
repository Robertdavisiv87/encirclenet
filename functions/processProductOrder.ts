import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id, quantity = 1 } = await req.json();
    
    if (!product_id) {
      return Response.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Get product details
    const products = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (products.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];
    const totalAmount = product.price * quantity;
    const adminCommission = totalAmount * 0.10; // 10% platform fee
    const creatorEarnings = totalAmount * 0.90; // 90% to creator

    // Create order
    const order = await base44.asServiceRole.entities.ProductOrder.create({
      product_id: product_id,
      buyer_email: user.email,
      seller_email: product.creator_email,
      quantity: quantity,
      total_amount: totalAmount,
      platform_commission: adminCommission,
      status: 'completed'
    });

    // Update product sales count
    await base44.asServiceRole.entities.Product.update(product_id, {
      sales_count: (product.sales_count || 0) + quantity
    });

    // Update creator earnings
    const creators = await base44.asServiceRole.entities.User.filter({ 
      email: product.creator_email 
    });
    if (creators.length > 0) {
      const creator = creators[0];
      await base44.asServiceRole.entities.User.update(creator.id, {
        total_earnings: (creator.total_earnings || 0) + creatorEarnings
      });
    }

    // Track admin commission
    await base44.asServiceRole.entities.AdminCommission.create({
      transaction_type: 'product_sale',
      reference_id: order.id,
      amount: adminCommission,
      creator_email: product.creator_email,
      status: 'completed'
    });

    // Create transaction record
    await base44.asServiceRole.entities.Transaction.create({
      from_email: user.email,
      from_name: user.full_name,
      to_email: product.creator_email,
      amount: totalAmount,
      type: 'purchase'
    });

    return Response.json({ 
      success: true, 
      order,
      creator_earned: creatorEarnings,
      admin_commission: adminCommission,
      message: '✅ Purchase completed successfully!'
    });

  } catch (error) {
    console.error('Product order processing error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to process order'
    }, { status: 500 });
  }
});