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
      'graphic_design': 'trending graphic design services',
      'logo_design': 'professional logo design services',
      'web_design': 'web design and development services',
      'uiux_design': 'UI/UX design services',
      'mobile_app_dev': 'mobile app development services',
      'wordpress_dev': 'WordPress development services',
      'shopify_dev': 'Shopify store setup services',
      'ecommerce': 'e-commerce development services',
      'seo': 'SEO optimization services',
      'content_writing': 'content writing services',
      'copywriting': 'copywriting services',
      'video_editing': 'video editing services',
      'social_media_mgmt': 'social media management services',
      'virtual_assistant': 'virtual assistant services',
      'all': 'top trending freelance services across all categories'
    };

    const searchQuery = categoryPrompts[category] || categoryPrompts['all'];

    const prompt = `Find the latest ${searchQuery} currently available on platforms like Fiverr, Upwork, Freelancer.com, Toptal, and other major freelance marketplaces.

For each service, provide:
- freelancer_name: Professional name
- service_title: Clear service title
- description: Brief 2-3 sentence description of what's offered
- category: One of: graphic_design, logo_design, web_design, uiux_design, mobile_app_dev, wordpress_dev, shopify_dev, ecommerce, seo, content_writing, copywriting, blog_writing, technical_writing, social_media_mgmt, social_media_marketing, email_marketing, digital_marketing, video_editing, animation, voiceover, translation, proofreading, virtual_assistant, data_entry, illustration, photography, podcast_editing, 3d_modeling, game_dev, ai_automation
- price_starting: Starting price in USD
- delivery_days: Typical delivery time
- rating: Rating out of 5
- reviews_count: Number of reviews
- orders_completed: Number of completed orders
- platform_source: Platform name (Fiverr, Upwork, etc)
- external_url: Direct service URL
- tags: Array of 3-5 relevant skill tags

Return 20 diverse, high-quality freelance services that are actively offered.`;

    const services = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          services: {
            type: "array",
            items: {
              type: "object",
              properties: {
                freelancer_name: { type: "string" },
                service_title: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                price_starting: { type: "number" },
                delivery_days: { type: "number" },
                rating: { type: "number" },
                reviews_count: { type: "number" },
                orders_completed: { type: "number" },
                platform_source: { type: "string" },
                external_url: { type: "string" },
                tags: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    return Response.json({ services: services.services || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});