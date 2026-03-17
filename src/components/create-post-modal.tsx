"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lightbulb, Info, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { createPost } from "@/lib/actions";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function CreatePostModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    lesson: "",
    imageUrl: "",
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.story || !formData.lesson) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (formData.story.length < 20) {
      toast.error("قصة الفشل يجب أن تكون 20 حرفاً على الأقل");
      return;
    }

    if (formData.lesson.length < 10) {
      toast.error("الدرس المستفاد يجب أن يكون 10 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const res = await createPost({ ...formData, tags: [] });
      if (res.success) {
        toast.success("تم نشر قصتك بنجاح!");
        onOpenChange(false);
        setFormData({ title: "", story: "", lesson: "", imageUrl: "" });
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const userName = session?.user?.name || "مستخدم";
  const userHandle = session?.user?.username || userName;
  const userAvatar = session?.user?.image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-card" dir="rtl">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center justify-between">
            <span>شارك منشور فشلك</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* User Info */}
          <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
            <Avatar className="w-12 h-12 border-2 border-primary/20">
              <AvatarImage src={userAvatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-black">{userName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{userName}</span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">@{userHandle}</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <span>العنوان المحفز</span>
            </label>
            <Input 
              placeholder="عن ماذا فشلت هذه المرة؟" 
              className="h-14 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary text-base font-bold placeholder:font-normal transition-all focus:bg-card"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Story */}
          <div className="space-y-3 relative group">
             <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <span>منشور الفشل (بصدق تام)</span>
            </label>
            <Textarea 
              placeholder="احكِ لنا ما الذي حدث فعلاً؟ أين كان الخطأ؟ كن صريحاً، فنحن هنا لنتعلم..." 
              className="min-h-[180px] rounded-2xl bg-muted/40 border-border focus-visible:ring-primary resize-none p-5 text-base leading-relaxed transition-all focus:bg-card"
              value={formData.story}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setFormData({ ...formData, story: e.target.value });
                }
              }}
            />
            <div className={cn(
              "text-[10px] font-bold absolute bottom-4 left-4 p-1.5 rounded-md bg-card border border-border",
              formData.story.length < 20 ? "text-red-500" : "text-primary"
            )}>
              {formData.story.length} / 1000
            </div>
          </div>

          {/* Lesson */}
          <div className="space-y-3 p-6 rounded-[2rem] bg-primary/[0.03] border-2 border-dashed border-primary/20 relative group/lesson overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-focus-within/lesson:bg-primary/10 transition-colors" />
            <label className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-2 relative z-10">
              <div className="p-1 rounded-md bg-primary/10 shadow-[0_0_10px_rgba(147,51,234,0.3)]">
                <Lightbulb className="w-3 h-3 fill-primary" />
              </div>
              <span>الدرس الذهبي المستخلص</span>
            </label>
            <Textarea 
              placeholder="ما هي الحكمة التي خرجت بها؟" 
              className="min-h-[100px] bg-transparent border-none focus-visible:ring-0 resize-none p-0 text-xl font-black text-foreground placeholder:text-muted-foreground/30 placeholder:font-normal leading-relaxed relative z-10 italic"
              value={formData.lesson}
              onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
            />
            <div className="text-[10px] font-bold text-primary/40 relative z-10 text-left">أهم جزء في قصتك</div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <span>رابط صورة تعبيرية (اختياري)</span>
            </label>
            <Input 
              placeholder="ضع رابط صورة هنا..." 
              className="h-12 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary text-xs font-medium"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="p-8 bg-muted/5 border-t border-border/50 flex items-center justify-between sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl px-8 font-bold hover:bg-muted" disabled={loading}>إلغاء</Button>
          <Button 
            className="bg-primary text-white rounded-2xl px-12 h-14 font-black text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Sparkles className="ml-2 h-5 w-5" />}
            انشر المنشور
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
