import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data } = await req.json();
    const { product_id, user_email, sale_amount } = data;

    // Update product sales count
    const products = await base44.asServiceRole.entities.TechProduct.filter({ id: product_id });
    if (products.length > 0) {
      const product = products[0];
      await base44.asServiceRole.entities.TechProduct.update(product_id, {
        sales_count: (product.sales_count || 0) + 1
      });

      // Create admin commission record
      const adminCommission = sale_amount * (product.admin_commission_rate || 2) / 100;
      await base44.asServiceRole.entities.AdminCommission.create({
        transaction_type: 'affiliate_sale',
        user_email: user_email,
        transaction_id: product_id,
        transaction_amount: sale_amount,
        commission_rate: product.admin_commission_rate || 2,
        commission_amount: adminCommission,
        status: 'completed',
        metadata: {
          product_name: product.product_name,
          platform: product.platform
        }
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});