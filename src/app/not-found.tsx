"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, MoveRight, HelpCircle, Sparkles, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full bg-[#030303] flex items-center justify-center overflow-hidden font-tajawal" dir="rtl">
      {/* Background Text - Scaled Down */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.02]">
        <h1 className="text-[25vw] font-black leading-none tracking-tighter whitespace-nowrap">
          404 FLOP
        </h1>
      </div>

      {/* Animated Floating Objects - Fewer and smaller */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: 0 }}
            animate={{ y: ["-10%", "110%"], opacity: [0, 0.3, 0], rotate: [0, 360] }}
            transition={{ duration: Math.random() * 20 + 10, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
            className="absolute p-4 rounded-full bg-primary/10 blur-xl"
            style={{ width: Math.random() * 200 + 50, height: Math.random() * 200 + 50 }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-2 mb-8"
        >
          <div className="relative">
            <span className="text-[10rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/50 to-transparent leading-none drop-shadow-2xl select-none">
              ٤٠٤
            </span>
            <div className="absolute -top-4 -right-12 rotate-12 hidden md:block">
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-red-500/10 border border-red-500/40 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-black text-red-500">حدث خطأ ممتع!</span>
                </div>
              </motion.div>
            </div>
          </div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-black text-white -mt-6 tracking-tight"
          >
            تهنا في فضاء الفشل..
          </motion.h2>
        </motion.div>

        {/* The Master Lesson Card - More compact */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-xl mx-auto mb-10 relative group"
        >
          <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
          <div className="relative p-8 rounded-[2.5rem] bg-stone-900/40 border border-white/10 backdrop-blur-3xl shadow-xl">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary px-4 py-1.5 rounded-xl shadow-lg">
              <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                حكمة اليوم من فلوبهاب
              </span>
            </div>
            <p className="text-lg md:text-2xl font-bold text-stone-200 leading-relaxed italic">
              "الوصول إلى الطريق المسدود ليس نهاية الرحلة، بل هو دعوة لتجربة مسار لم تطأه قدماك من قبل."
            </p>
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-primary/60 text-xs font-black">
              <HelpCircle className="w-4 h-4" />
              <span>هل أنت مستعد للمحاولة مرة أخرى؟</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                size="lg" 
                className="h-14 px-10 rounded-2xl text-lg font-black gap-3 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
              >
                <Home className="w-6 h-6" />
                العودة للوطن
              </Button>
            </motion.div>
          </Link>
          
          <Link href="/search">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-10 rounded-2xl text-lg font-black gap-3 border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-xl transition-all"
              >
                <span>جرب حظك هنا</span>
                <MoveRight className="w-6 h-6" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Background Gradient Orbs - Smaller */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
    </div>
  );
}
