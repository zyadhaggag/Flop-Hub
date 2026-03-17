"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Image as ImageIcon, Sparkles, Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { updateProfile } from "@/lib/actions";
import { ProfileBannerSelector } from "./profile-banner-selector";
import { uploadImage } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export function OnboardingModal() {
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (session?.user && !session.user.bio && !session.user.banner_url) {
      setIsOpen(true);
      setName(session.user.name || "");
    }
  }, [session]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

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
        image_url: finalAvatar
      });

      if (res.success) {
        await update({ 
          name, 
          bio, 
          banner_url: banner,
          image: finalAvatar
        });
        toast.success("تم تخصيص حسابك بنجاح!");
        setIsOpen(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl animate-in zoom-in-95 duration-300 font-tajawal z-[200]" dir="rtl">
        <div className="bg-primary/5 h-1.5 w-full flex">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <DialogHeader className="text-right space-y-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight">لنقم بتخصيص حسابك!</DialogTitle>
            <DialogDescription className="text-base font-medium opacity-70">
              تحدث التغييرات في كل الموقع لتبرز هويتك الفريدة.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-[300px] py-4">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-3">
                  <label className="text-sm font-black text-foreground mr-1">تنسيق الغلاف (اختياري)</label>
                  <div className="relative h-28 rounded-2xl border-2 border-dashed border-primary/20 bg-muted/30 overflow-hidden flex items-center justify-center">
                    {banner ? (
                       <div 
                         className="absolute inset-0 bg-cover bg-center" 
                         style={{ 
                            background: banner.startsWith('preset-') 
                              ? BANNER_STYLES[banner.replace('preset-', 'banner-')] || `linear-gradient(135deg, #6366f1 0%, #a855f7 100%)`
                              : `url(${banner})`,
                            backgroundSize: banner === 'preset-6' ? '20px 20px' : banner === 'preset-7' ? '30px 30px' : banner === 'preset-10' ? '10px 10px' : 'cover'
                         }} 
                       />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-primary/30" />
                    )}
                  </div>
                  <ProfileBannerSelector currentBanner={banner} onSelect={(id) => setBanner(id)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-left-4 duration-300 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-primary/10 overflow-hidden bg-muted flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-10 h-10 text-primary/30" />
                    )}
                  </div>
                  <label className="absolute bottom-0 left-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                    <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                  </label>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-black text-lg">الصورة الشخصية</h3>
                  <p className="text-sm text-muted-foreground font-medium">اختر صورة تعبر عنك</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-black text-foreground mr-1">الاسم الشخصي</label>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك الحقيقي"
                    className="h-12 rounded-xl bg-muted/40 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-foreground mr-1">نبذة عنك (Bio)</label>
                  <Textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="أخبرنا المزيد عن رحلتك..."
                    className="min-h-[120px] rounded-xl bg-muted/40 font-medium leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row-reverse gap-3 pt-6 border-t border-border mt-4">
            {step < 3 ? (
              <Button onClick={handleNext} className="h-12 flex-1 rounded-2xl font-black gap-2 text-base">
                متابعة
                <ArrowLeft className="w-5 h-5" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading} className="h-12 flex-1 rounded-2xl font-black gap-2 text-base bg-emerald-600 hover:bg-emerald-700">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>جاهز للانطلاق! <Check className="w-5 h-5" /></>}
              </Button>
            )}
            
            {step > 1 && (
              <Button variant="ghost" onClick={handleBack} disabled={loading} className="h-12 px-6 rounded-2xl font-black text-muted-foreground">
                رجوع
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
