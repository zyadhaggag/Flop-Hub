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
import { Lightbulb, Loader2, Sparkles, Check, ChevronDown, ImagePlus, X, AlertCircle } from "lucide-react";
import { useState, useMemo, useRef, useCallback } from "react";
import { createPost } from "@/lib/actions";
import { uploadImage } from "@/lib/supabase";
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

// Client-side image compression — resize to max 800px and compress to quality 0.7
async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(file); return; } // fallback: return original
          
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) { resolve(file); return; } // fallback: return original
              const compressed = new File([blob], file.name, { type: "image/jpeg" });
              resolve(compressed);
            },
            "image/jpeg",
            quality
          );
        } catch {
          resolve(file); // fallback: return original on any error
        }
      };
      img.onerror = () => resolve(file); // fallback
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file); // fallback
    reader.readAsDataURL(file);
  });
}

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
  
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return CATEGORIES;
    return CATEGORIES.filter(c => c.label.includes(categorySearch) || c.id.includes(categorySearch.toLowerCase()));
  }, [categorySearch]);

  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة فقط");
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB max before compression
      toast.error("حجم الصورة كبير جداً (أقصى 10 ميجابايت)");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      let finalImageUrl = formData.imageUrl;

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          const compressed = await compressImage(imageFile);
          const uniqueName = `${crypto.randomUUID()}_${Date.now()}.jpg`;
          const path = `posts/${session?.user?.id}/${uniqueName}`;
          finalImageUrl = await uploadImage(compressed, "post-images", path);
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          toast.error("فشل رفع الصورة، سيتم نشر المنشور بدون صورة");
          finalImageUrl = "";
        } finally {
          setUploadingImage(false);
        }
      }

      const res = await createPost({ ...formData, imageUrl: finalImageUrl, tags: [] });
      if (res.success) {
        toast.success("تم نشر قصتك بنجاح!");
        onOpenChange(false);
        setFormData({ title: "", story: "", lesson: "", imageUrl: "", category: "" });
        setImageFile(null);
        setImagePreview(null);
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
              <AvatarImage src={userAvatar || "/api/placeholder/user"} />
              <AvatarFallback className="bg-primary/10 text-primary font-black">{userName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{userName}</span>
              <span className="text-[11px] text-muted-foreground">@{userHandle}</span>
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-3 bg-muted/20 p-4 rounded-3xl border border-border/40">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              <span>اختر تصنيف المنشور</span>
              {selectedCat && <span className="text-primary animate-pulse">تم الاختيار: {selectedCat.label}</span>}
            </label>
            
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

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">صورة تعبيرية (اختياري)</label>
            
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-border/50 group/img">
                <img src={imagePreview} alt="معاينة" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-border/50 hover:border-primary/40 bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer group/upload"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover/upload:scale-110 transition-transform">
                  <ImagePlus className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">اضغط لاختيار صورة أو اسحبها هنا</p>
                  <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG — أقصى 10 ميجابايت</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
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
