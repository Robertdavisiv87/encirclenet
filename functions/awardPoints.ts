import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const POINTS_MAP = {
  post_created: 10,
  comment_added: 5,
  post_liked: 2,
  event_rsvp: 15,
  event_attended: 25,
  forum_post: 10,
  forum_reply: 5,
  referral_signup: 50,
  profile_completed: 20,
  daily_login: 5,
  streak_milestone: 30
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];
const RANK_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
  diamond: 10000
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { activity_type, related_id, description } = await req.json();

    if (!activity_type || !POINTS_MAP[activity_type]) {
      return Response.json({ error: 'Invalid activity type' }, { status: 400 });
    }

    const points = POINTS_MAP[activity_type];

    // Get or create user points record
    let userPoints = await base44.asServiceRole.entities.UserPoints.filter({ 
      user_email: user.email 
    });
    
    if (userPoints.length === 0) {
      userPoints = await base44.asServiceRole.entities.UserPoints.create({
        user_email: user.email,
        total_points: 0,
        current_level: 1,
        points_this_month: 0,
        streak_days: 0,
        badges_earned: [],
        rank: 'bronze'
      });
    } else {
      userPoints = userPoints[0];
    }

    // Update points
    const newTotal = userPoints.total_points + points;
    const newMonthly = userPoints.points_this_month + points;

    // Calculate new level
    let newLevel = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (newTotal >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
        break;
      }
    }

    // Calculate new rank
    let newRank = 'bronze';
    if (newTotal >= RANK_THRESHOLDS.diamond) newRank = 'diamond';
    else if (newTotal >= RANK_THRESHOLDS.platinum) newRank = 'platinum';
    else if (newTotal >= RANK_THRESHOLDS.gold) newRank = 'gold';
    else if (newTotal >= RANK_THRESHOLDS.silver) newRank = 'silver';

    // Check for level up
    const leveledUp = newLevel > userPoints.current_level;

    // Update user points
    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
      total_points: newTotal,
      points_this_month: newMonthly,
      current_level: newLevel,
      rank: newRank,
      last_active_date: new Date().toISOString().split('T')[0]
    });

    // Log activity
    await base44.asServiceRole.entities.PointsActivity.create({
      user_email: user.email,
      activity_type,
      points_earned: points,
      related_id: related_id || null,
      description: description || `Earned ${points} points for ${activity_type}`
    });

    return Response.json({
      success: true,
      points_earned: points,
      total_points: newTotal,
      level: newLevel,
      rank: newRank,
      leveled_up: leveledUp
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});