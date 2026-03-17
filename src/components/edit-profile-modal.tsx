"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Camera, Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditProfileModalProps {
  user: {
    name: string;
    bio: string;
    image_url: string;
  };
}

export function EditProfileModal({ user }: EditProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    image_url: user.image_url || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let finalImageUrl = formData.image_url;
    
    if (file) {
      try {
        const { uploadImage } = await import("@/lib/supabase");
        const path = `avatars/${Date.now()}_${file.name}`;
        finalImageUrl = await uploadImage(file, "avatars", path);
      } catch (err) {
        toast.error("فشل رفع الصورة");
        setLoading(false);
        return;
      }
    }
    
    const res = await updateProfile({ ...formData, image_url: finalImageUrl });
    
    if (res.success) {
      toast.success("تم تحديث الملف الشخصي بنجاح");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "حدث خطأ");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="rounded-2xl gap-2 font-bold h-10 px-6 border-primary/20 hover:bg-primary/5 hover:border-primary transition-all">
            <Settings className="w-4 h-4 text-primary" />
            <span>تعديل الملف</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-3xl font-tajawal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right">تعديل الملف الشخصي</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4" dir="rtl">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">الاسم</label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 rounded-xl bg-muted/40 border-border focus:bg-muted/60 transition-all font-bold"
              placeholder="اسمك الكامل"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">الصورة الشخصية</label>
            <div className="relative">
              <Input 
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="h-12 rounded-xl bg-muted/40 border-border focus:bg-muted/60 transition-all font-bold pt-2.5"
              />
              <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">نبذة عنك (Bio)</label>
            <Textarea 
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-[100px] rounded-xl bg-muted/40 border-border focus:bg-muted/60 transition-all font-medium leading-relaxed"
              placeholder="أخبرنا قليلاً عن نفسك..."
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 rounded-xl text-lg font-black bg-primary hover:bg-primary/90 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ التغييرات"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
