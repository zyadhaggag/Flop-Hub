"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, Sparkles, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { register } from "@/lib/actions";
import { useTheme } from "next-themes";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        toast.success("تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...");
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (signInResult?.error) {
          router.push("/login");
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        toast.error(res.error || "حدث خطأ أثناء التسجيل");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  // Prevent layout shift — render placeholder with same dimensions
  if (!mounted) {
    return <div className="h-screen bg-background" />;
  }

  return (
    <div className="h-screen overflow-hidden flex dir-rtl bg-background text-foreground relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 left-6 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="rounded-full w-10 h-10 bg-muted/40 hover:bg-muted/80 backdrop-blur-sm transition-all"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">تبديل السمة</span>
        </Button>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background h-full overflow-hidden relative">
        {/* Floating elements for interactivity */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary/5 rounded-full animate-bounce" />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-accent/5 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
        
        <div className={cn(
          "w-full max-w-md space-y-6",
          mounted && "animate-fade-in-up"
        )}>
          <div className={cn(
            "text-center space-y-2",
            mounted && "animate-delay-100"
          )}>
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative group transition-transform duration-500 hover:scale-110">
                <div className="w-20 h-20 flex items-center justify-center p-1">
                  <img src="/favicon.png" alt="FlopHub Icon" className="w-full h-full object-contain" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-primary animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">إنشاء حساب جديد</h1>
            <p className="text-muted-foreground font-medium text-sm">انضم لمجتمع الفشل الملهم</p>
          </div>

          <form onSubmit={handleSubmit} className={cn(
            "space-y-4",
            mounted && "animate-delay-200"
          )}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">الاسم الكامل</label>
                <div className="relative">
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="أدخل اسمك" 
                    className="h-12 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary text-base font-bold transition-all focus:bg-muted/60 hover:scale-[1.02] pr-10"
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">اسم المستخدم</label>
                <div className="relative">
                  <Input 
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="@username" 
                    className="h-12 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary text-base font-bold transition-all focus:bg-muted/60 hover:scale-[1.02] pr-10"
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">البريد الإلكتروني</label>
              <div className="relative">
                <Input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="example@email.com" 
                  className="h-12 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary text-base font-bold transition-all focus:bg-muted/60 hover:scale-[1.02] pr-10"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">كلمة المرور</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary hover:text-primary/80 font-black"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "إخفاء" : "إظهار"}
                </Button>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="h-12 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary text-base font-bold transition-all focus:bg-muted/60 hover:scale-[1.02] pr-10"
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl text-base font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all gap-3 group active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  إنشاء حساب مجاني
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="space-y-3">
            <div className="flex flex-col gap-3">
              <Button 
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                variant="outline"
                className="h-12 rounded-2xl gap-3 border-border hover:bg-muted/50 transition-all font-bold text-base hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                   <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.235-1.921 4.241-1.011 1.006-2.589 2.053-5.919 2.053-5.112 0-9.283-4.148-9.283-9.28s4.171-9.28 9.283-9.28c2.775 0 4.796 1.091 6.29 2.493l2.316-2.316C19.167 1.135 15.908 0 12.48 0 5.617 0 .04 5.577.04 12.44s5.577 12.44 12.44 12.44c3.344 0 6.007-1.109 8.274-3.486 2.314-2.314 3.037-5.568 3.037-8.243 0-.78-.067-1.503-.199-2.251H12.48z"></path>
                </svg>
                <span>تسجيل الدخول عبر Google</span>
              </Button>
              <Button variant="outline" disabled className="h-12 rounded-2xl gap-3 border-border opacity-50 cursor-not-allowed font-bold text-base grayscale">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.82a3.655 3.655 0 00-1.297 3.713c1.35.104 2.753-.702 3.584-1.703z"></path>
                </svg>
                <span>تسجيل الدخول عبر Apple (قريباً)</span>
              </Button>
            </div>

            <div className={cn(
              "text-center text-sm pt-4 border-t border-border/50",
              mounted && "animate-delay-500"
            )}>
              <span className="text-muted-foreground font-medium">لديك حساب بالفعل؟</span>
              <Link href="/login" className="text-primary font-black hover:underline mr-2 text-sm hover:scale-105 transition-transform inline-block">تسجيل الدخول</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side: Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#7c3aed] via-purple-600 to-[#3b82f6] relative overflow-hidden flex-col items-center justify-center text-white p-12">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-white rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-indigo-200 rounded-full blur-[100px] animate-bounce" />
           <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-200 rounded-full blur-[80px] animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <div className={cn(
          "relative z-10 w-full max-w-lg space-y-10",
          mounted && "animate-slide-in-left"
        )}>
          <div className="space-y-6">
            <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
              ابدأ رحلتك<br />
              من <span className="text-transparent bg-clip-text bg-gradient-to-l from-white to-gray-400 underline underline-offset-[12px] decoration-white/30">الفشل</span> إلى الحكمة.
            </h2>
            <p className="text-lg opacity-80 leading-relaxed font-bold max-w-md italic">
              "الآلاف يشاركون تجاربهم اليومية بصدق... كن جزءاً من المجتمع الأكثر شفافية في العالم."
            </p>
          </div>
          
          <div className="bg-white/10 p-6 rounded-[2rem] border border-white/20 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-2xl -mr-8 -mt-6 group-hover:bg-white/20 transition-colors" />
             <div className="flex items-center gap-3 mb-3">
                <div className="h-12 flex items-center justify-center transition-transform duration-500 hover:scale-110">
                    <img src="/logo-light.svg" alt="FlopHub" className="h-full object-contain brightness-0 invert" />
                </div>
                <div className="flex flex-col ml-4">
                   <span className="text-xl font-black">لماذا FlopHub؟</span>
                   <span className="text-xs opacity-60 uppercase font-black tracking-widest">Learn from Best Fails</span>
                </div>
             </div>
             <p className="text-base font-medium opacity-90 leading-relaxed">
                نحن نؤمن أن القصة الحقيقية ليست في النجاح المبهر، بل في عدد المرات التي سقطت فيها وكيف قمت مجدداً.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
