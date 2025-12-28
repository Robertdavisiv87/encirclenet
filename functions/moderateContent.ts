import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, contentType, contentId, forumId } = await req.json();

    // Get moderation settings
    let settings = [];
    if (forumId) {
      settings = await base44.asServiceRole.entities.ModerationSettings.filter({ forum_id: forumId });
    } else {
      settings = await base44.asServiceRole.entities.ModerationSettings.filter({ creator_email: user.email });
    }

    const moderationSettings = settings[0] || { blocked_keywords: [], auto_flag_enabled: true };

    // Check for blocked keywords
    const contentLower = content.toLowerCase();
    const matchedKeywords = (moderationSettings.blocked_keywords || []).filter(
      keyword => contentLower.includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      // Create flag
      await base44.asServiceRole.entities.ModerationFlag.create({
        content_type: contentType,
        content_id: contentId,
        flag_reason: 'keyword_match',
        matched_keywords: matchedKeywords,
        status: 'pending'
      });

      return Response.json({
        blocked: true,
        reason: 'keyword_match',
        matched_keywords: matchedKeywords
      });
    }

    // AI moderation if enabled
    if (moderationSettings.auto_flag_enabled) {
      try {
        const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyze this content for potential violations. Rate on scale 0-100 how likely this contains:
- Hate speech
- Harassment
- Spam
- Violence
- Explicit content

Content: "${content}"

Return assessment with confidence score and explanation.`,
          response_json_schema: {
            type: "object",
            properties: {
              is_harmful: { type: "boolean" },
              confidence: { type: "number" },
              violation_type: { type: "string" },
              explanation: { type: "string" }
            }
          }
        });

        if (aiResult.is_harmful && aiResult.confidence > 70) {
          // Create AI flag
          await base44.asServiceRole.entities.ModerationFlag.create({
            content_type: contentType,
            content_id: contentId,
            flag_reason: 'ai_flagged',
            ai_confidence: aiResult.confidence,
            ai_explanation: aiResult.explanation,
            status: 'pending'
          });

          return Response.json({
            flagged: true,
            reason: 'ai_flagged',
            confidence: aiResult.confidence,
            explanation: aiResult.explanation,
            require_review: aiResult.confidence > 85
          });
        }
      } catch (error) {
        console.error('AI moderation error:', error);
      }
    }

    return Response.json({
      approved: true,
      message: 'Content passed moderation'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});