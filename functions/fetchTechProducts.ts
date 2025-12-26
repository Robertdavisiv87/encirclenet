import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data } = await req.json();
    const category = data?.category || 'all';

    const categoryPrompts = {
      'smartphones': 'trending smartphones and mobile devices',
      'laptops': 'best selling laptops and computers',
      'tablets': 'popular tablets and iPads',
      'smartwatches': 'top smartwatches and fitness trackers',
      'headphones': 'trending headphones and earbuds',
      'cameras': 'best cameras and photography equipment',
      'gaming': 'gaming consoles, accessories and equipment',
      'accessories': 'tech accessories and gadgets',
      'all': 'top trending tech products across all categories'
    };

    const searchQuery = categoryPrompts[category] || categoryPrompts['all'];

    const prompt = `Find the latest ${searchQuery} currently available on major platforms like Amazon, Best Buy, Newegg, B&H Photo, and other major tech retailers.

For each product, provide:
- product_name: Full product name
- description: Brief 2-3 sentence description highlighting key features
- price: Current price in USD (number only)
- original_price: Original price before discount if on sale
- image_url: Use a realistic product image URL from unsplash or similar (actual tech product images)
- category: One of: smartphones, laptops, tablets, smartwatches, headphones, cameras, gaming, accessories
- platform: Retailer name (Amazon, Best Buy, etc)
- product_url: Direct product purchase URL
- rating: Product rating out of 5
- reviews_count: Number of reviews
- is_trending: true if it's a hot/trending item

Return 20 diverse, real tech products that are currently in high demand and trending.`;

    const products = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product_name: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                original_price: { type: "number" },
                image_url: { type: "string" },
                category: { type: "string" },
                platform: { type: "string" },
                product_url: { type: "string" },
                rating: { type: "number" },
                reviews_count: { type: "number" },
                is_trending: { type: "boolean" }
              }
            }
          }
        }
      }
    });

    // Save products to database with affiliate links
    const productsToSave = products.products.map(p => ({
      ...p,
      affiliate_url: `${p.product_url}?ref=encirclenet_${Date.now()}`,
      affiliate_commission_rate: 5,
      admin_commission_rate: 2,
      sales_count: 0
    }));

    // Save to database
    for (const product of productsToSave) {
      await base44.asServiceRole.entities.TechProduct.create(product);
    }

    return Response.json({ products: productsToSave });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});