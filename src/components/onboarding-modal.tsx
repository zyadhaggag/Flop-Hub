"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Image as ImageIcon, Sparkles, Loader2, ArrowLeft, Check, Plus, X, Trophy, ShieldCheck } from "lucide-react";
import { CHALLENGES } from "@/lib/frames-challenges";
import { updateProfile } from "@/lib/actions";
import { ProfileBannerSelector } from "./profile-banner-selector";
import { uploadImage } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { detectPlatform, getPlatformIcon, getPlatformLabel, SocialLink } from "@/lib/social-links";

const TOTAL_STEPS = 6;

// Matches all 15 presets in ProfileBannerSelector
const BANNER_STYLES: Record<string, { backgroundImage: string; backgroundColor?: string; backgroundSize?: string }> = {
  'banner-1':  { backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)' },
  'banner-2':  { backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)' },
  'banner-3':  { backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  'banner-4':  { backgroundImage: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' },
  'banner-5':  { backgroundImage: 'linear-gradient(135deg, #000000 0%, #1e293b 100%)' },
  'banner-6':  { backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundColor: '#000', backgroundSize: '20px 20px' },
  'banner-7':  { backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)', backgroundColor: '#111827', backgroundSize: '30px 30px' },
  'banner-8':  { backgroundImage: 'radial-gradient(circle at center, #7c3aed 0%, #000 100%)' },
  'banner-9':  { backgroundImage: 'linear-gradient(45deg, #ff00cc, #3333ff)' },
  'banner-10': { backgroundImage: 'repeating-linear-gradient(45deg, #222 0, #222 1px, transparent 0, transparent 50%)', backgroundColor: '#1a1a1a', backgroundSize: '10px 10px' },
  'banner-11': { backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  'banner-12': { backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  'banner-13': { backgroundImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  'banner-14': { backgroundImage: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  'banner-15': { backgroundImage: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
};

function getBannerStyle(banner: string | null): React.CSSProperties {
  if (!banner) return {};
  if (banner.startsWith('custom-')) {
    const parts = banner.replace('custom-', '').split('-');
    if (parts.length === 2) {
      return { backgroundImage: `linear-gradient(135deg, #${parts[0]}, #${parts[1]})` };
    }
  }
  const key = banner.startsWith('preset-') ? banner.replace('preset-', 'banner-') : null;
  if (key && BANNER_STYLES[key]) return BANNER_STYLES[key];
  if (banner.startsWith('http') || banner.startsWith('/')) {
    return { backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return {};
}

const STEP_LABELS = ["الغلاف", "الصورة", "معلوماتي", "روابطي", "الشروط", "التحديات"];

export function OnboardingModal() {
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasSuccess, setHasSuccess] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptContent, setAcceptContent] = useState(false);

  useEffect(() => {
    // Only show if user is logged in, missing vital info, hasn't succeeded yet, AND hasn't deferred it this session
    const isDeferred = typeof window !== 'undefined' && sessionStorage.getItem("onboarding_deferred");
    if (session?.user && !session.user.bio && !session.user.banner_url && !hasSuccess && !isDeferred) {
      setIsOpen(true);
      setName(session.user.name || "");
    }
  }, [session, hasSuccess]);

  const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleAddSocialLink = () => {
    if (!newLinkUrl.trim()) return;
    const platform = detectPlatform(newLinkUrl);
    const newLink: SocialLink = {
      platform,
      url: newLinkUrl,
      name: getPlatformLabel(platform)
    };
    setSocialLinks([...socialLinks, newLink]);
    setNewLinkUrl("");
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      let finalAvatar = session?.user?.image || "";
      
      if (avatarFile) {
        const path = `avatars/${session?.user?.id}_${Date.now()}.jpg`;
        finalAvatar = await uploadImage(avatarFile, "avatars", path);
      }

      const res = await updateProfile({ 
        name, 
        bio, 
        banner_url: banner || undefined,
        image_url: finalAvatar,
        social_links: socialLinks
      });

      if (res.success) {
        setHasSuccess(true);
        await update({ 
          name, 
          bio, 
          banner_url: banner,
          image: finalAvatar,
          social_links: socialLinks
        });
        toast.success("تم تخصيص حسابك بنجاح! 🎉");
        
        // Mark as deferred so it doesn't pop back even if session update is slow
        sessionStorage.setItem("onboarding_deferred", "true");
        
        setTimeout(() => {
          setIsOpen(false);
        }, 500);
      } else {
        toast.error(res.error || "حدث خطأ");
      }
    } catch (err) {
      toast.error("فشل تحديث البيانات");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const bannerStyle = getBannerStyle(banner);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[480px] p-0 overflow-hidden rounded-[2rem] border border-border/50 shadow-2xl font-tajawal z-[200] max-h-[90svh] flex flex-col" 
        dir="rtl"
      >
        {/* Progress bar + step counter */}
        <div className="shrink-0 px-6 pt-5 pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-black text-foreground">لنقم بتخصيص حسابك!</span>
            </div>
            <span className="text-xs font-black text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              الخطوة {step} من {TOTAL_STEPS}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 rounded-full" 
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          {/* Step labels */}
          <div className="flex justify-between px-0.5">
            {STEP_LABELS.map((label, i) => (
              <span 
                key={i}
                className={cn(
                  "text-[10px] font-black transition-colors",
                  step === i + 1 ? "text-primary" : step > i + 1 ? "text-primary/50" : "text-muted-foreground/40"
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 py-2 min-h-0">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              <div className="space-y-3">
                <label className="text-sm font-black text-foreground block">تنسيق الغلاف <span className="text-muted-foreground font-medium">(اختياري)</span></label>
                <div className="relative h-24 rounded-2xl border-2 border-dashed border-primary/20 bg-muted/30 overflow-hidden flex items-center justify-center">
                  {banner ? (
                    <div 
                      className="absolute inset-0" 
                      suppressHydrationWarning
                      style={bannerStyle} 
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-primary/30">
                      <ImageIcon className="w-7 h-7" />
                      <span className="text-xs font-bold">اختر غلافاً من الأسفل</span>
                    </div>
                  )}
                </div>
                <ProfileBannerSelector currentBanner={banner} onSelect={(id) => setBanner(id)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300 flex flex-col items-center py-4">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-primary/10 overflow-hidden bg-muted flex items-center justify-center shadow-xl">
                  {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                  ) : (
                    <Camera className="w-10 h-10 text-primary/30" />
                  )}
                </div>
                <label className="absolute bottom-0 left-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                </label>
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-black text-lg">صورتك الشخصية</h3>
                <p className="text-sm text-muted-foreground font-medium">اختر صورة تعبر عنك وتميزك</p>
                {avatar && (
                  <button 
                    onClick={() => { setAvatar(null); setAvatarFile(null); }}
                    className="text-xs text-red-400 hover:text-red-500 font-bold mt-1"
                  >
                    إزالة الصورة
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground block">الاسم الشخصي</label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك الذي يراه الجميع"
                  className="h-12 rounded-xl bg-muted/40 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-foreground block">نبذة عنك <span className="text-muted-foreground font-normal">(Bio)</span></label>
                <Textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="أخبرنا عن رحلتك، تجاربك، وما تعلمته من الفشل..."
                  className="min-h-[110px] rounded-xl bg-muted/40 font-medium leading-relaxed resize-none"
                />
                <p className="text-[11px] text-muted-foreground text-left">{bio.length}/160</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
              <div className="space-y-3">
                <label className="text-sm font-black text-foreground block">روابط التواصل والأعمال</label>
                <div className="flex gap-2">
                  <Input 
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSocialLink()}
                    placeholder="رابط (Twitter, Instagram, LinkedIn...)"
                    className="h-11 rounded-xl bg-muted/40 font-bold"
                  />
                  <Button onClick={handleAddSocialLink} type="button" className="h-11 w-11 rounded-xl p-0 shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
                {socialLinks.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">لا توجد روابط بعد · اختياري</p>
                )}
                {socialLinks.map((link, i) => {
                  const Icon = getPlatformIcon(link.platform);
                  return (
                    <a 
                      key={i} 
                      href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 transition-all hover:bg-muted/50 group/link cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-card text-primary shadow-sm">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black">{link.name}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleRemoveSocialLink(i); }} 
                        className="text-muted-foreground hover:text-red-500 transition-colors relative z-20"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
              <div className="text-center space-y-2 pb-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-black text-lg">الشروط والخصوصية</h3>
                <p className="text-xs text-muted-foreground font-medium">وافق على الشروط للمتابعة</p>
              </div>

              <label className={cn(
                "flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all",
                acceptTerms ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border/50 hover:border-primary/20"
              )}>
                <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 accent-primary w-4 h-4" />
                <div>
                  <span className="text-sm font-black block">أوافق على شروط الاستخدام وسياسة الخصوصية</span>
                  <span className="text-[10px] text-muted-foreground">بالموافقة، أنت تقبل شروط استخدام منصة FlopHub وسياسة حماية بياناتك الشخصية.</span>
                </div>
              </label>

              <label className={cn(
                "flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all",
                acceptContent ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border/50 hover:border-primary/20"
              )}>
                <input type="checkbox" checked={acceptContent} onChange={(e) => setAcceptContent(e.target.checked)} className="mt-1 accent-primary w-4 h-4" />
                <div>
                  <span className="text-sm font-black block">أتعهد بنشر محتوى حقيقي عن الفشل والأخطاء</span>
                  <span className="text-[10px] text-muted-foreground">أتعهد بأن أشارك تجارب فشل حقيقية وأخطاء واقعية بهدف التعلم، بدون محتوى مزيف أو مضلل.</span>
                </div>
              </label>

              {!acceptTerms || !acceptContent ? (
                <p className="text-[11px] text-red-500 text-center font-bold">يجب الموافقة على جميع الشروط للمتابعة</p>
              ) : (
                <p className="text-[11px] text-primary text-center font-bold">✓ تم قبول جميع الشروط</p>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              <div className="text-center space-y-2 pb-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Trophy className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-black text-lg">تحديات FlopHub</h3>
                <p className="text-xs text-muted-foreground font-medium">أكمل التحديات لفتح إطارات مميزة لصورتك!</p>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto no-scrollbar">
                {CHALLENGES.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
                      {ch.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-black block">{ch.titleAr}</span>
                      <span className="text-[10px] text-muted-foreground">{ch.descriptionAr}</span>
                    </div>
                    <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg shrink-0">
                      {ch.rewardAr}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center pt-1">يتم تتبع تقدمك تلقائياً · لا حاجة لتسجيل شيء</p>
            </div>
          )}
        </div>

        {/* Fixed footer */}
        <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-background flex items-center gap-3">
          {step > 1 && (
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={loading} 
              className="h-11 px-5 rounded-xl font-black text-muted-foreground hover:text-foreground"
            >
              رجوع
            </Button>
          )}
          <div className="flex-1" />
          {step < TOTAL_STEPS ? (
            <Button 
              onClick={handleNext} 
              disabled={step === 5 && (!acceptTerms || !acceptContent)}
              variant="brand"
              className="h-11 px-8 rounded-xl font-black gap-2"
            >
              التالي
              <ArrowLeft className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleFinish} 
              disabled={loading} 
              className="h-11 px-8 rounded-xl font-black gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>جاهز!</span> <Check className="w-4 h-4" /></>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
