"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useTransition } from "react";
import { 
  Trophy, Sparkles, Lock, Check, Gift, Crown, Star, Zap, 
  Loader2, PartyPopper, CheckCircle2, Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  CHALLENGES,
  DIFFICULTY_CONFIG,
  computeChallengeProgress,
  type ChallengeProgress,
  type RewardType,
} from "@/lib/frames-challenges";
import { getUserChallengeData, acceptChallenge, claimChallengeReward, markChallengeCelebrated } from "@/lib/challenge-actions";
import { SuccessCelebration } from "./SuccessCelebration";
import "@/app/awards.css";

const REWARD_ICONS: Record<RewardType, React.ReactNode> = {
  frame: <Crown className="w-5 h-5" />,
  name_color: <Star className="w-5 h-5" />,
  kit: <Gift className="w-5 h-5" />,
  badge: <Zap className="w-5 h-5" />,
  title: <Sparkles className="w-5 h-5" />,
  particle: <Sparkles className="w-5 h-5" />,
  shield: <Trophy className="w-5 h-5" />,
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
  
  // Celebration state
  const [celebration, setCelebration] = useState<{ isOpen: boolean; ch?: any; p?: any }>({ isOpen: false });

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

  const triggerCelebration = (p: ChallengeProgress) => {
     setCelebration({ isOpen: true, ch: p.challenge, p });
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
    <div className="space-y-8 pb-20" dir="rtl">
      <SuccessCelebration 
        isOpen={celebration.isOpen}
        onClose={async () => {
           if (celebration.ch) await markChallengeCelebrated(celebration.ch.id);
           setCelebration({ isOpen: false });
           await fetchData();
        }}
        challengeTitle={celebration.ch?.titleAr || ""}
        rewardTitle={celebration.ch?.rewardAr || ""}
        onAccept={async () => {
           await handleClaim(celebration.ch?.id || "");
           setCelebration({ isOpen: false });
        }}
      />

      {/* Header */}
      <div className="relative bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm p-8 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 transition-all duration-700 group-hover:opacity-80" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] -ml-24 -mb-24 animate-pulse" />

        <div className="relative space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl rotate-3 transition-transform hover:rotate-0">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">ساحة التحديات العظمى</h1>
              <p className="text-base text-muted-foreground font-bold mt-1 max-w-md">حول خطواتك إلى إنجازات مرئية وارتدِ ألقابك وجوائزك بكل فخر أمام الجميع.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2rem] bg-muted/40 border border-border/60 shadow-inner">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-primary drop-shadow-sm">{completedCount}</span>
              <span className="text-xl text-muted-foreground font-black">/{totalCount}</span>
            </div>
            <div className="flex-1 w-full space-y-2">
              <div className="flex justify-between text-xs font-black text-muted-foreground uppercase tracking-widest px-1">
                <span>مسار الإنجاز</span>
                <span>{totalCount > 0 ? Math.round((completedCount/totalCount)*100) : 0}%</span>
              </div>
              <div className="h-4 bg-muted/50 rounded-full overflow-hidden p-1 ring-1 ring-border/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  className="h-full bg-gradient-to-r from-primary via-primary to-secondary rounded-full shadow-[0_0_12px_rgba(var(--primary),0.3)] transition-all duration-1000"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 transform active:scale-95",
                  filter === f
                    ? "bg-primary text-white shadow-xl shadow-primary/30"
                    : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
                )}
              >
                {f === 'all' ? 'عرض الكل' : f === 'active' ? 'تحديات جارية' : 'إنجازات مكتملة'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-black animate-pulse">جاري تحضير التحديات...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {(Object.entries(grouped) as any[]).map(([difficulty, items]: [string, ChallengeProgress[]]) => {
            if (items.length === 0) return null;
            const config = (DIFFICULTY_CONFIG as any)[difficulty];

            return (
              <div key={difficulty} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <div className={cn("w-3 h-3 rounded-full animate-pulse", config.color.replace('text-', 'bg-'))} />
                  <span className={cn("text-sm font-black uppercase tracking-[0.2em]", config.color)}>
                    {config.labelAr}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
                </div>

                <div className="grid gap-6">
                  {items.map((item) => (
                    <ChallengeCard 
                      key={item.challenge.id} 
                      progress={item} 
                      state={getState(item.challenge.id)}
                      onAccept={handleAccept}
                      onClaim={handleClaim}
                      onCelebrate={() => triggerCelebration(item)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-24 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50">
              <Trophy className="w-20 h-20 text-muted-foreground/10 mx-auto mb-6" />
              <p className="text-muted-foreground text-xl font-black">لم نعثر على أي تحديات في هذا القسم</p>
              <Button variant="link" onClick={() => setFilter('all')} className="mt-2 font-bold text-primary">العودة للكل</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChallengeCard({ progress: p, state, onAccept, onClaim, onCelebrate }: { 
  progress: ChallengeProgress; 
  state?: ChallengeState;
  onAccept: (id: string) => Promise<void>;
  onClaim: (id: string) => Promise<void>;
  onCelebrate: () => void;
}) {
  const { challenge: ch } = p;
  const diffConfig = (DIFFICULTY_CONFIG as any)[ch.difficulty];
  const [actionLoading, setActionLoading] = useState(false);

  const isActive = state?.status === 'active';
  const isCompleted = state?.status === 'completed';
  const canClaim = isActive && p.percentage >= 100;
  const isPending_ = !state || state.status === 'pending';

  return (
    <motion.div 
      layout
      className={cn(
        "relative bg-card rounded-[2.5rem] border-2 overflow-hidden transition-all duration-500 group",
        isCompleted ? "border-primary/20 bg-primary/[0.01]" 
          : canClaim ? "border-secondary/50 bg-secondary/[0.04] shadow-2xl shadow-secondary/10"
          : isActive ? "border-primary/10 bg-muted/5 shadow-sm"
          : "border-border/40 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 shadow-sm"
      )}>
      
      {/* Decorative Gradient Overlay */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
         isCompleted ? "bg-gradient-to-br from-primary/5 to-transparent" : "bg-gradient-to-br from-primary/[0.03] to-transparent")} />

      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-8">
        {/* Badge Icon Section */}
        <div className="relative shrink-0 flex items-center justify-center mx-auto sm:mx-0">
          <div className={cn(
            "w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl shrink-0 transition-all duration-500 transform group-hover:rotate-6 shadow-lg",
            isCompleted ? "bg-primary/10 text-primary border border-primary/20" : 
            canClaim ? "bg-secondary/10 animate-pulse text-secondary border border-secondary/20" : 
            "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary border border-border/10"
          )}>
            {isCompleted ? <CheckCircle2 className="w-12 h-12" /> : canClaim ? <Star className="w-12 h-12" /> : ch.emoji}
          </div>
          
          {/* Level Badge Overlay */}
          <div className={cn("absolute -top-1 -right-1 w-10 h-10 rounded-full border-4 border-card flex items-center justify-center shadow-xl", diffConfig.bg)}>
            <span className={cn("text-[10px] font-black uppercase tracking-tighter", diffConfig.color)}>{ch.difficulty[0]}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-2 text-center sm:text-right w-full sm:w-auto">
              <h3 className={cn("font-black text-2xl tracking-tight leading-none", isCompleted ? "text-primary" : "text-foreground")}>
                {ch.titleAr}
              </h3>
              <p className="text-sm text-muted-foreground font-bold tracking-tight opacity-80">{ch.descriptionAr}</p>
            </div>
            
            <div className="flex gap-2 mx-auto sm:mx-0">
              <span className={cn("text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border-2 shadow-sm", diffConfig.color, diffConfig.bg, diffConfig.border)}>
                 تحدي {diffConfig.labelAr}
              </span>
            </div>
          </div>

          {/* Progress Section */}
          {(isActive || isCompleted) && (
            <div className="space-y-3 bg-muted/40 p-5 rounded-[2rem] border border-border/40 shadow-inner">
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-black text-muted-foreground uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  تقدمك نحو الجائزة
                </span>
                <span className={cn("text-base font-black animate-in fade-in zoom-in", isCompleted ? "text-primary" : "text-foreground")}>
                   {p.current} <span className="text-muted-foreground font-black opacity-40">/ {ch.target}</span>
                </span>
              </div>
              <div className="h-5 bg-muted/80 rounded-full overflow-hidden p-1.5 ring-1 ring-border/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${p.percentage}%` }}
                  className={cn("h-full rounded-full transition-all duration-1000",
                    isCompleted ? "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.3)]" : 
                    canClaim ? "bg-gradient-to-r from-secondary to-primary shadow-[0_0_12px_rgba(var(--secondary),0.5)]" : 
                    "bg-gradient-to-r from-primary/80 to-primary"
                  )}
                />
              </div>
              <div className="flex justify-end px-2">
                <span className="text-[10px] font-black text-primary/60">{Math.round(p.percentage)}% مكتمل</span>
              </div>
            </div>
          )}

          {/* Premium Reward Card Component */}
          <div className={cn(
            "relative flex items-center gap-6 px-6 py-6 rounded-[2.5rem] text-sm overflow-hidden transition-all duration-500 border-2",
            isCompleted 
              ? "bg-primary/[0.04] border-primary/20 ring-1 ring-primary/5 shadow-inner" 
              : canClaim 
                ? "bg-secondary/[0.06] border-secondary/30 ring-8 ring-secondary/5 pulse-subtle shadow-lg" 
                : "bg-muted/50 border-border/60 shadow-sm"
          )}>
            <div className="relative shrink-0">
               {ch.rewardType === 'frame' ? (
                 <div className="relative w-16 h-16 flex items-center justify-center scale-110">
                    <div className={cn("absolute inset-0 rounded-full z-10 pointer-events-none", ch.rewardDetail)} />
                    <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                      <AvatarFallback className="text-[10px] font-black bg-muted">YU</AvatarFallback>
                    </Avatar>
                    {isCompleted && <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow-lg z-20"><Check className="w-3 h-3" /></div>}
                 </div>
               ) : (
                 <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm",
                    isCompleted ? "bg-primary/20 text-primary" : 
                    canClaim ? "bg-secondary/20 text-secondary animate-bounce-subtle" : 
                    "bg-muted text-muted-foreground border border-border/20",
                    ch.rewardDetail.includes('name-') ? "hidden" : "" // Name color is handled by text
                 )}>
                    {REWARD_ICONS[ch.rewardType] || <Star className="w-6 h-6" />}
                 </div>
               )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                 <span className={cn("font-black text-xl tracking-tight drop-shadow-sm", 
                   ch.rewardDetail.includes('name-') ? ch.rewardDetail : "text-foreground"
                 )}>
                   {ch.rewardAr}
                 </span>
              </div>
              <p className="text-[12px] text-muted-foreground font-bold mt-1 opacity-70 leading-relaxed">
                {ch.rewardType === 'frame' ? 'إطار فخم وحصري يحيط بصورتك الشخصية ليراك الجميع بتميز' : 
                 ch.rewardType === 'badge' ? 'شارة فريدة تظهر بجوار اسمك في كل مكان بالمنصة' : 
                 ch.rewardType === 'name_color' ? 'تصميم لوني فاخر لاسمك يجعله يبرز بين الجميع' :
                 ch.rewardType === 'shield' ? 'درع حصري يظهر في ملفك وفي قائمة الشرف' :
                 ch.descriptionAr}
              </p>
            </div>

            {isCompleted ? (
              <div className="bg-primary text-white px-5 py-2.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                <CheckCircle2 className="w-5 h-5" />
                <span className="hidden sm:inline">مُمتلك</span>
              </div>
            ) : canClaim ? (
                <div className="hidden sm:flex bg-secondary text-white px-4 py-2 rounded-2xl font-black text-[10px] animate-pulse shadow-lg">
                    جاهز للاستلام
                </div>
            ) : (
                <div className="bg-muted px-4 py-2 rounded-2xl border border-border/50">
                    <Lock className="w-5 h-5 opacity-30" />
                </div>
            )}
          </div>

          {/* Action Area */}
          <div className="pt-4">
            {isPending_ && (
              <Button
                size="lg"
                onClick={async () => { setActionLoading(true); await onAccept(ch.id); setActionLoading(false); }}
                disabled={actionLoading}
                className="w-full h-16 rounded-[2rem] font-black text-xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all group flex items-center justify-center gap-4"
              >
                {actionLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                  <>
                    <span>قبول التحدي والبدء 🚀</span>
                    <PartyPopper className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </Button>
            )}

            {canClaim && (
              <Button
                size="lg"
                onClick={async () => { onCelebrate(); }}
                disabled={actionLoading}
                className="w-full h-16 rounded-[2rem] font-black text-xl bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 active:scale-[0.98] transition-all animate-bounce-subtle flex items-center justify-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <Gift className="w-7 h-7" />
                  <span>تحصيل الجائزة الملكية</span>
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </Button>
            )}

            {isCompleted && (
                 <div className="text-center">
                    <p className="text-xs font-black text-primary opacity-60">لقد أنجزت هذا التحدي بنجاح!</p>
                 </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
