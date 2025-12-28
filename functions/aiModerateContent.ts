import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, content_type, content_id } = await req.json();

    if (!content || !content_type || !content_id) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Use AI to analyze content for policy violations
    const moderationResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderation AI. Analyze the following content for policy violations.

Content to moderate: "${content}"

Check for:
1. Hate speech or discrimination (racism, sexism, homophobia, etc.)
2. Violence or threats
3. Spam or repetitive content
4. Illegal activities or substances
5. Explicit sexual content
6. Harassment or bullying
7. Misinformation or scams

Respond with a strict JSON object (no markdown):`,
      response_json_schema: {
        type: "object",
        properties: {
          is_violation: { type: "boolean" },
          confidence: { type: "number" },
          violation_types: { 
            type: "array",
            items: { type: "string" }
          },
          explanation: { type: "string" },
          severity: { 
            type: "string",
            enum: ["low", "medium", "high", "critical"]
          }
        },
        required: ["is_violation", "confidence", "violation_types", "explanation", "severity"]
      }
    });

    const result = moderationResult;

    // If violation detected with high confidence, create a flag and hide post
    if (result.is_violation && result.confidence >= 0.7) {
      await base44.asServiceRole.entities.ModerationFlag.create({
        content_type: content_type,
        content_id: content_id,
        flag_reason: 'ai_flagged',
        ai_confidence: Math.round(result.confidence * 100),
        ai_explanation: result.explanation,
        matched_keywords: result.violation_types,
        status: result.severity === 'critical' ? 'removed' : 'pending'
      });

      // Update post moderation status based on severity
      if (content_type === 'post') {
        const posts = await base44.asServiceRole.entities.Post.filter({ id: content_id });
        if (posts[0]) {
          if (result.severity === 'critical') {
            // Auto-reject critical violations
            await base44.asServiceRole.entities.Post.update(content_id, {
              moderation_status: 'rejected'
            });
          } else {
            // Queue for manual review
            await base44.asServiceRole.entities.Post.update(content_id, {
              moderation_status: 'pending_review'
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      moderation: result
    });

  } catch (error) {
    console.error('Moderation error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});