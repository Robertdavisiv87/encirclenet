import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dispute_id } = await req.json();

    // Get dispute details
    const disputes = await base44.entities.Dispute.filter({ id: dispute_id });
    if (disputes.length === 0) {
      return Response.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const dispute = disputes[0];

    // Get service request details
    const serviceRequests = await base44.asServiceRole.entities.ServiceRequest.filter({ 
      id: dispute.service_request_id 
    });
    const serviceRequest = serviceRequests[0];

    // Get job confirmation if exists
    const confirmations = await base44.asServiceRole.entities.JobConfirmation.filter({ 
      service_request_id: dispute.service_request_id 
    });
    const confirmation = confirmations[0];

    // Build context for AI
    const context = `
Service Type: ${serviceRequest?.service_vertical || 'Unknown'}
Dispute Type: ${dispute.dispute_type}
Filed By: ${dispute.filed_by}
Against: ${dispute.filed_against}
Description: ${dispute.description}
Has Job Confirmation: ${confirmation ? 'Yes' : 'No'}
Photos Uploaded: ${confirmation?.photo_urls?.length || 0}
Customer Verified: ${confirmation?.customer_verified ? 'Yes' : 'No'}
Evidence URLs: ${dispute.evidence_urls?.length || 0} items
    `;

    const prompt = `You are an AI dispute resolution analyst for Encircle Net service marketplace.

Analyze this dispute:
${context}

Provide:
1. Suggested resolution (refund, partial refund, no action, etc.)
2. Confidence score (0-1)
3. Whether human review is required (boolean)
4. Detailed reasoning

Consider:
- Job confirmation evidence
- Communication patterns
- Service completion proof
- Fair outcomes for both parties
- Platform policies

Return JSON with: suggested_resolution, confidence_score, requires_human_review, reasoning`;

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_resolution: { type: "string" },
          confidence_score: { type: "number" },
          requires_human_review: { type: "boolean" },
          reasoning: { type: "string" }
        }
      }
    });

    // Update dispute with AI analysis
    await base44.asServiceRole.entities.Dispute.update(dispute_id, {
      ai_analysis: aiResult,
      status: aiResult.requires_human_review ? 'human_review' : 'ai_reviewing'
    });

    // Send notification to admin if human review needed
    if (aiResult.requires_human_review) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: 'robertdavisiv87@gmail.com',
        type: 'dispute',
        title: 'Dispute Requires Review',
        message: `Dispute #${dispute_id} needs human review. ${aiResult.reasoning}`,
        related_id: dispute_id,
        related_type: 'dispute'
      });
    }

    return Response.json({ 
      success: true, 
      analysis: aiResult 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});