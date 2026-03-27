"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getUserChallengeData, markChallengeCelebrated, claimChallengeReward } from "@/lib/challenge-actions";
import { computeChallengeProgress, type ChallengeProgress } from "@/lib/frames-challenges";
import { SuccessCelebration } from "./SuccessCelebration";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export function ChallengeCelebrationManager() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [celebration, setCelebration] = useState<{ isOpen: boolean; ch?: any; p?: any }>({ isOpen: false });

  const checkChallenges = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const data = await getUserChallengeData();
      const progress = computeChallengeProgress(data.stats);
      
      // Find a challenge that is:
      // 1. Percentage >= 100
      // 2. Status is 'active' or 'completed'
      // 3. CelebratedAt is null
      
      const toCelebrate = progress.find(p => {
        const state = data.challengeStates.find((s: any) => s.challenge_id === p.challenge.id);
        return p.percentage >= 100 && state && !state.celebrated_at && state.status !== 'pending';
      });

      if (toCelebrate) {
          // If we are on the challenges page, we don't want to show the global one if the page handles it
          // But actually, it's fine. The global one only shows if state.celebrated_at is null.
          setCelebration({ isOpen: true, ch: toCelebrate.challenge, p: toCelebrate });
      }
    } catch (e) {
      console.error("Challenge Celebration Check Error:", e);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
       checkChallenges();
       // Check every 2 minutes or when path changes (like coming back to home)
       const interval = setInterval(checkChallenges, 120000);
       return () => clearInterval(interval);
    }
  }, [session?.user?.id, pathname, checkChallenges]);

  const handleClose = async () => {
    if (celebration.ch) {
      await markChallengeCelebrated(celebration.ch.id);
    }
    setCelebration({ isOpen: false });
  };

  const handleAcceptReward = async () => {
    if (celebration.ch) {
      const res = await claimChallengeReward(celebration.ch.id);
      if (res.success) {
        toast.success("مبروك! تم استلام الجائزة بنجاح 🎁");
        await markChallengeCelebrated(celebration.ch.id);
      } else {
        toast.error("حدث خطأ أثناء استلام الجائزة");
      }
    }
    setCelebration({ isOpen: false });
  };

  return (
    <SuccessCelebration 
      isOpen={celebration.isOpen}
      onClose={handleClose}
      challengeTitle={celebration.ch?.titleAr || ""}
      rewardTitle={celebration.ch?.rewardAr || ""}
      onAccept={handleAcceptReward}
    />
  );
}
