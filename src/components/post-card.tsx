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
import { toggleHelpful, deletePost, editPost, addComment, getComments, toggleFollow, toggleSave } from "@/lib/actions";
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
  isFollowed?: boolean;
}

export function PostCard({ id, user, time, title, story, lesson, imageUrl, helpfulCount, commentsCount, hasReacted: initialHasReacted, isSaved: initialIsSaved, isFollowed: initialIsFollowed }: PostCardProps) {
  const { data: session } = useSession();
  const [reacted, setReacted] = useState(initialHasReacted);
  const [saved, setSaved] = useState(initialIsSaved);
  const [count, setCount] = useState(helpfulCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowed || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title, story, lesson, tags: [], imageUrl: imageUrl });
  const [isSaving, setIsSaving] = useState(false);
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    setFormattedTime(new Date(time).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }));
  }, [time]);
  
  useEffect(() => {
    const handleFollowUpdate = (e: any) => {
      if (e.detail.userId === user.id) {
        setIsFollowing(e.detail.isFollowing);
      }
    };
    window.addEventListener('user-follow-updated', handleFollowUpdate);
    return () => window.removeEventListener('user-follow-updated', handleFollowUpdate);
  }, [user.id]);
  const [isExpanded, setIsExpanded] = useState(false);
  const isOwner = session?.user?.id === user.id;

  const isLongStory = story.length > 280;
  const displayStory = isExpanded || !isLongStory ? story : story.substring(0, 280) + "...";

  const handleHelpful = async () => {
    if (!session) return toast.error("يجب تسجيل الدخول للإعجاب");
    
    // Optimistic Update
    const prevReacted = reacted;
    const prevCount = count;
    setReacted(!prevReacted);
    setCount(prevReacted ? prevCount - 1 : prevCount + 1);

    const res = await toggleHelpful(id);
    if (!res.success) {
      setReacted(prevReacted);
      setCount(prevCount);
      toast.error("حدث خطأ");
    }
  };

  const handleSave = async () => {
    if (!session) return toast.error("يجب تسجيل الدخول لحفظ المنشور");
    
    // Optimistic Update
    const prevSaved = saved;
    setSaved(!prevSaved);

    const res = await toggleSave(id);
    if (res.success) {
      toast.success(res.saved ? "تم الحفظ" : "تمت الإزالة من المحفوظات");
    } else {
      setSaved(prevSaved);
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

  const handleAddComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!newComment.trim() || loadingComments) return;
    if (!session) return toast.error("يجب تسجيل الدخول للتعليق");

    setLoadingComments(true);
    const res = await addComment(id, newComment, parentId);
    if (res.success) {
      setNewComment("");
      setReplyingTo(null);
      await fetchComments();
      toast.success("تمت إضافة الرد");
    } else {
      toast.error(res.error || "تعذر إضافة التعليق");
    }
    setLoadingComments(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: story,
      url: window.location.origin + `/u/${user.handle}`, 
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

  const handleSaveEdit = async () => {
    setIsSaving(true);
    const res = await editPost(id, editData);
    if (res.success) {
      toast.success("تم تحديث المنشور");
      setIsEditing(false);
      window.location.reload();
    } else {
      toast.error(res.error || "فشل التحديث");
    }
    setIsSaving(false);
  };

  const handleFollow = async () => {
    if (!session) return toast.error("يجب تسجيل الدخول للمتابعة");
    if (isOwner) return;

    // Optimistic Update
    const prevFollowing = isFollowing;
    setIsFollowing(!prevFollowing);

    const res = await toggleFollow(user.id);
    if (res.success) {
      window.dispatchEvent(new CustomEvent('user-follow-updated', { 
        detail: { userId: user.id, isFollowing: res.followed } 
      }));
      toast.success(res.followed ? "تمت المتابعة" : "تم إلغاء المتابعة");
    } else {
      setIsFollowing(prevFollowing);
      toast.error(res.error || "حدث خطأ");
    }
  };

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments]);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);
  const userInitial = user.name ? user.name[0] : '?';

  return (
    <Card className="p-0 rounded-xl sm:rounded-[2.5rem] border-border/40 shadow-sm hover:shadow-2xl transition-all duration-500 relative bg-card/40 backdrop-blur-xl group overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-5 flex items-center justify-between border-b border-border/30 bg-muted/10">
        <div className="flex items-center gap-3">
          <Link href={`/u/${user.handle}`}>
            <Avatar className="w-11 h-11 border-2 border-background ring-2 ring-primary/5 hover:ring-primary/20 transition-all cursor-pointer shadow-sm">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <Link href={`/u/${user.handle}`} className="text-[15px] font-black hover:text-primary transition-colors leading-none mb-1">
              {user.name}
            </Link>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-bold">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <span>{formattedTime}</span>
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
                  "h-9 px-5 rounded-2xl text-[11px] font-black transition-all gap-2 border border-transparent shadow-sm",
                  isFollowing 
                    ? "bg-muted text-muted-foreground hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20" 
                    : "bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:shadow-primary/40 active:scale-95"
                )}
              >
               {isFollowing ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
               <span>{isFollowing ? "إلغاء المتابعة" : "متابعة"}</span>
             </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-2xl text-muted-foreground outline-none hover:bg-primary/10 hover:text-primary transition-all duration-300 border-none flex items-center justify-center cursor-pointer">
              <MoreHorizontal className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-2 rounded-2xl border-border/50 bg-card/95 backdrop-blur-lg shadow-2xl font-tajawal animate-in zoom-in-95">
              {isOwner ? (
                <>
                  <DropdownMenuItem 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors focus:bg-primary/5"
                    >
                      <Edit2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold">تعديل المنشور</span>
                    </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-500/5 text-red-500">
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-bold">حذف</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleShare} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/5">
                  <Share2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">مشاركة القصّة</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {isEditing ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">عنوان القصة</label>
              <Input 
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="h-12 rounded-xl bg-muted/40 border-border focus:bg-muted/60 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">القصة (التفاصيل)</label>
              <textarea 
                value={editData.story}
                onChange={(e) => setEditData({ ...editData, story: e.target.value })}
                className="w-full min-h-[150px] p-4 rounded-xl bg-muted/40 border border-border focus:bg-muted/60 transition-all font-medium text-sm outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">الحكمة المستخلصة</label>
              <Input 
                value={editData.lesson}
                onChange={(e) => setEditData({ ...editData, lesson: e.target.value })}
                className="h-12 rounded-xl bg-muted/40 border-border focus:bg-muted/60 transition-all font-bold text-primary"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSaveEdit} 
                className="flex-1 rounded-xl font-black h-11"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ التعديلات"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)} 
                className="flex-1 rounded-xl font-black h-11 border-border"
                disabled={isSaving}
              >
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <Link href={`/post/${id}`}>
              <h3 className="font-black text-2xl leading-tight text-foreground hover:text-primary transition-colors cursor-pointer break-words overflow-hidden decoration-primary/30 underline-offset-8 group-hover:underline">
                {title}
              </h3>
            </Link>
            <div>
              <p className="text-[16px] text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium break-words">
                {displayStory}
              </p>
              {isLongStory && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-primary text-xs font-black mt-3 hover:underline flex items-center gap-1"
                >
                  <span>{isExpanded ? "عرض أقل" : "إقرأ المزيد"}</span>
                  <Plus className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-45")} />
                </button>
              )}
            </div>
            
            {imageUrl && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/5 mt-4 group/image">
                 <img 
                   src={imageUrl} 
                   alt={title} 
                   loading="lazy"
                   className="w-full h-full object-cover transition-transform duration-1000 group-hover/image:scale-110" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            )}

            <div className="p-4 sm:p-7 rounded-xl sm:rounded-[2.5rem] bg-primary/5 border border-primary/10 relative group/lesson overflow-hidden shadow-inner backdrop-blur-sm mt-4">
               {/* Decorative element */}
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover/lesson:bg-primary/10 transition-colors" />
               
               <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-4 relative z-10">
                 <Lightbulb className="w-4 h-4 fill-primary/20" />
                 <span>الحكمة المستخلصة</span>
               </div>
               <p className="text-[17px] leading-[1.8] text-foreground font-black italic relative z-10 border-r-4 border-primary/40 pr-5">
                 "{lesson}"
               </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-border/20">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleHelpful}
              className={cn(
                "rounded-2xl gap-2.5 h-11 px-6 transition-all duration-500 border border-transparent",
                reacted ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/10"
              )}
            >
               <Lightbulb className={cn("w-4 h-4 transition-transform duration-500", reacted && "fill-white scale-110")} />
               <span className="text-sm font-black">{count}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className={cn(
                "text-muted-foreground hover:bg-primary/5 hover:text-primary gap-2.5 h-11 px-6 rounded-2xl transition-all duration-300 border border-transparent",
                showComments && "bg-primary/20 text-primary border-primary/20"
              )}
            >
               <MessageCircle className="w-4 h-4" />
               <span className="text-sm font-black">{commentsCount}</span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSave} 
              className={cn(
                "h-11 w-11 rounded-2xl transition-all duration-300 border border-transparent",
                saved ? "text-primary bg-primary/5 border-primary/10" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
               <Bookmark className={cn("w-4.5 h-4.5", saved && "fill-primary")} />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare} 
              className="text-muted-foreground hover:bg-primary/5 hover:text-primary h-11 w-11 rounded-2xl transition-all duration-300 border border-transparent"
            >
               <Share2 className="w-4.5 h-4.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Persistent Comment Input - Always Visible */}
      <div className="px-6 py-4 border-t border-border/10 bg-muted/5">
        <form onSubmit={handleAddComment} className="flex gap-3 items-center">
          <Avatar className="w-8 h-8 shrink-0 border border-border/50">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="text-[10px]">{session?.user?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 relative group">
            <Input 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب تعليقك هنا..."
              className="rounded-2xl h-10 bg-background border-border/40 text-sm focus:ring-primary/20 pr-10 transition-all hover:border-primary/30"
            />
            <Button 
              type="submit" 
              disabled={loadingComments || !newComment.trim()} 
              size="icon" 
              className="absolute left-1 top-1 h-8 w-8 rounded-xl bg-primary hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Comments View Section */}
      {showComments && (
        <div className="bg-muted/10 px-6 py-8 border-t border-border/20 space-y-8 animate-in slide-in-from-top-4 duration-500">
           {/* Threaded Comments List */}
           <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pl-2 ml-1" dir="rtl">
              {loadingComments ? (
                 <div className="flex flex-col items-center gap-3 py-10 opacity-50">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-xs font-bold">جاري تحميل النقاشات...</span>
                 </div>
              ) : topLevelComments.length > 0 ? (
                topLevelComments.map((c) => (
                  <div key={c.id} className="relative">
                    {/* Parent Comment */}
                    <div className="flex gap-4 items-start relative z-10">
                      <Avatar className="w-10 h-10 shrink-0 border-2 border-background shadow-sm">
                        <AvatarImage src={c.avatar_url} />
                        <AvatarFallback className="text-xs font-black">{c.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1">
                        <div className="bg-card border border-border/40 p-4 rounded-[1.5rem] rounded-tr-none shadow-sm relative group/c">
                          <span className="text-xs font-black text-primary mb-1 block">@{c.username}</span>
                          <p className="text-[14px] leading-relaxed text-foreground/90 font-medium">{c.content}</p>
                          
                          <div className="mt-3 flex items-center gap-4 opacity-0 group-hover/c:opacity-100 transition-opacity">
                             <button 
                               onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                               className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                             >
                               رد على التعليق
                             </button>
                             <span className="text-[10px] text-muted-foreground/40 font-bold">{new Date(c.created_at).toLocaleDateString('ar-EG')}</span>
                          </div>
                        </div>

                        {/* Reply Form (if replying to this parent) */}
                        {replyingTo === c.id && (
                           <form onSubmit={(e) => handleAddComment(e, c.id)} className="mt-3 flex gap-2 animate-in slide-in-from-right-2 duration-300">
                              <Input 
                                autoFocus
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={`رد على @${c.username}...`}
                                className="rounded-xl h-9 bg-background border-primary/20 text-xs focus:ring-primary/10 shadow-inner"
                              />
                              <Button type="submit" disabled={loadingComments || !newComment.trim()} size="icon" className="h-9 w-9 shrink-0 rounded-xl bg-primary shadow-lg shadow-primary/20">
                                 <Send className="w-4 h-4" />
                              </Button>
                           </form>
                        )}

                        {/* Visual Connector for Replies */}
                        {getReplies(c.id).length > 0 && (
                          <div className="mr-5 mt-4 space-y-4 border-r-2 border-primary/10 pr-6 relative">
                             {getReplies(c.id).map(reply => (
                               <div key={reply.id} className="flex gap-3 items-start relative group/r">
                                 {/* Horizontal line curve */}
                                 <div className="absolute right-[-24px] top-5 w-6 h-2 border-t-2 border-r-2 rounded-tr-xl border-primary/10" />
                                 
                                 <Avatar className="w-8 h-8 shrink-0 border border-background shadow-xs">
                                   <AvatarImage src={reply.avatar_url} />
                                   <AvatarFallback className="text-[10px] uppercase font-black">{reply.name?.[0]}</AvatarFallback>
                                 </Avatar>
                                 <div className="bg-background/80 border border-border/30 p-3.5 rounded-2xl rounded-tr-none flex-1 shadow-xs group-hover/r:bg-background transition-colors">
                                   <span className="text-[11px] font-black text-primary/80 mb-0.5 block">@{reply.username}</span>
                                   <p className="text-sm font-medium leading-relaxed">{reply.content}</p>
                                 </div>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-30 flex flex-col items-center gap-3">
                   <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <MessageCircle className="w-8 h-8" />
                   </div>
                   <p className="text-sm font-black">كن أول من يفتتح النقاش هنا!</p>
                </div>
              )}
           </div>

           {/* Main Comment Form */}
           {!replyingTo && (
             <form onSubmit={(e) => handleAddComment(e)} className="flex gap-4 items-center bg-background p-2 rounded-3xl border border-border/50 shadow-lg group focus-within:border-primary/30 transition-all">
                <Avatar className="w-9 h-9 border-2 border-muted hidden sm:flex">
                   <AvatarImage src={session?.user?.image || undefined} />
                   <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">{session?.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <Input 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="أضف تعليقاً يثري الحكاية..."
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 text-[15px] font-medium h-12"
                />
                <Button 
                   type="submit" 
                   disabled={loadingComments || !newComment.trim()} 
                   className="h-11 px-6 rounded-2xl bg-primary hover:bg-primary-dark font-black gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95"
                >
                   {loadingComments ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>نشر التعليق</span>}
                   {!loadingComments && <Send className="w-4 h-4" />}
                </Button>
             </form>
           )}
         </div>
      )}
    </Card>
  );
}
