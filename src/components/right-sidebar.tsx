"use client";

import { TrendingUp, UserPlus, Check, Crown, Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { toggleFollow } from "@/lib/actions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

export function RightSidebar({
  suggestedUsers = [],
  trendingLessons = [],
  className,
}: {
  suggestedUsers?: any[];
  trendingLessons?: any[];
  className?: string;
}) {
  // Show max 6, static – no refresh
  const staticUsers = suggestedUsers.slice(0, 6);

  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const followed = suggestedUsers
      .filter(u => u.is_followed)
      .map(u => u.id);
    setFollowedIds(new Set(followed));
  }, [suggestedUsers]);

  const handleFollow = async (userId: string) => {
    if (followedIds.has(userId)) return;
    setLoadingId(userId);
    // Optimistic
    setFollowedIds((prev) => new Set([...prev, userId]));

    const res = await toggleFollow(userId);
    setLoadingId(null);

    if (res.success) {
      toast.success("تمت المتابعة ✓");
      // Trigger global event for other components (like PostCard)
      window.dispatchEvent(new CustomEvent('user-follow-updated', { detail: { userId, followed: true } }));
    } else {
      setFollowedIds((prev) => {
        const s = new Set(prev);
        s.delete(userId);
        return s;
      });
      toast.error(res.error || "خطأ في المتابعة");
    }
  };

  return (
    <div
      className={cn(
        "w-80 flex flex-col gap-6 p-4 hidden lg:flex sticky top-20 h-fit",
        className
      )}
    >
      {/* Suggested Users */}
      {staticUsers.length > 0 && (
        <div className="bg-card rounded-[2.5rem] border border-border/50 p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-6 text-muted-foreground font-black text-xs uppercase tracking-widest relative z-10">
            <Users className="w-4 h-4 text-primary" />
            <span>رواد النجاح</span>
          </div>

          <div className="space-y-3 relative z-10">
            {staticUsers.map((user: any) => {
              const isFollowed = followedIds.has(user.id);
              return (
                <div key={user.id} className="group relative">
                  {/* Admin Shine Effect */}
                  {user.is_admin && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-2xl blur-[2px] opacity-10 group-hover:opacity-30 transition-opacity" />
                  )}
                  
                  <div className={cn(
                    "relative flex items-center justify-between p-3 rounded-2xl transition-all border border-transparent",
                    user.is_admin 
                      ? "bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/20 hover:border-amber-500/40 shadow-sm" 
                      : "hover:bg-muted/40"
                  )}>
                    <Link href={`/u/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative">
                        <Avatar className={cn(
                          "w-10 h-10 border-2 transition-transform group-hover:scale-105",
                          user.is_admin ? "border-amber-500/50 shadow-md shadow-amber-500/20" : "border-background"
                        )}>
                          <AvatarImage src={user.avatar_url || "/api/placeholder/user"} />
                          <AvatarFallback className={cn("font-black text-xs", user.is_admin ? "bg-amber-500/10 text-amber-600" : "bg-primary/5 text-primary")}>
                            {user.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        {user.is_admin && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full shadow-lg border border-background">
                            <Crown className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className={cn("text-xs font-black truncate", user.is_admin ? "text-amber-600 dark:text-amber-500" : "text-foreground")}>
                            {user.name}
                          </p>
                          {user.is_admin && (
                            <span className="text-[7px] font-black bg-amber-500 text-white px-1 py-0.5 rounded-[3px] uppercase tracking-tighter shadow-sm">ADMIN</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate font-medium">@{user.username}</p>
                      </div>
                    </Link>
                    
                    {isFollowed ? (
                      <div className="flex items-center gap-1 text-[10px] font-black text-primary/70 bg-primary/5 border border-primary/10 rounded-xl px-3 h-8 shrink-0 whitespace-nowrap cursor-default shadow-sm">
                        <Check className="w-3 h-3" />
                        <span>متابع</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleFollow(user.id)}
                        disabled={loadingId === user.id}
                        className="rounded-xl gap-1.5 font-black h-8 px-3 text-[11px] shrink-0 bg-primary text-white shadow-md shadow-primary/20 hover:shadow-primary/40 active:scale-95 disabled:opacity-60 transition-all"
                      >
                        {loadingId === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>تابع</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Lessons */}
      <div className="bg-card rounded-3xl border border-border/50 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-muted-foreground font-bold text-sm">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>الدروس الرائجة</span>
        </div>
        <div className="space-y-3">
          {trendingLessons.map((lesson: any, i: number) => (
            <Link
              key={lesson.id}
              href={`/post/${lesson.id}`}
              className="flex items-center gap-3 group hover:bg-primary/5 p-2 -m-2 rounded-xl transition-all"
            >
              <span className="text-xl font-black text-primary/15 group-hover:text-primary/30 transition-colors w-5 italic shrink-0">
                {i + 1}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
                  {lesson.title}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {lesson.helpful_count || 0} استفادوا
                </span>
              </div>
            </Link>
          ))}
          {trendingLessons.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              قريباً...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
