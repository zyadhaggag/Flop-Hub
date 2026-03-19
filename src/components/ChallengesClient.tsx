"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useTransition } from "react";
import { Trophy, Sparkles, Lock, Check, Gift, Crown, Star, Zap, Loader2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CHALLENGES,
  DIFFICULTY_CONFIG,
  computeChallengeProgress,
  type ChallengeProgress,
  type RewardType,
} from "@/lib/frames-challenges";
import { getUserChallengeData, acceptChallenge, claimChallengeReward } from "@/lib/challenge-actions";

const REWARD_ICONS: Record<RewardType, React.ReactNode> = {
  frame: <Crown className="w-3.5 h-3.5" />,
  name_color: <Star className="w-3.5 h-3.5" />,
  kit: <Gift className="w-3.5 h-3.5" />,
  badge: <Zap className="w-3.5 h-3.5" />,
  title: <Sparkles className="w-3.5 h-3.5" />,
};

interface ChallengeState {
  challenge_id: string;
  status: string;
  reward_claimed: boolean;
}

export function ChallengesClient() {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<ChallengeProgress[]>([]);
  const [challengeStates, setChallengeStates] = useState<ChallengeState[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getUserChallengeData();
      const computed = computeChallengeProgress(data.stats);
      setProgress(computed);
      setChallengeStates(data.challengeStates);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const getState = (challengeId: string): ChallengeState | undefined => {
    return challengeStates.find(s => s.challenge_id === challengeId);
  };

  const handleAccept = async (challengeId: string) => {
    const res = await acceptChallenge(challengeId);
    if (res.success) {
      toast.success("تم قبول التحدي! ابدأ الآن 🚀");
      await fetchData();
    } else {
      toast.error(res.error || "حدث خطأ");
    }
  };

  const handleClaim = async (challengeId: string) => {
    const res = await claimChallengeReward(challengeId);
    if (res.success) {
      toast.success("🎉 تهانينا! تم تحصيل الجائزة بنجاح");
      await fetchData();
    } else {
      toast.error(res.error || "حدث خطأ");
    }
  };

  const filtered = progress.filter(p => {
    const state = getState(p.challenge.id);
    if (filter === 'completed') return state?.status === 'completed';
    if (filter === 'active') return state?.status === 'active';
    return true;
  });

  const completedCount = challengeStates.filter(s => s.status === 'completed').length;
  const totalCount = progress.length;

  const grouped = {
    easy: filtered.filter(p => p.challenge.difficulty === 'easy'),
    medium: filtered.filter(p => p.challenge.difficulty === 'medium'),
    hard: filtered.filter(p => p.challenge.difficulty === 'hard'),
    legendary: filtered.filter(p => p.challenge.difficulty === 'legendary'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] -ml-24 -mb-24" />

        <div className="relative p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-xl">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">التحديات</h1>
              <p className="text-sm text-muted-foreground font-medium">أكمل التحديات واحصل على مكافآت فخمة</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="text-center">
              <span className="text-3xl font-black text-primary">{completedCount}</span>
              <span className="text-lg text-muted-foreground font-bold">/{totalCount}</span>
              <p className="text-[10px] text-muted-foreground font-bold mt-0.5">تحدي مكتمل</p>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  filter === f
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {f === 'all' ? 'الكل' : f === 'active' ? 'نشطة' : 'مكتملة'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {(Object.entries(grouped) as [keyof typeof DIFFICULTY_CONFIG, ChallengeProgress[]][]).map(([difficulty, items]) => {
            if (items.length === 0) return null;
            const config = DIFFICULTY_CONFIG[difficulty];

            return (
              <div key={difficulty} className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <span className={cn("text-xs font-black uppercase tracking-widest", config.color)}>
                    {config.labelAr}
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                <div className="grid gap-3">
                  {items.map((item) => (
                    <ChallengeCard 
                      key={item.challenge.id} 
                      progress={item} 
                      state={getState(item.challenge.id)}
                      onAccept={handleAccept}
                      onClaim={handleClaim}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-bold">لا توجد تحديات مطابقة</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ChallengeCard({ progress: p, state, onAccept, onClaim }: { 
  progress: ChallengeProgress; 
  state?: ChallengeState;
  onAccept: (id: string) => Promise<void>;
  onClaim: (id: string) => Promise<void>;
}) {
  const { challenge: ch } = p;
  const diffConfig = DIFFICULTY_CONFIG[ch.difficulty];
  const [isPending, startTransition] = useTransition();
  const [actionLoading, setActionLoading] = useState(false);

  const isActive = state?.status === 'active';
  const isCompleted = state?.status === 'completed';
  const canClaim = isActive && p.percentage >= 100;
  const isPending_ = !state || state.status === 'pending';

  return (
    <div className={cn(
      "relative bg-card rounded-2xl border overflow-hidden transition-all duration-300 group hover:shadow-lg",
      isCompleted ? "border-primary/20 bg-primary/[0.02]" 
        : canClaim ? "border-amber-400/40 bg-amber-500/[0.03] shadow-amber-500/10 shadow-lg"
        : isActive ? "border-primary/10"
        : "border-border/50 hover:border-primary/30"
    )}>
      <div className={cn("absolute top-0 right-0 w-1 h-full", 
        isCompleted ? "bg-primary" : canClaim ? "bg-amber-500" : isActive ? "bg-blue-500" : diffConfig.bg)} />

      <div className="p-4 sm:p-5 flex gap-4">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110",
          isCompleted ? "bg-primary/10" : canClaim ? "bg-amber-500/10 animate-pulse" : "bg-muted/50"
        )}>
          {isCompleted ? <Check className="w-7 h-7 text-primary" /> : canClaim ? <PartyPopper className="w-7 h-7 text-amber-500" /> : ch.emoji}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={cn("font-black text-base", isCompleted ? "text-primary" : "text-foreground")}>{ch.titleAr}</h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{ch.descriptionAr}</p>
            </div>
            <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg shrink-0", diffConfig.color, diffConfig.bg)}>
              {diffConfig.labelAr}
            </span>
          </div>

          {/* Progress bar */}
          {(isActive || isCompleted) && (
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-700",
                    isCompleted ? "bg-primary" : canClaim ? "bg-amber-500" : "bg-gradient-to-r from-primary/60 to-primary"
                  )}
                  style={{ width: `${p.percentage}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-muted-foreground font-bold">{p.current} / {ch.target}</span>
                <span className="text-[10px] font-bold text-primary">{Math.round(p.percentage)}%</span>
              </div>
            </div>
          )}

          {/* Reward */}
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ring-1 ring-inset",
            isCompleted 
              ? "bg-primary/10 text-primary ring-primary/20" 
              : canClaim 
                ? "bg-amber-500/10 text-amber-600 ring-amber-500/20" 
                : "bg-muted/50 text-muted-foreground ring-border/50"
          )}>
            {/* Visual Reward Ornament */}
            <div className="relative shrink-0">
              {ch.rewardType === 'frame' ? (
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 bg-muted/30 flex items-center justify-center",
                  ch.rewardDetail === 'bronze' ? "border-amber-700/60 shadow-[0_0_8px_rgba(180,83,9,0.2)]" :
                  ch.rewardDetail === 'silver' ? "border-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.2)]" :
                  ch.rewardDetail === 'gold' ? "border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" :
                  ch.rewardDetail === 'diamond' ? "border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]" :
                  "border-border"
                )}>
                  <Avatar className="w-5 h-5 opacity-40">
                    <AvatarFallback className="text-[6px] font-black">YU</AvatarFallback>
                  </Avatar>
                </div>
              ) : ch.rewardType === 'badge' ? (
                <div className="w-8 h-8 rounded-full bg-background/80 shadow-sm flex items-center justify-center text-lg border border-border/50">
                  {ch.rewardDetail}
                </div>
              ) : (
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isCompleted ? "bg-primary/20" : "bg-muted")}>
                  {REWARD_ICONS[ch.rewardType]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="block font-black text-[12px] tracking-tight">{ch.rewardAr}</span>
              <span className="block text-[10px] opacity-70 truncate font-semibold">
                {ch.rewardType === 'frame' ? 'إطار فخم للملف الشخصي' : 
                 ch.rewardType === 'badge' ? 'شارة مميزة بجانب اسمك' : 
                 ch.rewardType === 'name_color' ? 'لون وحركة كاريزمية للاسم' :
                 ch.rewardDetail}
              </span>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-lg font-black text-[9px] shadow-sm">
                <Check className="w-2.5 h-2.5" />
                <span>مُمتلك</span>
              </div>
            )}
            {!isActive && !isCompleted && <Lock className="w-3.5 h-3.5 opacity-30" />}
          </div>

          {/* Action Buttons */}
          {isPending_ && (
            <Button
              size="sm"
              onClick={async () => { setActionLoading(true); await onAccept(ch.id); setActionLoading(false); }}
              disabled={actionLoading}
              className="w-full h-10 rounded-xl font-black bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "قبول التحدي 🚀"}
            </Button>
          )}

          {canClaim && (
            <Button
              size="sm"
              onClick={async () => { setActionLoading(true); await onClaim(ch.id); setActionLoading(false); }}
              disabled={actionLoading}
              className="w-full h-10 rounded-xl font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-[0.98] transition-all animate-pulse"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تحصيل الجائزة 🎁"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
