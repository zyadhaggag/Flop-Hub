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
import { Settings, User, Bell, Shield, Camera, Check, Loader2, Image as ImageIcon, Sliders, Globe, Plus, Trash2, X, Sun, Moon, MapPin, Volume2, Eye, EyeOff, Lock, Unlock, Smartphone, Monitor, Wifi, WifiOff, Download, Upload, RefreshCw, Clock, Calendar, MessageSquare, Heart, Share2, Bookmark, TrendingUp, Users, Award, Zap, Target, Coffee, Brain, Music, Video, FileText, Archive, Trash, Mail, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarEditorModal } from "@/components/avatar-editor-modal";
import { ProfileBannerSelector } from "@/components/profile-banner-selector";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { detectPlatform, getPlatformIcon, getPlatformLabel, SocialLink } from "@/lib/social-links";
import { UnsavedChangesWarning } from "@/components/unsaved-changes-warning";
import { useRouter } from "next/navigation";

const BANNER_STYLES: Record<string, { backgroundImage: string; backgroundColor?: string; backgroundSize?: string }> = {
  'banner-1': { backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)' },
  'banner-2': { backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)' },
  'banner-3': { backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  'banner-4': { backgroundImage: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' },
  'banner-5': { backgroundImage: 'linear-gradient(135deg, #000000 0%, #1e293b 100%)' },
  'banner-6': { backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundColor: '#000', backgroundSize: '20px 20px' },
  'banner-7': { backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)', backgroundColor: '#111827', backgroundSize: '30px 30px' },
  'banner-8': { backgroundImage: 'radial-gradient(circle at center, #7c3aed 0%, #000 100%)' },
  'banner-9': { backgroundImage: 'linear-gradient(45deg, #ff00cc, #3333ff)' },
  'banner-10': { backgroundImage: 'repeating-linear-gradient(45deg, #222 0, #222 1px, transparent 0, transparent 50%)', backgroundColor: '#1a1a1a', backgroundSize: '10px 10px' },
  'banner-11': { backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  'banner-12': { backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  'banner-13': { backgroundImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  'banner-14': { backgroundImage: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  'banner-15': { backgroundImage: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
};

function getBannerStyle(banner: string | null): React.CSSProperties {
  if (!banner) return {};
  const key = banner.startsWith('preset-') ? banner.replace('preset-', 'banner-') : null;
  if (key && BANNER_STYLES[key]) {
    return BANNER_STYLES[key];
  }
  if (banner.startsWith('http') || banner.startsWith('/')) {
    return { backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return {};
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  
  // Social Links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkName, setNewLinkName] = useState("");

  // New features state
  const [banner, setBanner] = useState(session?.user?.banner_url || null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.username) setUsername(session.user.username);
    if (session?.user?.name) setName(session.user.name);
    if (session?.user?.bio) setBio(session.user.bio);
    if (session?.user?.banner_url) setBanner(session.user.banner_url);
    if (session?.user?.social_links) {
        try {
            const links = session.user.social_links;
            setSocialLinks(typeof links === 'string' ? JSON.parse(links) : links);
        } catch (e) {
            setSocialLinks([]);
        }
    }
  }, [session]);

  // Track changes
  useEffect(() => {
    const originalName = session?.user?.name || "";
    const originalUsername = session?.user?.username || "";
    const originalBio = session?.user?.bio || "";
    const originalBanner = session?.user?.banner_url || null;
    
    const hasChanges = 
      name !== originalName ||
      username !== originalUsername ||
      bio !== originalBio ||
      banner !== originalBanner ||
      JSON.stringify(socialLinks) !== JSON.stringify(
        session?.user?.social_links ? 
          (typeof session.user.social_links === 'string' ? JSON.parse(session.user.social_links) : session.user.social_links) 
          : []
      );
    
    setHasUnsavedChanges(hasChanges);
  }, [name, username, bio, banner, socialLinks, session]);

  // Handle page navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleRouteChange = () => {
      if (hasUnsavedChanges) {
        setShowSaveWarning(true);
        return false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Intercept navigation
    const originalPush = router.push;
    router.push = (...args) => {
      if (hasUnsavedChanges) {
        setShowSaveWarning(true);
        return;
      }
      return originalPush(...args);
    };

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.push = originalPush;
    };
  }, [hasUnsavedChanges, router]);

  const handleSaveAndContinue = async () => {
    await handleUpdateProfile(new Event('submit') as any);
    setShowSaveWarning(false);
  };

  const handleDiscardAndContinue = () => {
    setHasUnsavedChanges(false);
    setShowSaveWarning(false);
    // Reset to original values
    if (session?.user) {
      setName(session.user.name || "");
      setUsername(session.user.username || "");
      setBio(session.user.bio || "");
      setBanner(session.user.banner_url || null);
      const links = session.user.social_links ? 
        (typeof session.user.social_links === 'string' ? JSON.parse(session.user.social_links) : session.user.social_links) 
        : [];
      setSocialLinks(links);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile({ name, username, bio, social_links: socialLinks, banner_url: banner || undefined });
      if (res.success && res.user) {
        await update({ 
          name: res.user.name, 
          username: res.user.username, 
          bio: res.user.bio,
          banner_url: banner,
          social_links: socialLinks
        });
        setName(res.user.name);
        setUsername(res.user.username);
        setBio(res.user.bio);
        setHasUnsavedChanges(false);
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

  const handleAddSocialLink = () => {
    if (!newLinkUrl) return;
    const platform = detectPlatform(newLinkUrl);
    const newLink: SocialLink = {
        platform,
        url: newLinkUrl,
        name: newLinkName || getPlatformLabel(platform)
    };
    setSocialLinks([...socialLinks, newLink]);
    setNewLinkUrl("");
    setNewLinkName("");
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
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
        setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };
  
  const handleDeleteAccount = async () => {
    if (!session?.user?.username) return;
    if (deleteConfirm !== session.user.username) {
        toast.error("برجاء كتابة اسم المستخدم بشكل صحيح للتأكيد");
        return;
    }
    
    if (!window.confirm("هل أنت متأكد تماماً؟ سيتم مسح بياناتك نهائياً!")) return;
    
    setLoading(true);
    const res = await deleteAccount(deleteConfirm);
    if (res.success) {
      toast.success("تم حذف الحساب بنجاح. نراك لاحقاً!");
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
    { id: "general", label: "عام", icon: Sliders },
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
                      style={getBannerStyle(banner)}
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

                {/* 3. Social Links Section */}
                <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-8 shadow-sm space-y-6">
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <span>روابط التواصل والأعمال</span>
                  </h2>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Input 
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                        placeholder="اسم الرابط (مثلاً: ملفي الشخصي)"
                        className="h-12 rounded-xl bg-muted/40 font-medium flex-1"
                      />
                      <Input 
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="ضع الرابط هنا..."
                        className="h-12 rounded-xl bg-muted/40 font-medium flex-[2]"
                      />
                    </div>
                    <Button onClick={handleAddSocialLink} className="h-12 w-full rounded-xl flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      <span>إضافة الرابط</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {socialLinks.map((link, i) => {
                      const Icon = getPlatformIcon(link.platform);
                      return (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-card text-primary shadow-sm">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black">{link.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{link.url}</span>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveSocialLink(i)} className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Account Info Section */}
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
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      من خلال حذف حسابك، ستفقد جميع منشوراتك، دروسك، وإعجاباتك. لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 space-y-2">
                        <label className="text-[10px] font-black text-red-500/60 uppercase tracking-widest mr-1">لتأكيد الحذف، اكتب اسم المستخدم: <span className="text-red-500 underline">@{session.user.username}</span></label>
                        <Input 
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            placeholder={session.user.username || ""}
                            className="h-12 rounded-xl border-red-500/20 bg-card focus-visible:ring-red-500 text-red-500 font-bold"
                        />
                    </div>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={loading || deleteConfirm !== session.user.username}
                    className="w-full h-14 rounded-2xl text-base font-black transition-all shadow-lg hover:shadow-red-500/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "حذف حسابي نهائياً"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <GeneralSettings />
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

      <UnsavedChangesWarning 
        open={showSaveWarning}
        onOpenChange={setShowSaveWarning}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardAndContinue}
      />
    </div>
  );
}

function GeneralSettings() {
  const { resolvedTheme, setTheme } = useTheme();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [showLocation, setShowLocation] = useState(false);
  
  // New general settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [showReadTime, setShowReadTime] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(false);
  const [language, setLanguage] = useState("ar");
  const [timezone, setTimezone] = useState("Asia/Riyadh");
  const [fontSize, setFontSize] = useState("medium");
  const [autoSave, setAutoSave] = useState(true);
  const [showTrending, setShowTrending] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Theme */}
      <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-6 shadow-sm space-y-5">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Sliders className="w-5 h-5 text-primary" />
          <span>إعدادات عامة</span>
        </h2>

        {/* Dark/Light Mode */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              {resolvedTheme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <span className="text-sm font-black">الوضع الافتراضي</span>
              <p className="text-[10px] text-muted-foreground">{resolvedTheme === 'dark' ? 'الوضع الداكن مفعّل' : 'الوضع الفاتح مفعّل'}</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              resolvedTheme === 'dark' ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              resolvedTheme === 'dark' ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">لغة التطبيق</span>
              <p className="text-[10px] text-muted-foreground">{language === 'ar' ? 'العربية' : 'English'}</p>
            </div>
          </div>
          <select 
            value={language} 
            onChange={(e) => { setLanguage(e.target.value); toast.success('تم تغيير اللغة'); }}
            className="px-3 py-1.5 rounded-xl bg-background border border-border text-sm font-black"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">حجم الخط</span>
              <p className="text-[10px] text-muted-foreground">{fontSize === 'small' ? 'صغير' : fontSize === 'large' ? 'كبير' : 'متوسط'}</p>
            </div>
          </div>
          <select 
            value={fontSize} 
            onChange={(e) => { setFontSize(e.target.value); toast.success('تم تغيير حجم الخط'); }}
            className="px-3 py-1.5 rounded-xl bg-background border border-border text-sm font-black"
          >
            <option value="small">صغير</option>
            <option value="medium">متوسط</option>
            <option value="large">كبير</option>
          </select>
        </div>

        {/* Timezone */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">المنطقة الزمنية</span>
              <p className="text-[10px] text-muted-foreground">{timezone}</p>
            </div>
          </div>
          <select 
            value={timezone} 
            onChange={(e) => { setTimezone(e.target.value); toast.success('تم تغيير المنطقة الزمنية'); }}
            className="px-3 py-1.5 rounded-xl bg-background border border-border text-sm font-black"
          >
            <option value="Asia/Riyadh">الرياض</option>
            <option value="Asia/Dubai">دبي</option>
            <option value="Asia/Cairo">القاهرة</option>
            <option value="Europe/London">لندن</option>
            <option value="America/New_York">نيويورك</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-6 shadow-sm space-y-5">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <span>الإشعارات</span>
        </h2>

        {/* Main Notifications */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">الإشعارات العامة</span>
              <p className="text-[10px] text-muted-foreground">{notificationsOn ? 'مفعّلة' : 'مغلقة'}</p>
            </div>
          </div>
          <button
            onClick={() => { setNotificationsOn(!notificationsOn); toast.success(notificationsOn ? 'تم إيقاف الإشعارات' : 'تم تفعيل الإشعارات'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              notificationsOn ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              notificationsOn ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">إشعارات البريد الإلكتروني</span>
              <p className="text-[10px] text-muted-foreground">{emailNotifications ? 'مفعّلة' : 'مغلقة'}</p>
            </div>
          </div>
          <button
            onClick={() => { setEmailNotifications(!emailNotifications); toast.success(emailNotifications ? 'تم إيقاف إشعارات البريد' : 'تم تفعيل إشعارات البريد'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              emailNotifications ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              emailNotifications ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Smartphone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">الإشعارات الفورية</span>
              <p className="text-[10px] text-muted-foreground">{pushNotifications ? 'مفعّلة' : 'مغلقة'}</p>
            </div>
          </div>
          <button
            onClick={() => { setPushNotifications(!pushNotifications); toast.success(pushNotifications ? 'تم إيقاف الإشعارات الفورية' : 'تم تفعيل الإشعارات الفورية'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              pushNotifications ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              pushNotifications ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Sound Effects */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Volume2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">المؤثرات الصوتية</span>
              <p className="text-[10px] text-muted-foreground">{soundEnabled ? 'مفعّلة' : 'مغلقة'}</p>
            </div>
          </div>
          <button
            onClick={() => { setSoundEnabled(!soundEnabled); toast.success(soundEnabled ? 'تم إيقاف المؤثرات الصوتية' : 'تم تفعيل المؤثرات الصوتية'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              soundEnabled ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              soundEnabled ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-6 shadow-sm space-y-5">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span>الخصوصية</span>
        </h2>

        {/* Private Profile */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">ملف شخصي خاص</span>
              <p className="text-[10px] text-muted-foreground">{privateProfile ? 'المتابعون فقط' : 'عام للجميع'}</p>
            </div>
          </div>
          <button
            onClick={() => { setPrivateProfile(!privateProfile); toast.success(privateProfile ? 'تم جعل الملف عاماً' : 'تم جعل الملف خاصاً'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              privateProfile ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              privateProfile ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Show Online Status */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Wifi className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">حالة الاتصال</span>
              <p className="text-[10px] text-muted-foreground">{showOnlineStatus ? 'ظاهر للجميع' : 'مخفي'}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowOnlineStatus(!showOnlineStatus); toast.success(showOnlineStatus ? 'تم إخفاء حالة الاتصال' : 'تم إظهار حالة الاتصال'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              showOnlineStatus ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              showOnlineStatus ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Show Activity Status */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">حالة النشاط</span>
              <p className="text-[10px] text-muted-foreground">{showActivityStatus ? 'آخر نشاط ظاهر' : 'مخفي'}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowActivityStatus(!showActivityStatus); toast.success(showActivityStatus ? 'تم إخفاء حالة النشاط' : 'تم إظهار حالة النشاط'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              showActivityStatus ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              showActivityStatus ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Allow Messages */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">استقبال الرسائل</span>
              <p className="text-[10px] text-muted-foreground">{allowMessages ? 'مسموح للجميع' : 'المتابعون فقط'}</p>
            </div>
          </div>
          <button
            onClick={() => { setAllowMessages(!allowMessages); toast.success(allowMessages ? 'تم تقييد الرسائل' : 'تم السماح بالرسائل'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              allowMessages ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              allowMessages ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Show Email */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">إظهار البريد الإلكتروني</span>
              <p className="text-[10px] text-muted-foreground">{showEmail ? 'ظاهر في الملف الشخصي' : 'مخفي'}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowEmail(!showEmail); toast.success(showEmail ? 'تم إخفاء البريد الإلكتروني' : 'تم إظهار البريد الإلكتروني'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              showEmail ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              showEmail ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Location Visibility */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">إظهار الموقع</span>
              <p className="text-[10px] text-muted-foreground">{showLocation ? 'ظاهر (الرياض، سعودية ...)' : 'مخفي عن الجميع'}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowLocation(!showLocation); toast.success(showLocation ? 'تم إخفاء الموقع' : 'تم إظهار الموقع'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              showLocation ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              showLocation ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>
      </div>

      {/* Content & Display */}
      <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-6 shadow-sm space-y-5">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          <span>المحتوى والعرض</span>
        </h2>

        {/* Auto Play Videos */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Video className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">تشغيل الفيديو تلقائياً</span>
              <p className="text-[10px] text-muted-foreground">{autoPlayVideos ? 'مفعّل' : 'مغلقة'}</p>
            </div>
          </div>
          <button
            onClick={() => { setAutoPlayVideos(!autoPlayVideos); toast.success(autoPlayVideos ? 'تم إيقاف التشغيل التلقائي' : 'تم تفعيل التشغيل التلقائي'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              autoPlayVideos ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              autoPlayVideos ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Data Saver */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <WifiOff className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">توفير البيانات</span>
              <p className="text-[10px] text-muted-foreground">{dataSaver ? 'مفعّل' : 'مغلقة'}</p>
            </div>
          </div>
          <button
            onClick={() => { setDataSaver(!dataSaver); toast.success(dataSaver ? 'تم إيقاف توفير البيانات' : 'تم تفعيل توفير البيانات'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              dataSaver ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              dataSaver ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Compact View */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Archive className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">عرض مكثف</span>
              <p className="text-[10px] text-muted-foreground">{compactView ? 'مفعّل' : 'مغلقة'}</p>
            </div>
          </div>
          <button
            onClick={() => { setCompactView(!compactView); toast.success(compactView ? 'تم إيقاف العرض المكثف' : 'تم تفعيل العرض المكثف'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              compactView ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              compactView ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Show Read Time */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">وقت القراءة</span>
              <p className="text-[10px] text-muted-foreground">{showReadTime ? 'ظاهر' : 'مخفي'}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowReadTime(!showReadTime); toast.success(showReadTime ? 'تم إخفاء وقت القراءة' : 'تم إظهار وقت القراءة'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              showReadTime ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              showReadTime ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Show Trending */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">عرض المنشورات الرائجة</span>
              <p className="text-[10px] text-muted-foreground">{showTrending ? 'ظاهر' : 'مخفي'}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowTrending(!showTrending); toast.success(showTrending ? 'تم إخفاء المنشورات الرائجة' : 'تم إظهار المنشورات الرائجة'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              showTrending ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              showTrending ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Show Suggestions */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">عرض الاقتراحات</span>
              <p className="text-[10px] text-muted-foreground">{showSuggestions ? 'ظاهر' : 'مخفي'}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowSuggestions(!showSuggestions); toast.success(showSuggestions ? 'تم إخفاء الاقتراحات' : 'تم إظهار الاقتراحات'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              showSuggestions ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              showSuggestions ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>
      </div>

      {/* Data & Storage */}
      <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border p-6 shadow-sm space-y-5">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Archive className="w-5 h-5 text-primary" />
          <span>البيانات والتخزين</span>
        </h2>

        {/* Auto Backup */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <RefreshCw className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">نسخ احتياطي تلقائي</span>
              <p className="text-[10px] text-muted-foreground">{autoBackup ? 'مفعّل' : 'مغلقة'}</p>
            </div>
          </div>
          <button
            onClick={() => { setAutoBackup(!autoBackup); toast.success(autoBackup ? 'تم إيقاف النسخ الاحتياطي' : 'تم تفعيل النسخ الاحتياطي'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              autoBackup ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              autoBackup ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Auto Save */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Download className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">حفظ تلقائي</span>
              <p className="text-[10px] text-muted-foreground">{autoSave ? 'مفعّل' : 'مغلقة'}</p>
            </div>
          </div>
          <button
            onClick={() => { setAutoSave(!autoSave); toast.success(autoSave ? 'تم إيقاف الحفظ التلقائي' : 'تم تفعيل الحفظ التلقائي'); }}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors duration-300",
              autoSave ? "bg-primary" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
              autoSave ? "right-0.5" : "right-[calc(100%-1.625rem)]"
            )} />
          </button>
        </div>

        {/* Clear Cache Button */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Trash className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-black">مسح البيانات المؤقتة</span>
              <p className="text-[10px] text-muted-foreground">تحرير مساحة التخزين</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => { toast.success('تم مسح البيانات المؤقتة'); }}
            className="rounded-xl font-black"
          >
            مسح
          </Button>
        </div>
      </div>
    </div>
  );
}
