"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, Users, UserPlus, CheckCircle2 } from "lucide-react";
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
      className={
        className ??
        "w-80 flex flex-col gap-6 p-4 hidden lg:flex sticky top-20 h-fit"
      }
    >
      {/* Suggested Users */}
      {staticUsers.length > 0 && (
        <div className="bg-card rounded-[2rem] border border-border/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5 text-muted-foreground font-black text-xs uppercase tracking-widest">
            <Users className="w-4 h-4 text-primary" />
            <span>رواد النجاح</span>
          </div>

          <div className="space-y-4">
            {staticUsers.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 min-w-0"
              >
                <Link
                  href={`/u/${user.username}`}
                  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group min-w-0 flex-1"
                >
                  <Avatar className="w-9 h-9 border-2 border-border group-hover:border-primary transition-colors shrink-0">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">
                      {user.name?.[0] || "؟"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black truncate group-hover:text-primary transition-colors">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold truncate">
                      @{user.username}
                    </span>
                  </div>
                </Link>

                {followedIds.has(user.id) ? (
                  <div className="flex items-center gap-1 text-[10px] font-black text-primary/60 bg-primary/5 border border-primary/15 rounded-xl px-2.5 h-8 shrink-0 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>متابَع</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleFollow(user.id)}
                    disabled={loadingId === user.id}
                    className="rounded-xl gap-1 font-black h-8 px-3 text-xs shrink-0 bg-primary text-white shadow-md shadow-primary/20 hover:shadow-primary/40 active:scale-95 disabled:opacity-60"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>تابع</span>
                  </Button>
                )}
              </div>
            ))}
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
