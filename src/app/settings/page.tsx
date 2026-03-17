"use client";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { updateUsername, updateProfile, updatePassword } from "@/lib/actions";
import { uploadImage } from "@/lib/supabase";
import { toast } from "sonner";
import { Settings, User, Bell, Shield, Camera, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    if (session?.user?.username) {
      setUsername(session.user.username);
    }
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile({ name, username });
    if (res.success) {
      await update({ name, username });
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } else {
      toast.error(res.error || "حدث خطأ");
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !newPassword) return;
    
    setLoading(true);
    const res = await updatePassword({ currentPassword: password, newPassword });
    
    if (res.success) {
      toast.success("تم تحديث كلمة المرور بنجاح");
      setPassword("");
      setNewPassword("");
    } else {
      toast.error(res.error || "فشل تحديث كلمة المرور");
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const path = `avatars/${session?.user?.id}_${Date.now()}_${file.name}`;
      const imageUrl = await uploadImage(file, "avatars", path);
      
      const res = await updateProfile({ 
        image_url: imageUrl 
      });

      if (res.success) {
        await update({ image: imageUrl });
        toast.success("تم تحديث صورة الملف الشخصي بنجاح");
      } else {
        toast.error(res.error || "حدث خطأ أثناء التحديث");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("خطأ في الصلاحيات أو التحميل. يرجى التأكد من إعدادات سوبا بيز (RLS)");
    }
    setAvatarLoading(false);
  };

  if (!session) return null;

  const tabs = [
    { id: "account", label: "الحساب", icon: User },
    { id: "security", label: "الأمان", icon: Shield },
    { id: "notifications", label: "الإشعارات", icon: Bell },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8" dir="rtl">
        <Sidebar className="hidden md:flex" />

        <div className="flex-1 max-w-2xl mx-auto w-full space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
               <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight font-tajawal">الإعدادات</h1>
              <p className="text-sm text-muted-foreground font-medium">إدارة حسابك وتفضيلاتك الشخصية</p>
            </div>
          </div>

          <div className="flex gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-none sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-card text-primary shadow-sm border border-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id && "text-primary")} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeTab === "account" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Profile Section */}
                <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-8 shadow-sm">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>تعديل الملف الشخصي</span>
                  </h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">الاسم الكامل</label>
                      <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-14 rounded-2xl bg-muted/40 border-border focus:bg-muted/60 transition-all font-bold"
                        placeholder="الاسم الحقيقي"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">اسم المستخدم</label>
                      <div className="relative">
                        <Input 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="h-14 rounded-2xl bg-muted/40 border-border focus:bg-muted/60 transition-all font-bold pr-11"
                          placeholder="username"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                      </div>
                    </div>
                    <Button 
                      disabled={loading}
                      className="w-full h-14 rounded-2xl text-base font-black bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ التغييرات"}
                    </Button>
                  </form>
                </div>

                {/* Avatar Upload Section */}
                <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-8 shadow-sm">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    <span>تغيير صورة البروفايل</span>
                  </h2>
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center relative">
                        {session.user.image ? (
                          <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-muted-foreground" />
                        )}
                        {avatarLoading && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={avatarLoading} />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">ارفع صورة جديدة</p>
                      <p className="text-xs text-muted-foreground mt-1">يفضل أن تكون الصورة مربعة وبحجم أقل من 5 ميجابايت.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-8 shadow-sm">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>تغيير كلمة المرور</span>
                  </h2>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">كلمة المرور الحالية</label>
                      <Input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 rounded-2xl bg-muted/40 border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">كلمة المرور الجديدة</label>
                      <Input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-14 rounded-2xl bg-muted/40 border-border"
                      />
                    </div>
                    <Button 
                      disabled={loading || !password || !newPassword}
                      className="w-full h-14 rounded-2xl text-base font-black bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تحديث كلمة المرور"}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {(activeTab !== "account" && activeTab !== "security") && (
              <div className="text-center py-20 bg-muted/10 rounded-[2rem] border border-dashed border-border/50 text-muted-foreground animate-in zoom-in-95 duration-300">
                <div className="text-5xl mb-4 opacity-20">⚙️</div>
                <p className="font-bold text-lg">هذه الإعدادات ستكون متاحة قريباً.</p>
                <p className="text-xs mt-2 px-10 leading-relaxed opacity-60">نحن نعمل باستمرار على إضافة ميزات جديدة لتحسين تجربتك في FlopHub.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
