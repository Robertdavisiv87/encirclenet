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
      'customer_service': 'remote customer service jobs',
      'healthcare': 'remote healthcare and medical jobs',
      'it_helpdesk': 'remote IT help desk and technical support jobs',
      'cloud_infrastructure': 'remote cloud infrastructure and DevOps jobs',
      'admin': 'remote administrative and office jobs',
      'freelance': 'freelance and contract remote jobs',
      'all': 'top remote work from home jobs across all categories'
    };

    const searchQuery = categoryPrompts[category] || categoryPrompts['all'];

    const prompt = `Find the latest ${searchQuery} currently available.

For each job, provide:
- job_title: The position title
- company: Company name
- location: Remote location info (e.g., "Remote - US", "Remote - Worldwide")
- job_type: Full-time, Part-time, Contract, or Freelance
- salary_range: Estimated salary range or "Competitive"
- description: 2-3 sentence job description
- requirements: Key requirements (2-3 items)
- apply_url: Leave empty - we'll generate search URLs
- posted_date: "Recently posted"
- category: One of: customer_service, healthcare, it_helpdesk, cloud_infrastructure, admin, freelance, general

Return 20 diverse remote job listings.`;

    const jobs = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          jobs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                job_title: { type: "string" },
                company: { type: "string" },
                location: { type: "string" },
                job_type: { type: "string" },
                salary_range: { type: "string" },
                description: { type: "string" },
                requirements: { type: "array", items: { type: "string" } },
                apply_url: { type: "string" },
                posted_date: { type: "string" },
                category: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Generate working search URLs for each job
    const jobsWithUrls = (jobs.jobs || []).map(job => ({
      ...job,
      apply_url: `https://www.google.com/search?q=${encodeURIComponent(`${job.job_title} at ${job.company} remote job application`)}`
    }));

    return Response.json({ jobs: jobsWithUrls });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});