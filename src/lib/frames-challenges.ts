// Profile Frame & Challenge System
// Computed from existing data — no DB schema changes needed

export type FrameTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'admin';

export interface FrameConfig {
  tier: FrameTier;
  label: string;
  labelAr: string;
  borderClass: string;
  glowClass: string;
  badgeEmoji: string;
  minPosts: number;
}

export const FRAME_TIERS: Record<FrameTier, FrameConfig> = {
  none: {
    tier: 'none',
    label: 'Newcomer',
    labelAr: 'مبتدئ',
    borderClass: 'border-border',
    glowClass: '',
    badgeEmoji: '',
    minPosts: 0,
  },
  bronze: {
    tier: 'bronze',
    label: 'Bronze',
    labelAr: 'برونزي',
    borderClass: 'border-amber-700/60',
    glowClass: 'shadow-amber-700/20 shadow-lg',
    badgeEmoji: '🥉',
    minPosts: 1,
  },
  silver: {
    tier: 'silver',
    label: 'Silver',
    labelAr: 'فضي',
    borderClass: 'border-slate-400',
    glowClass: 'shadow-slate-400/30 shadow-lg',
    badgeEmoji: '🥈',
    minPosts: 5,
  },
  gold: {
    tier: 'gold',
    label: 'Gold',
    labelAr: 'ذهبي',
    borderClass: 'border-amber-400',
    glowClass: 'shadow-amber-400/40 shadow-xl',
    badgeEmoji: '🥇',
    minPosts: 15,
  },
  platinum: {
    tier: 'platinum',
    label: 'Platinum',
    labelAr: 'بلاتيني',
    borderClass: 'border-cyan-300',
    glowClass: 'shadow-cyan-300/40 shadow-xl',
    badgeEmoji: '💎',
    minPosts: 20,
  },
  diamond: {
    tier: 'diamond',
    label: 'Diamond',
    labelAr: 'ماسي',
    borderClass: 'border-cyan-400',
    glowClass: 'shadow-cyan-400/40 shadow-xl',
    badgeEmoji: '💎',
    minPosts: 30,
  },
  admin: {
    tier: 'admin',
    label: 'Admin',
    labelAr: 'مشرف',
    borderClass: 'border-amber-500',
    glowClass: 'shadow-amber-500/50 shadow-xl',
    badgeEmoji: '👑',
    minPosts: 0,
  },
};

export function computeFrameTier(postCount: number, totalReactions: number, isAdmin: boolean): FrameTier {
  if (isAdmin) return 'admin';
  if (postCount >= 30 || totalReactions >= 100) return 'diamond';
  if (postCount >= 15 || totalReactions >= 50) return 'gold';
  if (postCount >= 5 || totalReactions >= 20) return 'silver';
  if (postCount >= 1) return 'bronze';
  return 'none';
}

export function getFrameConfig(tier: FrameTier): FrameConfig {
  return FRAME_TIERS[tier];
}

// ========================
// CHALLENGE SYSTEM — Diverse & Premium Rewards
// ========================

export type RewardType = 'frame' | 'name_color' | 'kit' | 'badge' | 'title';

export interface Challenge {
  id: string;
  titleAr: string;
  descriptionAr: string;
  emoji: string;
  target: number;
  category: 'posts' | 'reactions' | 'followers' | 'social' | 'comments';
  rewardType: RewardType;
  rewardAr: string;
  rewardDetail: string; // CSS class or description
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}

export const CHALLENGES: Challenge[] = [
  // === Easy ===
  {
    id: 'first-post',
    titleAr: 'البداية',
    descriptionAr: 'انشر أول قصة فشل لك على المنصة',
    emoji: '🚀',
    target: 1,
    category: 'posts',
    rewardType: 'frame',
    rewardAr: 'إطار برونزي',
    rewardDetail: 'bronze',
    difficulty: 'easy',
  },
  {
    id: 'add-social',
    titleAr: 'متواصل',
    descriptionAr: 'أضف رابط تواصل واحد على الأقل',
    emoji: '🔗',
    target: 1,
    category: 'social',
    rewardType: 'badge',
    rewardAr: 'شارة التواصل',
    rewardDetail: 'خبير التواصل',
    difficulty: 'easy',
  },
  {
    id: 'first-reaction',
    titleAr: 'مفيد!',
    descriptionAr: 'احصل على أول تفاعل "مفيد" على منشورك',
    emoji: '💡',
    target: 1,
    category: 'reactions',
    rewardType: 'badge',
    rewardAr: 'شارة الإلهام',
    rewardDetail: 'ملهم صاعد',
    difficulty: 'easy',
  },

  // === Medium ===
  {
    id: 'five-posts',
    titleAr: 'المثابر',
    descriptionAr: 'انشر 5 منشورات',
    emoji: '📝',
    target: 5,
    category: 'posts',
    rewardType: 'frame',
    rewardAr: 'إطار فضي',
    rewardDetail: 'silver',
    difficulty: 'medium',
  },
  {
    id: 'ten-followers',
    titleAr: 'مؤثر',
    descriptionAr: 'احصل على 10 متابعين',
    emoji: '👥',
    target: 10,
    category: 'followers',
    rewardType: 'name_color',
    rewardAr: 'اسم فضي',
    rewardDetail: 'text-slate-400',
    difficulty: 'medium',
  },
  {
    id: 'twenty-reactions',
    titleAr: 'الملهم',
    descriptionAr: 'احصل على 20 تفاعل إجمالي',
    emoji: '🌟',
    target: 20,
    category: 'reactions',
    rewardType: 'title',
    rewardAr: 'لقب "ملهم المجتمع"',
    rewardDetail: 'ملهم المجتمع',
    difficulty: 'medium',
  },

  // === Hard ===
  {
    id: 'fifteen-posts',
    titleAr: 'المحترف',
    descriptionAr: 'انشر 15 منشور',
    emoji: '🏆',
    target: 15,
    category: 'posts',
    rewardType: 'kit',
    rewardAr: 'طقم ذهبي كامل',
    rewardDetail: 'إطار ذهبي + اسم ذهبي + لقب محترف',
    difficulty: 'hard',
  },
  {
    id: 'fifty-reactions',
    titleAr: 'نجم المنصة',
    descriptionAr: 'احصل على 50 تفاعل إجمالي',
    emoji: '⭐',
    target: 50,
    category: 'reactions',
    rewardType: 'name_color',
    rewardAr: 'اسم ذهبي لامع',
    rewardDetail: 'bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent',
    difficulty: 'hard',
  },
  {
    id: 'twenty-five-followers',
    titleAr: 'قائد',
    descriptionAr: 'احصل على 25 متابع',
    emoji: '🎯',
    target: 25,
    category: 'followers',
    rewardType: 'title',
    rewardAr: 'لقب "قائد الفلوبرز"',
    rewardDetail: 'قائد الفلوبرز',
    difficulty: 'hard',
  },

  // === Legendary ===
  {
    id: 'thirty-posts',
    titleAr: 'الأسطورة',
    descriptionAr: 'انشر 30 منشور',
    emoji: '💎',
    target: 30,
    category: 'posts',
    rewardType: 'kit',
    rewardAr: 'طقم ماسي فاخر',
    rewardDetail: 'إطار ماسي + اسم ماسي متوهج + لقب أسطوري',
    difficulty: 'legendary',
  },
  {
    id: 'hundred-reactions',
    titleAr: 'أيقونة FlopHub',
    descriptionAr: 'احصل على 100 تفاعل إجمالي',
    emoji: '⚡',
    target: 100,
    category: 'reactions',
    rewardType: 'kit',
    rewardAr: 'طقم أسطوري كامل',
    rewardDetail: 'إطار ماسي + اسم متوهج + شارات حصرية + لقب أيقوني',
    difficulty: 'legendary',
  },
  {
    id: 'fifty-followers',
    titleAr: 'أسطورة المتابعين',
    descriptionAr: 'احصل على 50 متابع',
    emoji: '🌐',
    target: 50,
    category: 'followers',
    rewardType: 'kit',
    rewardAr: 'طقم القائد الأعلى',
    rewardDetail: 'إطار ذهبي + اسم ذهبي + لقب ملكي',
    difficulty: 'legendary',
  },
];

export interface ChallengeProgress {
  challenge: Challenge;
  current: number;
  completed: boolean;
  percentage: number;
}

export function computeChallengeProgress(stats: {
  postCount: number;
  totalReactions: number;
  followersCount: number;
  socialLinksCount: number;
}): ChallengeProgress[] {
  return CHALLENGES.map((challenge) => {
    let current = 0;
    switch (challenge.category) {
      case 'posts': current = stats.postCount; break;
      case 'reactions': current = stats.totalReactions; break;
      case 'followers': current = stats.followersCount; break;
      case 'social': current = stats.socialLinksCount; break;
      default: current = 0;
    }

    const capped = Math.min(current, challenge.target);
    return {
      challenge,
      current: capped,
      completed: current >= challenge.target,
      percentage: Math.min((current / challenge.target) * 100, 100),
    };
  });
}

// Difficulty colors for UI
export const DIFFICULTY_CONFIG = {
  easy: { labelAr: 'سهل', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  medium: { labelAr: 'متوسط', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  hard: { labelAr: 'صعب', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  legendary: { labelAr: 'أسطوري', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

// User Appearance based on challenges
export interface UserAppearance {
  frame: FrameTier;
  nameColorClass: string;
  badges: string[];
  title?: string;
}

export function getUserAppearance(challengeStates: { challenge_id: string, status: string }[]): UserAppearance {
  const completedIds = challengeStates
    .filter(s => s.status === 'completed')
    .map(s => s.challenge_id);

  const appearance: UserAppearance = {
    frame: 'none',
    nameColorClass: '',
    badges: [],
  };

  // 1. Determine Frame (Highest priority wins)
  if (completedIds.includes('thirty-posts') || completedIds.includes('hundred-reactions')) {
    appearance.frame = 'diamond';
  } else if (completedIds.includes('popular-20')) {
    appearance.frame = 'platinum';
  } else if (completedIds.includes('fifteen-posts') || completedIds.includes('fifty-followers')) {
    appearance.frame = 'gold';
  } else if (completedIds.includes('five-posts')) {
    appearance.frame = 'silver';
  } else if (completedIds.includes('first-post')) {
    appearance.frame = 'bronze';
  }

  // 2. Determine Name Color
  if (completedIds.includes('hundred-reactions')) {
    appearance.nameColorClass = 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-black drop-shadow-sm';
  } else if (completedIds.includes('fifty-reactions') || completedIds.includes('fifty-followers')) {
    appearance.nameColorClass = 'bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent font-black';
  } else if (completedIds.includes('ten-followers')) {
    appearance.nameColorClass = 'text-slate-400 font-bold';
  }

  // 3. Collect Badges (IDs for icons)
  if (completedIds.includes('add-social')) appearance.badges.push('social_pro');
  if (completedIds.includes('first-reaction')) appearance.badges.push('inspirer');
  if (completedIds.includes('hundred-reactions')) appearance.badges.push('icon');
  if (completedIds.includes('thirty-posts')) appearance.badges.push('legend');

  // 4. Determine Title
  if (completedIds.includes('fifty-followers')) {
    appearance.title = 'القائد الأعلى';
  } else if (completedIds.includes('twenty-five-followers')) {
    appearance.title = 'قائد الفلوبرز';
  } else if (completedIds.includes('twenty-reactions')) {
    appearance.title = 'ملهم المجتمع';
  }

  return appearance;
}
