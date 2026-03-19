"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Clock, LogOut, Lock } from "lucide-react";
import { signOut } from "next-auth/react";

export function TimeoutOverlay() {
  const { data: session } = useSession();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (!session?.user?.timeout_until) {
      setIsTimedOut(false);
      return;
    }

    const checkTimeout = () => {
      const timeoutDate = new Date(session.user.timeout_until!);
      const now = new Date();
      const diff = timeoutDate.getTime() - now.getTime();

      if (diff > 0) {
        setIsTimedOut(true);
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setIsTimedOut(false);
      }
    };

    const timer = setInterval(checkTimeout, 1000);
    checkTimeout();

    return () => clearInterval(timer);
  }, [session]);

  if (!isTimedOut) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      >
        {/* Massive Blur Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[20px]" />
        
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-lg bg-stone-900/40 border-2 border-red-500/20 rounded-[3rem] p-12 text-center shadow-2xl backdrop-blur-3xl overflow-hidden"
        >
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 bg-red-500/10 border-2 border-red-500/50 rounded-full flex items-center justify-center">
                  <Lock className="w-12 h-12 text-red-500" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-black text-white tracking-tight font-tajawal">حسابك قيد التجميد!</h2>
              <p className="text-stone-400 text-lg leading-relaxed">
                لقد تم وضع حسابك في فترة "تبريد" من قبل الإدارة. يرجى الانتظار حتى انتهاء الوقت المحدد للعودة للمشاركة.
              </p>
            </div>

            <div className="p-8 bg-red-500/5 rounded-3xl border border-red-500/10 inline-block">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-black text-red-500 uppercase tracking-widest opacity-60">متبقي من الوقت</span>
                <div className="text-6xl font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                  {timeLeft}
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col gap-4">
              <div className="flex items-center justify-center gap-3 text-stone-500 text-sm font-bold bg-stone-950/50 py-3 px-6 rounded-2xl">
                <ShieldAlert className="w-4 h-4" />
                <span>السبب: {session?.user?.timeout_reason || 'تبريد مؤقت'}</span>
              </div>
              
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
