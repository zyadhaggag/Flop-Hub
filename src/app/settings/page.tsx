"use client";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { updateUsername, updateProfile, updatePassword, deleteAccount } from "@/lib/actions";
import { uploadImage } from "@/lib/supabase";
import { toast } from "sonner";
import { Settings, User, Bell, Shield, Camera, Check, Loader2, Image as ImageIcon, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarEditorModal } from "@/components/avatar-editor-modal";
import { ProfileBannerSelector } from "@/components/profile-banner-selector";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const BANNER_STYLES: Record<string, string> = {
  'banner-1': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
  'banner-2': 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
  'banner-3': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'banner-4': 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
  'banner-5': 'linear-gradient(135deg, #000000 0%, #1e293b 100%)',
  'banner-6': 'radial-gradient(#ffffff 0.5px, transparent 0.5px) #000',
  'banner-7': 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px) #111827',
  'banner-8': 'radial-gradient(circle at center, #7c3aed 0%, #000 100%)',
  'banner-9': 'linear-gradient(45deg, #ff00cc, #3333ff)',
  'banner-10': 'repeating-linear-gradient(45deg, #222 0, #222 1px, transparent 0, transparent 50%) #1a1a1a',
};

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  // New features state
  const [banner, setBanner] = useState(session?.user?.banner_url || null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.username) setUsername(session.user.username);
    if (session?.user?.name) setName(session.user.name);
    if (session?.user?.bio) setBio(session.user.bio);
    if (session?.user?.banner_url) setBanner(session.user.banner_url);
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile({ name, username, bio });
      if (res.success && res.user) {
        await update({ 
          name: res.user.name, 
          username: res.user.username, 
          bio: res.user.bio 
        });
        setName(res.user.name);
        setUsername(res.user.username);
        setBio(res.user.bio);
        toast.success("تم تحديث الملف الشخصي بنجاح");
      } else {
        toast.error(res.error || "حدث خطأ");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
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

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempAvatar(reader.result as string);
      setAvatarModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async (croppedImageDataUrl: string) => {
    setAvatarLoading(true);
    try {
      // Convert dataUrl to blob
      const resBlob = await fetch(croppedImageDataUrl);
      const blob = await resBlob.blob();
      const file = new File([blob], `avatar_${Date.now()}.jpg`, { type: "image/jpeg" });

      const path = `avatars/${session?.user?.id}_${Date.now()}.jpg`;
      const imageUrl = await uploadImage(file, "avatars", path);
      
      const res = await updateProfile({ image_url: imageUrl });

      if (res.success) {
        await update({ image: imageUrl });
        toast.success("تم تحديث صورة الملف الشخصي بنجاح");
      } else {
        toast.error(res.error || "حدث خطأ");
      }
    } catch (err) {
      console.error(err);
      toast.error("فشل رفع الصورة");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleBannerSelect = async (presetId: string) => {
    setBanner(presetId);
    const res = await updateProfile({ banner_url: presetId });
    if (res.success) {
      await update({ banner_url: presetId });
      toast.success("تم تحديث الغلاف بنجاح");
    } else {
      toast.error("فشل تحديث الغلاف");
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!window.confirm("هل أنت متأكد من حذف حسابك نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    
    setLoading(true);
    const res = await deleteAccount();
    if (res.success) {
      toast.success("تم حذف الحساب بنجاح");
      signOut({ callbackUrl: "/login" });
    } else {
      toast.error(res.error || "فشل حذف الحساب");
      setLoading(false);
    }
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
                {/* 1. Banner Section */}
                <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        <span>تنسيق الغلاف</span>
                      </h2>
                      <p className="text-[11px] text-muted-foreground font-medium">اختر نمطاً جمالياً لخلفية ملفك الشخصي</p>
                    </div>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">جديد</span>
                  </div>
                  
                  {/* Live Preview */}
                  <div className="relative h-32 rounded-3xl border border-border overflow-hidden bg-muted group shadow-inner">
                    <div 
                      className={cn(
                        "absolute inset-0 transition-all duration-700",
                        !banner && "bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent"
                      )}
                      style={
                        banner?.startsWith('preset-') 
                        ? { 
                            background: BANNER_STYLES[banner.replace('preset-', 'banner-') as keyof typeof BANNER_STYLES],
                            backgroundSize: banner === 'preset-6' ? '20px 20px' : banner === 'preset-7' ? '30px 30px' : banner === 'preset-10' ? '10px 10px' : 'cover'
                          }
                        : banner ? { backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
                      }
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <ProfileBannerSelector currentBanner={banner} onSelect={handleBannerSelect} />
                </div>

                {/* 2. Avatar Upload Section */}
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
                        <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" disabled={avatarLoading} />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">ارفع صورة جديدة</p>
                      <p className="text-xs text-muted-foreground mt-1">يفضل أن تكون الصورة مربعة وبحجم أقل من 5 ميجابايت.</p>
                    </div>
                  </div>
                </div>

                {/* 3. Account Info Section */}
                <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-8 shadow-sm">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>تعديل المعلومات الشخصية</span>
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
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">نبذة عنك (Bio)</label>
                      <Textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="min-h-[120px] rounded-2xl bg-muted/40 border-border focus:bg-muted/60 transition-all font-medium leading-relaxed"
                        placeholder="أخبرنا المزيد عن رحلتك، دروسك، أو حتى فلسفتك في الحياة..."
                      />
                    </div>
                    <Button 
                      disabled={loading}
                      type="submit"
                      className="w-full h-14 rounded-2xl text-base font-black bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ التغييرات"}
                    </Button>
                  </form>
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

                {/* Dangerous Area */}
                <div className="bg-red-500/5 rounded-[2rem] border border-red-500/20 p-8 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-red-500" />
                    <h2 className="text-xl font-black text-red-500">حذف الحساب</h2>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    من خلال حذف حسابك، ستفقد جميع منشوراتك، دروسك، وإعجاباتك. لا يمكن التراجع عن هذا الإجراء.
                  </p>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="w-full h-14 rounded-2xl text-base font-black transition-all shadow-lg hover:shadow-red-500/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "حذف حسابي نهائياً"}
                  </Button>
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

      <AvatarEditorModal 
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        image={tempAvatar}
        onSave={handleCropSave}
      />
    </div>
  );
}
