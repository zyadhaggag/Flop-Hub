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
import { Lightbulb, Loader2, Sparkles, Search, Check, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { createPost } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const CATEGORIES = [
  { id: "tech", label: "تقني", emoji: "💻" },
  { id: "medical", label: "طبي", emoji: "🏥" },
  { id: "sports", label: "رياضي", emoji: "⚽" },
  { id: "religious", label: "ديني", emoji: "🕌" },
  { id: "business", label: "تجاري", emoji: "💼" },
  { id: "education", label: "تعليمي", emoji: "📚" },
  { id: "social", label: "اجتماعي", emoji: "👥" },
  { id: "personal", label: "شخصي", emoji: "🙋" },
  { id: "financial", label: "مالي", emoji: "💰" },
  { id: "creative", label: "إبداعي", emoji: "🎨" },
  { id: "career", label: "مهني", emoji: "👔" },
  { id: "relationship", label: "عاطفي", emoji: "❤️" },
  { id: "other", label: "أخرى", emoji: "📌" },
];

export function CreatePostModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    lesson: "",
    imageUrl: "",
    category: "",
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return CATEGORIES;
    return CATEGORIES.filter(c => c.label.includes(categorySearch) || c.id.includes(categorySearch.toLowerCase()));
  }, [categorySearch]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.story || !formData.lesson) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (!formData.category) {
      toast.error("يرجى اختيار تصنيف المنشور");
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
        setFormData({ title: "", story: "", lesson: "", imageUrl: "", category: "" });
        setShowCategoryDropdown(false);
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
  const selectedCat = CATEGORIES.find(c => c.id === formData.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-card" dir="rtl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-black tracking-tight">شارك بمنشور فشل</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {/* User Info */}
          <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-2xl border border-border/50">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src={userAvatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-black">{userName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{userName}</span>
              <span className="text-[11px] text-muted-foreground">@{userHandle}</span>
            </div>
          </div>

          {/* Category Selector - Large Dropdown */}
          <div className="space-y-3 bg-muted/20 p-4 rounded-3xl border border-border/40">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              <span>اختر تصنيف المنشور</span>
              {selectedCat && <span className="text-primary animate-pulse">تم الاختيار: {selectedCat.label}</span>}
            </label>
            
            {/* Custom Large Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full h-14 rounded-2xl bg-background border border-border px-4 py-3 text-sm font-black flex items-center justify-between hover:border-primary/50 transition-colors"
              >
                <span className={selectedCat ? "text-foreground" : "text-muted-foreground"}>
                  {selectedCat ? `${selectedCat.emoji} ${selectedCat.label}` : "اختر تصنيف المنشور..."}
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", showCategoryDropdown && "rotate-180")} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-lg z-50 max-h-[300px] overflow-y-auto">
                  <div className="p-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: cat.id });
                          setShowCategoryDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-colors text-right",
                          formData.category === cat.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50 text-foreground"
                        )}
                      >
                        <span className="text-xl bg-muted/50 w-10 h-10 rounded-xl flex items-center justify-center">
                          {cat.emoji}
                        </span>
                        <div className="flex flex-col items-start flex-1">
                          <span>{cat.label}</span>
                          <span className="text-[10px] opacity-40 font-bold uppercase">{cat.id}</span>
                        </div>
                        {formData.category === cat.id && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">العنوان المحفز</label>
            <Input 
              placeholder="عن ماذا فشلت هذه المرة؟" 
              className="h-14 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary text-base font-bold placeholder:font-normal transition-all focus:bg-card"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Story */}
          <div className="space-y-2 relative group">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">منشور الفشل (بصدق تام)</label>
            <Textarea 
              placeholder="احكِ لنا ما الذي حدث فعلاً؟ أين كان الخطأ؟ كن صريحاً..." 
              className="min-h-[120px] rounded-2xl bg-muted/40 border-border focus-visible:ring-primary resize-none p-4 text-base leading-relaxed transition-all focus:bg-card"
              value={formData.story}
              onChange={(e) => {
                if (e.target.value.length <= 1000) setFormData({ ...formData, story: e.target.value });
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
          <div className="space-y-2 p-5 rounded-[2rem] bg-primary/[0.03] border-2 border-dashed border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <label className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 relative z-10">
              <div className="p-1 rounded-md bg-primary/10"><Lightbulb className="w-3 h-3 fill-primary" /></div>
              <span>الدرس الذهبي</span>
            </label>
            <Textarea 
              placeholder="ما هي الحكمة التي خرجت بها؟" 
              className="min-h-[80px] bg-transparent border-none focus-visible:ring-0 resize-none p-0 text-lg font-black text-foreground placeholder:text-muted-foreground/30 leading-relaxed relative z-10 italic"
              value={formData.lesson}
              onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">رابط صورة تعبيرية (اختياري)</label>
            <Input 
              placeholder="ضع رابط صورة هنا..." 
              className="h-12 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary text-xs font-medium"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 bg-card border-t border-border/50">
          <div className="flex items-center justify-between w-full gap-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl px-5 font-bold hover:bg-muted h-12 text-muted-foreground shrink-0" disabled={loading}>إلغاء</Button>
            <Button 
              className="flex-1 bg-primary text-white rounded-2xl px-6 h-12 font-black text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-w-0" 
              onClick={handleSubmit} 
              disabled={loading || !formData.category}
            >
              <div className="flex items-center gap-2 truncate">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="truncate">انشر المنشور</span>
                {selectedCat && <span className="text-[10px] opacity-80 whitespace-nowrap bg-white/10 px-1.5 py-0.5 rounded-md">({selectedCat.label})</span>}
              </div>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
