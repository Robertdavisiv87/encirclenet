import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Get user stats
  const stats = await base44.entities.UserStats.filter({ user_email: user.email });
  
  if (stats.length === 0) {
    // Create initial stats with streak
    const newStats = await base44.entities.UserStats.create({
      user_email: user.email,
      points: 0,
      level: 1,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
      posts_count: 0
    });
    
    return Response.json({ 
      current_streak: 1,
      longest_streak: 1,
      streak_started: true 
    });
  }

  const userStat = stats[0];
  const lastActivityDate = userStat.last_activity_date;

  // Check if already logged in today
  if (lastActivityDate === today) {
    return Response.json({ 
      current_streak: userStat.current_streak,
      longest_streak: userStat.longest_streak,
      already_logged_today: true
    });
  }

  // Calculate new streak
  let newStreak = userStat.current_streak || 0;
  
  if (lastActivityDate === yesterday) {
    // Continue streak
    newStreak += 1;
  } else if (!lastActivityDate) {
    // First activity ever
    newStreak = 1;
  } else {
    // Streak broken - restart
    newStreak = 1;
  }

  const newLongestStreak = Math.max(userStat.longest_streak || 0, newStreak);

  // Update stats
  await base44.entities.UserStats.update(userStat.id, {
    current_streak: newStreak,
    longest_streak: newLongestStreak,
    last_activity_date: today
  });

  // Award streak bonus points
  let bonusPoints = 0;
  if (newStreak === 7) bonusPoints = 50;
  if (newStreak === 30) bonusPoints = 200;
  if (newStreak === 100) bonusPoints = 1000;
  if (newStreak % 10 === 0 && newStreak > 0) bonusPoints = 30;

  if (bonusPoints > 0) {
    await base44.entities.UserPoints.create({
      user_email: user.email,
      points: bonusPoints,
      source: 'streak_milestone',
      description: `${newStreak}-day streak milestone`
    });
  }

  return Response.json({ 
    current_streak: newStreak,
    longest_streak: newLongestStreak,
    streak_increased: newStreak > (userStat.current_streak || 0),
    bonus_points: bonusPoints
  });
});