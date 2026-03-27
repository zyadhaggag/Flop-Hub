
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, PartyPopper, CheckCircle2, Star, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface SuccessCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  rewardTitle: string;
  rewardImage?: string;
  onAccept: () => void;
}

export function SuccessCelebration({
  isOpen,
  onClose,
  challengeTitle,
  rewardTitle,
  rewardImage,
  onAccept
}: SuccessCelebrationProps) {
  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-card border border-primary/20 rounded-[2.5rem] overflow-hidden shadow-2xl"
          dir="rtl"
        >
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -ml-16 -mb-16" />

          <div className="relative p-8 flex flex-col items-center text-center space-y-6">
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon/Badge Section */}
            <div className="relative">
              <motion.div
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/20"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-primary/10"
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracing-tight">مبروووك! 🎉</h2>
              <p className="text-muted-foreground font-bold text-lg">أكملت تحدي "{challengeTitle}"</p>
            </div>

            <div className="w-full p-6 rounded-[2rem] bg-muted/50 border border-primary/10 space-y-4">
              <p className="text-sm font-black text-primary uppercase tracking-widest">لقد حصلت على</p>
              
              <div className="flex flex-col items-center gap-3">
                {rewardImage ? (
                  <img src={rewardImage} alt={rewardTitle} className="w-16 h-16 object-contain drop-shadow-lg" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Star className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                )}
                <h3 className="text-2xl font-black text-foreground">{rewardTitle}</h3>
              </div>
            </div>

            <Button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="w-full h-14 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              قبول الجائزة واستلامها 🎁
            </Button>
            
            <p className="text-[10px] text-muted-foreground font-bold">يمكنك دائماً رؤية جوائزك في ملفك الشخصي</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
