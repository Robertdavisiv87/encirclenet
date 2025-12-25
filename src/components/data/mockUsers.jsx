// Generate 1000 unique user profiles for EncircleNet
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Cameron', 'Sage', 'Blake', 'River', 'Skylar', 'Dakota', 'Parker', 'Reese', 'Charlie', 'Finley', 'Rowan', 'Kendall'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Davis', 'Rodriguez', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Lee'];

const tiers = ['free', 'pro', 'elite'];
const bios = [
  'Fitness enthusiast 💪 | Sharing my wellness journey',
  'Nutrition coach 🥗 | Helping you eat better',
  'Professional athlete 🏃 | Inspiring healthy lifestyles',
  'Career coach 💼 | Helping professionals level up',
  'Entrepreneur 🚀 | Building dreams daily',
  'Health advocate 🌱 | Mind, body, soul',
  'Personal trainer 🏋️ | Transform your body',
  'Yoga instructor 🧘 | Finding inner peace',
  'Chef & foodie 👨‍🍳 | Healthy cooking made easy',
  'Corporate wellness expert 💼 | Work-life balance',
];

export function generateMockUsers(count = 1000) {
  const users = [];
  
  // Real profile photo IDs from Unsplash (diverse, professional headshots)
  const profilePhotoIds = [
    'rDEOVtE7vOs', 'ILip77SbmOE', '6anudmpILw4', 'sibVwORYqs0', 'mEZ3PoFGs_k',
    'WNoLnJo7tS8', 'd2MSDujJl2g', 'pAtA8xe_iVM', '7YVZYZeITc8', 'ZHvM3XIOHoE',
    'jmURdhtm7Ng', 'qCrocisvGwc', 'L1ZhjK-R6p4', 'jztjlOyKBOY', 'N390KQdCGWY',
    'vpOeXr5wmR4', '2_3c4dIFYFU', 'mTkXSSScrzw', 'w2DsS-ZAP4U', 'c_GmwfHBDzk'
  ];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const tierWeights = { free: 0.6, pro: 0.3, elite: 0.1 };
    const actualTier = Math.random() < tierWeights.free ? 'free' : Math.random() < 0.75 ? 'pro' : 'elite';
    
    // Cycle through real profile photos
    const photoId = profilePhotoIds[i % profilePhotoIds.length];
    const avatarUrl = `https://images.unsplash.com/photo-${photoId}?w=200&h=200&fit=crop&crop=faces`;
    
    users.push({
      id: `user_${i + 1}`,
      full_name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@encirclenet.com`,
      avatar: avatarUrl,
      bio: bios[Math.floor(Math.random() * bios.length)],
      tier: actualTier,
      followers: Math.floor(Math.random() * 10000) + 100,
      posts_count: Math.floor(Math.random() * 500) + 10,
      circles_joined: Math.floor(Math.random() * 20) + 1,
      total_earned: Math.floor(Math.random() * 5000) + 50,
    });
  }
  
  return users;
}

export const mockUsers = generateMockUsers(1000);