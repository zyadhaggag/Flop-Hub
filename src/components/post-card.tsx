"use client";

import NextImage from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Loader2, MessageCircle, Share2, MoreHorizontal, Lightbulb, Trash2, Edit2, Send, Bookmark, UserPlus, UserMinus, Plus, Check } from "lucide-react";
import { toggleHelpful, deletePost, addComment, getComments, toggleFollow, toggleSave } from "@/lib/actions";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface PostCardProps {
  id: string;
  user: {
     id: string;
     name: string;
     handle: string;
     avatar: string;
  };
  time: string;
  title: string;
  story: string;
  lesson: string;
  imageUrl?: string | null;
  helpfulCount: number;
  commentsCount: number;
  hasReacted?: boolean;
  isSaved?: boolean;
}

export function PostCard({ id, user, time, title, story, lesson, imageUrl, helpfulCount, commentsCount, hasReacted: initialHasReacted, isSaved: initialIsSaved }: PostCardProps) {
  const { data: session } = useSession();
  const [reacted, setReacted] = useState(initialHasReacted);
  const [saved, setSaved] = useState(initialIsSaved);
  const [count, setCount] = useState(helpfulCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // Should be passed as prop ideally
  const [isExpanded, setIsExpanded] = useState(false);
  const isOwner = session?.user?.id === user.id;

  const isLongStory = story.length > 280;
  const displayStory = isExpanded || !isLongStory ? story : story.substring(0, 280) + "...";

  const handleHelpful = async () => {
    if (!session) return toast.error("يجب تسجيل الدخول للإستفادة");
    setReacted(!reacted);
    setCount(prev => reacted ? prev - 1 : prev + 1);
    const res = await toggleHelpful(id);
    if (!res.success) {
      setReacted(reacted);
      setCount(count);
      toast.error("حدث خطأ");
    }
  };

  const handleSave = async () => {
    if (!session) return toast.error("يجب تسجيل الدخول لحفظ المنشور");
    setSaved(!saved);
    const res = await toggleSave(id);
    if (res.success) {
      toast.success(res.saved ? "تم الحفظ" : "تمت الإزالة من المحفوظات");
    } else {
      setSaved(!saved);
      toast.error("حدث خطأ");
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;
    const res = await deletePost(id);
    if (res.success) toast.success("تم الحذف بنجاح");
    else toast.error(res.error || "خطأ في الحذف");
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    const data = await getComments(id);
    setComments(data);
    setLoadingComments(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!session) return toast.error("يجب تسجيل الدخول للتعليق");

    const res = await addComment(id, newComment);
    if (res.success) {
      setNewComment("");
      fetchComments();
      toast.success("تمت إضافة التعليق");
    } else {
      toast.error(res.error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: story,
      url: window.location.origin + `/u/${user.handle}`, // Simple sharable URL
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("تم نسخ الرابط للمشاركة");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    if (!session) return toast.error("يجب تسجيل الدخول للمتابعة");
    const res = await toggleFollow(user.id);
    if (res.success) {
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "تم إلغاء المتابعة" : "تمت المتابعة");
    }
  };

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments]);

  const userInitial = user.name ? user.name[0] : '';

  return (
    <Card className="p-5 rounded-[2.5rem] border-border/40 shadow-sm hover:shadow-2xl transition-all duration-500 relative bg-card/40 backdrop-blur-xl group overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3">
          <Link href={`/u/${user.handle}`}>
            <Avatar className="w-10 h-10 border-2 border-background ring-2 ring-primary/10 hover:ring-primary/30 transition-all cursor-pointer">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <Link href={`/u/${user.handle}`} className="text-sm font-black hover:text-primary transition-colors leading-tight">
              {user.name}
            </Link>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
              <span>@{user.handle}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>{time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isOwner && (
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFollow} 
                className={cn(
                  "h-9 px-4 rounded-2xl text-xs font-bold transition-all gap-2",
                  isFollowing 
                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                )}
              >
               {isFollowing ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
               <span>{isFollowing ? "إلغاء المتابعة" : "متابعة"}</span>
             </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-2xl text-muted-foreground h-9 w-9 hover:bg-primary/10 hover:text-primary outline-none flex items-center justify-center focus:outline-none transition-all duration-300 border border-transparent hover:border-primary/20">
              <MoreHorizontal className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] p-2 rounded-2xl border-border/50 bg-card/95 backdrop-blur-lg shadow-2xl font-tajawal animate-in zoom-in-95 duration-200">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={() => toast.info("قريباً...")} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 focus:bg-primary/10 transition-colors">
                    <Edit2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">تعديل</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-bold">حذف</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleShare} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 focus:bg-primary/10 transition-colors">
                  <Share2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">مشاركة</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6 space-y-4 relative z-10 px-1">
        <Link href={`/p/${id}`}>
          <h3 className="font-black text-2xl leading-tight text-foreground hover:text-primary transition-colors cursor-pointer">{title}</h3>
        </Link>
        <div>
          <p className="text-[15px] text-muted-foreground/90 leading-relaxed whitespace-pre-wrap font-medium">
            {displayStory}
          </p>
          {isLongStory && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary text-xs font-black mt-2 hover:underline focus:outline-none"
            >
              {isExpanded ? "عرض أقل" : "إقرأ المزيد"}
            </button>
          )}
        </div>
        
        {imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] border border-border/50 shadow-sm mt-4 group/image">
             <NextImage 
               src={imageUrl} 
               alt={title} 
               fill
               className="object-cover transition-transform duration-700 group-hover/image:scale-105" 
               sizes="(max-width: 768px) 100vw, 672px"
             />
          </div>
        )}
      </div>

      <div className="mt-6 p-6 rounded-[2rem] bg-primary/5 border border-primary/10 relative group/lesson overflow-hidden shadow-inner backdrop-blur-sm">
        <div className="flex items-center gap-2 text-primary font-black text-sm mb-3 relative z-10">
          <Lightbulb className="w-4 h-4 fill-primary/20" />
          <span>الدرس المستفاد</span>
        </div>
        <p className="text-[14px] leading-7 text-foreground/90 font-bold italic relative z-10 border-r-4 border-primary/30 pr-4">
          {lesson}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-5 relative z-10">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleHelpful}
            suppressHydrationWarning
            className={cn(
              "rounded-2xl gap-2 h-10 px-5 transition-all duration-300",
              reacted ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
             <Lightbulb className={cn("w-4 h-4 transition-transform", reacted && "fill-primary scale-110")} />
             <span className="text-xs font-black">{count}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "text-muted-foreground hover:text-primary hover:bg-primary/5 gap-2 h-10 px-5 rounded-2xl transition-all duration-300",
              showComments && "bg-primary/20 text-primary"
            )}
          >
             <MessageCircle className="w-4 h-4" />
             <span className="text-xs font-black">{commentsCount}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSave} 
            className={cn(
              "h-10 w-10 rounded-2xl transition-all duration-300",
              saved ? "text-primary bg-primary/10 border-primary/20 border" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
             <Bookmark className={cn("w-4 h-4", saved && "fill-primary")} />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare} 
            className="text-muted-foreground hover:text-primary h-10 w-10 rounded-2xl transition-all duration-300 hover:bg-primary/5"
          >
             <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-border/40 space-y-6 animate-in slide-in-from-top-2 duration-300">
           <form onSubmit={handleAddComment} className="flex gap-3">
              <Input 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="أضف تعليقاً..."
                className="rounded-xl h-10 bg-muted/30 border-none focus:ring-primary/20"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-primary">
                 <Send className="w-4 h-4" />
              </Button>
           </form>

           <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar px-1">
              {loadingComments ? (
                 <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3 items-start">
                     <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={c.avatar_url} />
                        <AvatarFallback className="text-[10px]">{c.name?.[0]}</AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col bg-muted/30 p-3 rounded-2xl rounded-tr-none flex-1">
                        <span className="text-xs font-bold text-primary">@{c.username}</span>
                        <p className="text-sm mt-1 leading-relaxed">{c.content}</p>
                     </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-muted-foreground py-4">لا توجد تعليقات بعد. كن أول من يعلق!</p>
              )}
           </div>
        </div>
      )}
    </Card>
  );
}
