// Profile Frame & Challenge System
// Computed from existing data — no DB schema changes needed

export type FrameTier = 
  | 'none' 
  | 'copper' 
  | 'bronze' 
  | 'silver' 
  | 'gold' 
  | 'platinum' 
  | 'emerald' 
  | 'ruby' 
  | 'sapphire' 
  | 'diamond' 
  | 'obsidian' 
  | 'admin';

export interface FrameConfig {
  tier: FrameTier;
  label: string;
  labelAr: string;
  nameColorClass: string;
  minPosts?: number;
}

export const FRAME_TIERS: Record<FrameTier, FrameConfig> = {
  none: {
    tier: 'none',
    label: 'Newcomer',
    labelAr: 'مبتدئ',
    nameColorClass: 'text-foreground',
  },
  copper: {
    tier: 'copper',
    label: 'Copper',
    labelAr: 'نحاسي',
    nameColorClass: 'text-orange-400 font-bold',
  },
  bronze: {
    tier: 'bronze',
    label: 'Bronze',
    labelAr: 'برونزي',
    nameColorClass: 'text-amber-600 font-bold',
  },
  silver: {
    tier: 'silver',
    label: 'Silver',
    labelAr: 'فضي',
    nameColorClass: 'text-slate-400 font-bold',
  },
  gold: {
    tier: 'gold',
    label: 'Gold',
    labelAr: 'ذهبي',
    nameColorClass: 'text-yellow-500 font-black drop-shadow-sm',
  },
  platinum: {
    tier: 'platinum',
    label: 'Platinum',
    labelAr: 'بلاتيني',
    nameColorClass: 'bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 bg-clip-text text-transparent font-black drop-shadow-sm',
  },
  emerald: {
    tier: 'emerald',
    label: 'Emerald',
    labelAr: 'زمردي',
    nameColorClass: 'bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent font-black shadow-emerald-500/20',
  },
  ruby: {
    tier: 'ruby',
    label: 'Ruby',
    labelAr: 'ياقوتي',
    nameColorClass: 'bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent font-black shadow-rose-500/20',
  },
  sapphire: {
    tier: 'sapphire',
    label: 'Sapphire',
    labelAr: 'زفيري',
    nameColorClass: 'bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent font-black shadow-blue-500/20',
  },
  diamond: {
    tier: 'diamond',
    label: 'Diamond',
    labelAr: 'ماسي',
    nameColorClass: 'bg-gradient-to-r from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent font-black drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-pulse',
  },
  obsidian: {
    tier: 'obsidian',
    label: 'Obsidian',
    labelAr: 'أوبسيديان',
    nameColorClass: 'bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text text-transparent font-black drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] dark:from-neutral-100 dark:via-neutral-400 dark:to-neutral-100',
  },
  admin: {
    tier: 'admin',
    label: 'Admin',
    labelAr: 'مشرف',
    nameColorClass: 'bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent font-black drop-shadow-md animate-shimmer bg-[length:200%_auto]',
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
    emoji: '',
    target: 30,
    category: 'posts',
    rewardType: 'name_color',
    rewardAr: 'الاسم الماسي الأسطوري',
    rewardDetail: 'name-diamond',
    difficulty: 'legendary',
  },
  {
    id: 'hundred-reactions',
    titleAr: 'سيد التأثير',
    descriptionAr: 'احصل على 100 تفاعل من النخبة',
    emoji: '',
    target: 100,
    category: 'reactions',
    rewardType: 'name_color',
    rewardAr: 'اسم الأوبسيديان الملكي',
    rewardDetail: 'name-obsidian',
    difficulty: 'legendary',
  },
  {
    id: 'fifty-followers',
    titleAr: 'القمة المطلقة',
    descriptionAr: 'وصلت إلى 50 متابع - أنت الآن مرجع',
    emoji: '',
    target: 50,
    category: 'followers',
    rewardType: 'name_color',
    rewardAr: 'اسم الياقوت المتوهج',
    rewardDetail: 'name-ruby',
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
  hard: { labelAr: 'صعب', color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
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

  // 1. Determine Tier based on achievements (Metal Progression)
  if (completedIds.includes('hundred-reactions')) {
    appearance.frame = 'obsidian';
  } else if (completedIds.includes('thirty-posts')) {
    appearance.frame = 'diamond';
  } else if (completedIds.includes('fifty-followers')) {
    appearance.frame = 'sapphire';
  } else if (completedIds.includes('fifty-reactions')) {
    appearance.frame = 'ruby';
  } else if (completedIds.includes('fifteen-posts')) {
    appearance.frame = 'emerald';
  } else if (completedIds.includes('twenty-reactions')) {
    appearance.frame = 'platinum';
  } else if (completedIds.includes('ten-followers')) {
    appearance.frame = 'gold';
  } else if (completedIds.includes('five-posts')) {
    appearance.frame = 'silver';
  } else if (completedIds.includes('first-post')) {
    appearance.frame = 'bronze';
  } else if (completedIds.includes('add-social')) {
    appearance.frame = 'copper';
  }

  // Set the name color class based on the chosen tier
  appearance.nameColorClass = FRAME_TIERS[appearance.frame].nameColorClass;

  // 2. Titles (kept as extra flair)
  if (completedIds.includes('fifty-followers')) {
    appearance.title = 'القائد الأعلى';
  } else if (completedIds.includes('twenty-five-followers')) {
    appearance.title = 'قائد الفلوبرز';
  } else if (completedIds.includes('twenty-reactions')) {
    appearance.title = 'ملهم المجتمع';
  }

  return appearance;
}
