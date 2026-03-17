"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, Eye, EyeOff, ArrowLeft, User, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { register } from "@/lib/actions";
import { signIn } from "next-auth/react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await register(formData);
      if (res.success) {
        toast.success("تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...");
        
        // Auto sign-in after registration
        const loginRes = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (loginRes?.error) {
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

  return (
    <div className="h-screen overflow-hidden flex dir-rtl bg-background dark text-foreground">
      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background overflow-y-auto custom-scrollbar h-full">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white">إنشاء حساب جديد</h1>
            <p className="text-muted-foreground font-medium">انضم إلى مجتمع FlopHub الملهم وابدأ بمشاركة دروسك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">الاسم الكامل</label>
              <div className="relative">
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="الاسم الحقيقي بالكامل" 
                  className="h-14 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary pl-12 text-base font-bold transition-all focus:bg-muted/60" 
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">اسم المستخدم</label>
              <div className="relative">
                <Input 
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="username_unique" 
                  className="h-14 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary pl-12 text-base font-bold transition-all focus:bg-muted/60" 
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                  className="h-14 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary pl-12 text-base font-bold transition-all focus:bg-muted/60" 
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">كلمة المرور</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="********" 
                  className="h-14 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary pl-12 text-base font-bold transition-all focus:bg-muted/60"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all gap-3 group active:scale-[0.98]"
            >
              <span>{loading ? "جاري الإنشاء..." : "إنشاء حساب مجاني"}</span>
              {!loading && <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />}
            </Button>

            <div className="text-center text-sm pt-6 border-t border-border/50">
              <span className="text-muted-foreground font-medium">لديك حساب بالفعل؟</span>
              <Link href="/login" className="text-primary font-black hover:underline mr-2 text-base">تسجيل الدخول</Link>
            </div>
          </form>
        </div>
      </div>

      {/* Branding Side */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden flex-col items-center justify-center text-white p-12">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-white rounded-full blur-[120px]" />
           <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-indigo-200 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-12">
          <div className="space-y-8">
            <h2 className="text-7xl font-black leading-[1.1] tracking-tight">
              ابدأ رحلتك<br />
              من <span className="text-white underline underline-offset-[12px] decoration-white/30">الفشل</span> إلى الحكمة.
            </h2>
            <p className="text-2xl opacity-80 leading-relaxed font-bold max-w-md italic">
              "الآلاف يشاركون تجاربهم اليومية بصدق... كن جزءاً من المجتمع الأكثر شفافية في العالم."
            </p>
          </div>
          
          <div className="bg-white/10 p-8 rounded-[2.5rem] border border-white/20 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-white/20 transition-colors" />
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-white shadow-xl rotate-3">
                   <Lightbulb className="w-8 h-8 text-primary fill-primary/10" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xl font-black">لماذا FlopHub؟</span>
                   <span className="text-xs opacity-60 uppercase font-black tracking-widest">Learn from the Best Fails</span>
                </div>
             </div>
             <p className="text-lg font-medium opacity-90 leading-relaxed">
                نحن نؤمن أن القصة الحقيقية ليست في النجاح المبهر، بل في عدد المرات التي سقطت فيها وكيف قمت مجدداً.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
