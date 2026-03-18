"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, X, User, Mail, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    linkedin: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...");
      router.refresh();
    } catch (error) {
      toast.error("حدث خطأ أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex dir-rtl bg-background text-foreground">
      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background h-full overflow-hidden relative">
        {/* Floating elements for interactivity */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-primary/5 rounded-full animate-pulse" />
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-amber-500/5 rounded-full animate-bounce" />
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-purple-500/5 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
        
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center mb-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-amber-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-white font-black text-2xl italic font-serif">F</span>
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">إنشاء حساب جديد</h1>
            <p className="text-muted-foreground font-medium text-xs">انضم لمجتمع الفشل الملهم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">الاسم الكامل</label>
              <div className="relative">
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="أدخل اسمك الكامل" 
                  className="h-10 rounded-xl bg-muted/40 border-border focus-visible:ring-primary text-sm font-bold transition-all focus:bg-muted/60 hover:scale-[1.02] pr-8"
                />
                <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
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
                  className="h-10 rounded-xl bg-muted/40 border-border focus-visible:ring-primary text-sm font-bold transition-all focus:bg-muted/60 hover:scale-[1.02] pr-8"
                />
                <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
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
                  className="h-10 rounded-xl bg-muted/40 border-border focus-visible:ring-primary text-sm font-bold transition-all focus:bg-muted/60 hover:scale-[1.02] pr-8"
                />
                <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">رابط تويتر (اختياري)</label>
              <div className="relative">
                <Input 
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                  placeholder="https://twitter.com/username" 
                  className="h-10 rounded-xl bg-muted/40 border-border focus-visible:ring-primary text-sm font-bold transition-all focus:bg-muted/60 hover:scale-[1.02] pr-8"
                />
                {socialLinks.twitter && (
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500 transition-colors"
                    onClick={() => setSocialLinks({...socialLinks, twitter: ""})}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">رابط لنكدإن (اختياري)</label>
              <div className="relative">
                <Input 
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/in/username" 
                  className="h-10 rounded-xl bg-muted/40 border-border focus-visible:ring-primary text-sm font-bold transition-all focus:bg-muted/60 hover:scale-[1.02] pr-8"
                />
                {socialLinks.linkedin && (
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500 transition-colors"
                    onClick={() => setSocialLinks({...socialLinks, linkedin: ""})}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
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
                  placeholder="••••••" 
                  className="h-10 rounded-xl bg-muted/40 border-border focus-visible:ring-primary text-sm font-bold transition-all focus:bg-muted/60 hover:scale-[1.02] pr-8"
                />
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-3">
                <Button 
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="h-10 rounded-xl gap-2 border-border hover:bg-muted/50 transition-all font-bold text-sm hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                     <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.235-1.921 4.241-1.011 1.006-2.589 2.053-5.919 2.053-5.112 0-9.283-4.148-9.283-9.28s4.171-9.28 9.283-9.28c2.775 0 4.796 1.091 6.29 2.493l2.316-2.316C19.167 1.135 15.908 0 12.48 0 5.617 0 .04 5.577.04 12.44s5.577 12.44 12.44c3.344 0 6.007-1.109 8.274-3.486 2.314-2.314 3.037-5.568 3.037-8.243 0-.78-.067-1.503-.199-2.251H12.48z"></path>
                  </svg>
                  <span>تسجيل الدخول عبر Google</span>
                </Button>
                <Button variant="outline" disabled className="h-10 rounded-xl gap-2 border-border opacity-50 cursor-not-allowed font-bold text-sm grayscale">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 3.655 3.655 0 00-1.297 3.713c1.35.104 2.753-.702 3.584-1.703z"></path>
                  </svg>
                  <span>تسجيل الدخول عبر Apple (قريباً)</span>
                </Button>
              </div>

              <div className="text-center text-xs pt-3 border-t border-border/50">
                <span className="text-muted-foreground font-medium">لديك حساب بالفعل؟</span>
                <Link href="/login" className="text-primary font-black hover:underline mr-2 text-xs hover:scale-105 transition-transform inline-block">تسجيل الدخول</Link>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl text-sm font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all gap-2 group active:scale-[0.98]"
            >
              <span>{loading ? "جاري الإنشاء..." : "إنشاء حساب مجاني"}</span>
              {!loading && <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />}
            </Button>
          </form>
        </div>
      </div>

      {/* Left Side: Branding */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden flex-col items-center justify-center text-white p-6">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-5 right-5 w-[200px] h-[200px] bg-white rounded-full blur-[60px]" />
           <div className="absolute bottom-5 left-5 w-[150px] h-[150px] bg-indigo-200 rounded-full blur-[40px]" />
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-6">
          <div className="space-y-4">
            <h2 className="text-4xl font-black leading-[1.1] tracking-tight">
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
                <div className="p-2 rounded-2xl bg-white shadow-xl rotate-3">
                   <Sparkles className="w-5 h-5 text-primary fill-primary/10" />
                </div>
                <div className="flex flex-col">
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
