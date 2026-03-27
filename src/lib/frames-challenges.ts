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
    borderClass: 'border-amber-700/60 ring-1 ring-amber-700/20',
    glowClass: 'shadow-[0_0_10px_rgba(180,83,9,0.2)]',
    badgeEmoji: '🥉',
    minPosts: 1,
  },
  silver: {
    tier: 'silver',
    label: 'Silver',
    labelAr: 'فضي',
    borderClass: 'border-slate-400 ring-2 ring-slate-400/20',
    glowClass: 'shadow-[0_0_15px_rgba(148,163,184,0.3)]',
    badgeEmoji: '🥈',
    minPosts: 5,
  },
  gold: {
    tier: 'gold',
    label: 'Gold',
    labelAr: 'ذهبي',
    borderClass: 'border-amber-400 ring-2 ring-amber-400/30',
    glowClass: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    badgeEmoji: '🥇',
    minPosts: 15,
  },
  platinum: {
    tier: 'platinum',
    label: 'Platinum',
    labelAr: 'بلاتيني',
    borderClass: 'border-cyan-300 ring-2 ring-cyan-300/40',
    glowClass: 'shadow-[0_0_25px_rgba(103,232,249,0.4)] transition-all animate-pulse',
    badgeEmoji: '💎',
    minPosts: 20,
  },
  diamond: {
    tier: 'diamond',
    label: 'Diamond',
    labelAr: 'ماسي',
    borderClass: 'border-cyan-400 border-[3px] ring-4 ring-cyan-400/20',
    glowClass: 'shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-shimmer',
    badgeEmoji: '💎',
    minPosts: 30,
  },
  admin: {
    tier: 'admin',
    label: 'Admin',
    labelAr: 'مشرف',
    borderClass: 'border-amber-500 border-2',
    glowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]',
    badgeEmoji: '👑',
    minPosts: 0,
  },
};

export function computeFrameTier(postCount: number, totalReactions: number, isAdmin: boolean): FrameTier {
  if (isAdmin) return 'admin';
  if (postCount >= 30 || totalReactions >= 100) return 'diamond';
  if (postCount >= 20 || totalReactions >= 70) return 'platinum';
  if (postCount >= 10 || totalReactions >= 40) return 'gold';
  if (postCount >= 3 || totalReactions >= 10) return 'silver';
  if (postCount >= 1) return 'bronze';
  return 'none';
}

export function getFrameConfig(tier: FrameTier): FrameConfig {
  return FRAME_TIERS[tier];
}

// ========================
// CHALLENGE SYSTEM — Diverse & Premium Rewards
// ========================

export type RewardType = 'frame' | 'name_color' | 'kit' | 'badge' | 'title' | 'particle' | 'shield';

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
  rewardVisual?: string; // Icon or experimental shape
}

export const CHALLENGES: Challenge[] = [
  // === Easy ===
  {
    id: 'first-post',
    titleAr: 'البداية الواثقة',
    descriptionAr: 'انشر أول قصة فشل لك على المنصة',
    emoji: '🚀',
    target: 1,
    category: 'posts',
    rewardType: 'frame',
    rewardAr: 'الإطار البرونزي المتين',
    rewardDetail: 'bronze',
    difficulty: 'easy',
  },
  {
    id: 'add-social',
    titleAr: 'المحترف الاجتماعي',
    descriptionAr: 'أضف رابط تواصل واحد على الأقل',
    emoji: '🔗',
    target: 1,
    category: 'social',
    rewardType: 'badge',
    rewardAr: 'شارة خبير الشبكات',
    rewardDetail: 'خبير التواصل',
    difficulty: 'easy',
  },
  {
    id: 'first-reaction',
    titleAr: 'الشرارة الأولى',
    descriptionAr: 'احصل على أول تفاعل "مفيد" على منشورك',
    emoji: '💡',
    target: 1,
    category: 'reactions',
    rewardType: 'shield',
    rewardAr: 'درع الملهم الصاعد',
    rewardDetail: 'inspirer-shield',
    difficulty: 'easy',
  },

  // === Medium ===
  {
    id: 'five-posts',
    titleAr: 'صوت التجربة',
    descriptionAr: 'انشر 5 منشورات ملهمة',
    emoji: '📝',
    target: 5,
    category: 'posts',
    rewardType: 'frame',
    rewardAr: 'إطار الفضة المصقولة',
    rewardDetail: 'silver',
    difficulty: 'medium',
  },
  {
    id: 'ten-followers',
    titleAr: 'نجم صاعد',
    descriptionAr: 'احصل على 10 متابعين أوفياء',
    emoji: '👥',
    target: 10,
    category: 'followers',
    rewardType: 'name_color',
    rewardAr: 'الاسم الفضي اللامع',
    rewardDetail: 'name-silver',
    difficulty: 'medium',
  },
  {
    id: 'twenty-reactions',
    titleAr: 'حكيم المجتمع',
    descriptionAr: 'احصل على 20 تفاعل إجمالي',
    emoji: '🌟',
    target: 20,
    category: 'reactions',
    rewardType: 'title',
    rewardAr: 'لقب "منارة الإلهام"',
    rewardDetail: 'منارة الإلهام',
    difficulty: 'medium',
  },

  // === Hard ===
  {
    id: 'fifteen-posts',
    titleAr: 'خبير التحديات',
    descriptionAr: 'انشر 15 منشور بتفاصيل عميقة',
    emoji: '🏆',
    target: 15,
    category: 'posts',
    rewardType: 'frame',
    rewardAr: 'إطار الذهب الملكي',
    rewardDetail: 'gold',
    difficulty: 'hard',
  },
  {
    id: 'fifty-reactions',
    titleAr: 'الأيقونة الذهبية',
    descriptionAr: 'احصل على 50 تفاعل إجمالي',
    emoji: '⭐',
    target: 50,
    category: 'reactions',
    rewardType: 'name_color',
    rewardAr: 'اسم الذهب المتوهج',
    rewardDetail: 'name-gold',
    difficulty: 'hard',
  },
  {
    id: 'twenty-five-followers',
    titleAr: 'القائد الملهم',
    descriptionAr: 'قد مجتمعاً من 25 متابع',
    emoji: '🎯',
    target: 25,
    category: 'followers',
    rewardType: 'shield',
    rewardAr: 'درع القيادة الفخري',
    rewardDetail: 'leader-shield',
    difficulty: 'hard',
  },

  // === Legendary ===
  {
    id: 'thirty-posts',
    titleAr: 'أسطورة FlopHub',
    descriptionAr: 'انشر 30 منشور خلدت بصمتك',
    emoji: '💎',
    target: 30,
    category: 'posts',
    rewardType: 'frame',
    rewardAr: 'إطار الماس الأسطوري',
    rewardDetail: 'diamond',
    difficulty: 'legendary',
  },
  {
    id: 'hundred-reactions',
    titleAr: 'سيد التأثير',
    descriptionAr: 'احصل على 100 تفاعل من النخبة',
    emoji: '⚡',
    target: 100,
    category: 'reactions',
    rewardType: 'name_color',
    rewardAr: 'اسم البلاتينيوم الملكي',
    rewardDetail: 'name-platinum',
    difficulty: 'legendary',
  },
  {
    id: 'fifty-followers',
    titleAr: 'القمة المطلقة',
    descriptionAr: 'وصلت إلى 50 متابع - أنت الآن مرجع',
    emoji: '🌐',
    target: 50,
    category: 'followers',
    rewardType: 'shield',
    rewardAr: 'درع العرش الماسي',
    rewardDetail: 'diamond-shield',
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
