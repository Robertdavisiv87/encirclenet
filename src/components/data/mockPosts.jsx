import { mockUsers } from './mockUsers';

const postTypes = ['photo', 'video', 'text', 'voice'];
const contentThemes = {
  workout: [
    'Morning cardio session 🏃',
    '100 pushup challenge completed! 💪',
    'Leg day is the best day 🦵',
    'HIIT workout that changed my life',
    'Yoga flow for flexibility 🧘',
    'Core strength routine',
  ],
  nutrition: [
    'Meal prep Sunday done right 🥗',
    'High protein breakfast recipe',
    'Smoothie bowl perfection 🥤',
    'Healthy snack ideas for busy professionals',
    'My favorite post-workout meal',
    'Plant-based protein sources',
  ],
  professional: [
    'Just closed my biggest deal! 💼',
    'Morning routine of successful people',
    'Productivity tips that actually work',
    'Work from home setup tour',
    'Career milestone achieved 🎯',
    'Networking tips for introverts',
  ],
  wellness: [
    'Self-care Sunday routine ✨',
    'Mental health check-in',
    'Meditation changed my life 🧘',
    'Better sleep habits for better life',
    'Stress management techniques',
    'Work-life balance tips',
  ],
};

const hashtags = {
  workout: ['#HealthyLiving', '#WorkoutGoals', '#FitnessJourney', '#GymLife', '#CircleConnections'],
  nutrition: ['#HealthyEating', '#NutritionTips', '#MealPrep', '#HealthyLifestyle', '#CircleConnections'],
  professional: ['#ProfessionalFlex', '#CareerGoals', '#Entrepreneur', '#Success', '#CircleConnections'],
  wellness: ['#SelfCare', '#MentalHealth', '#Wellness', '#Mindfulness', '#CircleConnections'],
};

const mediaUrls = {
  workout: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=600&fit=crop',
  ],
  nutrition: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&h=600&fit=crop',
  ],
  professional: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop',
  ],
  wellness: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop',
  ],
};

function getRandomTheme() {
  const themes = Object.keys(contentThemes);
  return themes[Math.floor(Math.random() * themes.length)];
}

function generatePost(index, user) {
  const theme = getRandomTheme();
  const captions = contentThemes[theme];
  const themeHashtags = hashtags[theme];
  const themeMedia = mediaUrls[theme];
  
  const contentType = postTypes[Math.floor(Math.random() * postTypes.length)];
  const caption = captions[Math.floor(Math.random() * captions.length)];
  const tags = themeHashtags.slice(0, Math.floor(Math.random() * 3) + 2);
  
  const likes = Math.floor(Math.random() * 5000) + (user.tier === 'elite' ? 1000 : user.tier === 'pro' ? 500 : 0);
  const comments = Math.floor(likes * 0.1);
  const tips = Math.floor(Math.random() * 100) + (user.tier === 'elite' ? 50 : 0);
  
  return {
    id: `post_${index + 1}`,
    content_type: contentType === 'video' || contentType === 'photo' ? contentType : 'photo',
    media_url: contentType === 'video' || contentType === 'photo' ? themeMedia[Math.floor(Math.random() * themeMedia.length)] : null,
    caption,
    author_name: user.full_name,
    author_avatar: user.avatar,
    created_by: user.email,
    likes_count: likes,
    comments_count: comments,
    tips_received: tips,
    tags,
    is_raw_mode: false,
    theme,
    user_tier: user.tier,
    created_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function generateMockPosts(count = 1000) {
  const posts = [];
  
  for (let i = 0; i < count; i++) {
    const user = mockUsers[i % mockUsers.length];
    posts.push(generatePost(i, user));
  }
  
  // Sort by engagement (likes + comments + tips)
  return posts.sort((a, b) => {
    const engagementA = a.likes_count + a.comments_count + a.tips_received;
    const engagementB = b.likes_count + b.comments_count + b.tips_received;
    return engagementB - engagementA;
  });
}

export const mockPosts = generateMockPosts(1000);