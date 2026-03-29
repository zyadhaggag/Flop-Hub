"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LandingNavbar } from "./landing-navbar";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  Users,
  Trophy,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  InteractiveMesh,
  SmoothScrollProvider,
  GlassCard,
  MouseGlow,
} from "./landing-elements";

/* ─────────────────────────────────────────────
   Main Landing Page
   ───────────────────────────────────────────── */
export function LandingPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  return (
    <SmoothScrollProvider>
      <div
        ref={ref}
        className="dark relative bg-[#0a0d14] text-white overflow-x-hidden font-tajawal"
        dir="rtl"
        style={{ backgroundColor: "#0a0d14" }}
      >
        {/* ── Background layers ── */}
        <InteractiveMesh />
        <MouseGlow />
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, background: "linear-gradient(to bottom, transparent 0%, rgba(10,13,20,0.4) 100%)" }} />

        {/* ── Navbar ── */}
        <LandingNavbar />

        {/* ══════════════════════════════════════
            HERO
           ══════════════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 pt-28 pb-20" style={{ zIndex: 2 }}>
          {/* Blobs */}
          <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

          <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-8">
                <Sparkles className="w-4 h-4" />
                FlopHub — جيل جديد من المحتوى
              </span>

              {/* Title */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
                اصنع{" "}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  أثرك
                </span>
                <br />
                في عالم المبدعين
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
                المنصة العربية الأولى التي تحول الفشل إلى خبرة والتحديات إلى إنجازات.
                اكتشف مهاراتك، تعلم من الأفضل، وكن أنت التغيير.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-lg font-bold bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 hover:scale-[1.03] transition-all duration-300 shadow-[0_12px_40px_rgba(124,58,237,0.35)] rounded-2xl"
                  >
                    ابدأ رحلتك مجاناً
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg font-bold border-white/10 text-white hover:bg-white/5 rounded-2xl"
                  >
                    دخول الأعضاء
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-bold">
              اكتشف المزيد
            </span>
            <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1 h-1 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════
            FEATURES
           ══════════════════════════════════════ */}
        <section className="relative py-28 md:py-36 px-6" style={{ zIndex: 2 }}>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-20">
              <span className="text-primary text-xs font-bold tracking-widest uppercase block mb-3">
                المنظومة
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                عالم من{" "}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent italic">
                  الإمكانيات
                </span>
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                بنينا لك منصة تتجاوز حدود المألوف، تجمع بين قوة التفكير وجمال التنفيذ.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <GlassCard delay={0.1}>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-black mb-3">مجتمع المبدعين</h3>
                <p className="text-gray-400 leading-relaxed">
                  تفاعل مع نخبة المبدعين العرب، ابنِ علاقات مهنية، وشارك في تطوير مستقبل المحتوى.
                </p>
              </GlassCard>

              <GlassCard delay={0.2}>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <Trophy className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black mb-3">تحديات وجوائز</h3>
                <p className="text-gray-400 leading-relaxed">
                  تحدى نفسك في مسابقات أسبوعية، حقق المراكز الأولى واحصل على جوائز مذهلة.
                </p>
              </GlassCard>

              <GlassCard delay={0.3}>
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="text-2xl font-black mb-3">مسارات احترافية</h3>
                <p className="text-gray-400 leading-relaxed">
                  دروس حصرية ومسارات تعليمية مصممة لتأخذك من الصفر إلى قمة الاحتراف.
                </p>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            TIERS / REWARDS
           ══════════════════════════════════════ */}
        <section className="relative py-28 md:py-36 px-6 bg-white/[0.02]" style={{ zIndex: 2 }}>
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Text */}
            <div className="flex-1 text-right">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                تميز{" "}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  برتبتك
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                في FlopHub، كل إنجاز له تقدير خاص. نظام الرتب الفاخر يمنحك حضوراً طاغياً وصلاحيات استثنائية.
              </p>
              <div className="space-y-4">
                {[
                  "ألوان أسماء حصرية ومتحركة",
                  "أيقونات تقديرية بجانب اسمك",
                  "صلاحيات إدارة متقدمة",
                  "أولوية الوصول للمحتوى الحصري",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 text-base bg-white/[0.04] px-5 py-3.5 rounded-2xl border border-white/5 hover:border-primary/20 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="font-bold">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tier cards */}
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative grid grid-cols-2 gap-5">
                <TierCard name="بلاتينيوم" color="#E5E4E2" rank="Rank 1" delay={0.1} />
                <TierCard name="ذهبي" color="#FFD700" rank="Rank 2" delay={0.15} />
                <TierCard name="فضي" color="#C0C0C0" rank="Rank 3" delay={0.2} />
                <TierCard name="برونزي" color="#CD7F32" rank="Rank 4" delay={0.25} />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            STEPS
           ══════════════════════════════════════ */}
        <section className="relative py-28 md:py-36 px-6" style={{ zIndex: 2 }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-blue-400 text-xs font-bold tracking-widest uppercase block mb-3">
                رحلتك
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                طريقك نحو{" "}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  القمة
                </span>
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                ثلاث خطوات بسيطة تفصلك عن تغيير واقعك الرقمي.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <StepCard num="01" title="انضم للعائلة" desc="أنشئ حسابك في ثوانٍ عبر حساب جوجل أو البريد الإلكتروني." color="primary" delay={0} />
              <StepCard num="02" title="شارك وتميز" desc="اطرح أفكارك، شارك في التحديات اليومية، وعزز حضورك." color="blue-400" delay={0.1} />
              <StepCard num="03" title="احصد الثمار" desc="اجمع النقاط، ارتقِ برتبتك، واستمتع بالمزايا الحصرية." color="violet-400" delay={0.2} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CTA
           ══════════════════════════════════════ */}
        <section className="relative py-28 md:py-36 px-6" style={{ zIndex: 2 }}>
          <div className="max-w-4xl mx-auto text-center rounded-[2.5rem] bg-gradient-to-r from-primary to-blue-500 p-12 md:p-16 relative overflow-hidden shadow-[0_20px_80px_rgba(124,58,237,0.4)]">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[60px]" />

            <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10 leading-tight">
              جاهز تغير قواعد اللعبة؟
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto relative z-10">
              انضم الآن لآلاف المبدعين العرب وابدأ رحلة نجاحك الحقيقية.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="h-14 px-12 text-lg font-black rounded-2xl bg-white text-primary hover:bg-gray-100 hover:scale-[1.03] transition-all duration-300 shadow-xl relative z-10"
              >
                سجل مجاناً الآن
              </Button>
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
           ══════════════════════════════════════ */}
        <footer className="relative py-20 px-6 border-t border-white/5 bg-black/40 backdrop-blur-md" style={{ zIndex: 2 }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="text-right">
              <h3 className="text-3xl font-black mb-4">
                <span className="text-primary italic">Flop</span>Hub
              </h3>
              <p className="text-gray-500 max-w-xs leading-relaxed text-sm">
                المنصة العربية الأكثر ابتكاراً للمبدعين. نؤمن أن التعلم المستمر هو مفتاح العظمة.
              </p>
            </div>

            <div className="flex gap-16 text-gray-500 text-sm font-medium">
              <div className="flex flex-col gap-3">
                <h4 className="text-white font-bold mb-1">المنصة</h4>
                <a href="#" className="hover:text-primary transition-colors">الرؤية</a>
                <a href="#" className="hover:text-primary transition-colors">الأهداف</a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-white font-bold mb-1">القانونية</h4>
                <a href="#" className="hover:text-primary transition-colors">الشروط</a>
                <a href="#" className="hover:text-primary transition-colors">الخصوصية</a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-white font-bold mb-1">الدعم</h4>
                <a href="#" className="hover:text-primary transition-colors">تواصل</a>
                <a href="#" className="hover:text-primary transition-colors">الأسئلة</a>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 text-center text-gray-600 text-xs tracking-widest uppercase">
            © 2026 FlopHub. جميع الحقوق محفوظة ❤️
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function TierCard({ name, color, rank, delay }: { name: string; color: string; rank: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm group"
    >
      <div className="relative">
        <div
          className="absolute inset-0 blur-xl opacity-30 group-hover:opacity-70 transition-opacity duration-500"
          style={{ backgroundColor: color }}
        />
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/10"
          style={{ backgroundColor: `${color}15` }}
        >
          <Trophy className="w-10 h-10" style={{ color }} />
        </div>
      </div>
      <span className="font-black text-xl" style={{ color }}>{name}</span>
      <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{rank}</span>
    </motion.div>
  );
}

function StepCard({ num, title, desc, color, delay }: { num: string; title: string; desc: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col items-center text-center group"
    >
      <div className={`w-16 h-16 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-${color} font-black text-2xl mb-6 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500`}>
        {num}
      </div>
      <h4 className="text-xl font-black mb-3 group-hover:text-primary transition-colors duration-300">{title}</h4>
      <p className="text-gray-500 leading-relaxed text-sm px-4 max-w-xs">{desc}</p>
    </motion.div>
  );
}
