"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, Users, UserPlus } from "lucide-react";
import { toggleFollow } from "@/lib/actions";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function RightSidebar({ suggestedUsers = [], trendingLessons = [], className }: { suggestedUsers?: any[], trendingLessons?: any[], className?: string }) {
  const [users, setUsers] = useState(suggestedUsers);

  const handleFollow = async (userId: string) => {
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_followed: !u.is_followed } : u));
    
    const res = await toggleFollow(userId);
    if (!res.success) {
      toast.error(res.error || "خطأ");
      // Revert on failure
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_followed: !u.is_followed } : u));
    } else {
      toast.success(res.followed ? "تمت المتابعة" : "تم إلغاء المتابعة");
    }
  };

  return (
    <div className="w-80 flex flex-col gap-6 p-4 hidden lg:flex sticky top-20 h-fit">
      {/* Suggested Users */}
      {users.length > 0 && (
        <div className="bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-muted-foreground font-black text-xs uppercase tracking-widest">
            <Users className="w-4 h-4 text-primary" />
            <span>مبدعون</span>
          </div>
          <div className="space-y-6">
            {users.map((user: any) => (
              <div key={user.id} className="flex flex-col gap-3 group">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <Link href={`/u/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity group/user min-w-0 flex-1">
                    <Avatar className="w-11 h-11 border-2 border-border group-hover:border-primary transition-colors ring-2 ring-background shrink-0">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-black truncate group-hover/user:text-primary transition-colors">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground font-bold italic truncate">@{user.username}</span>
                    </div>
                  </Link>
                  <Button 
                    size="sm"
                    onClick={() => handleFollow(user.id)}
                    className={cn(
                      "rounded-xl gap-2 font-black h-9 px-4 transition-all text-xs shrink-0",
                      user.is_followed 
                        ? "bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-500 border border-border" 
                        : "bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95"
                    )}
                  >
                    {user.is_followed ? (
                      <>
                        <Users className="w-3.5 h-3.5" />
                        <span>إلغاء المتابعة</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>متابعة</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Lessons */}
      <div className="bg-card/40 backdrop-blur-sm rounded-3xl border border-border/50 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-muted-foreground font-bold text-sm">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="tracking-tight">الدروس الرائجة</span>
        </div>
        <div className="space-y-5">
          {trendingLessons.map((lesson: any, i: number) => (
            <div key={lesson.id} className="flex items-center gap-4 group cursor-pointer">
              <span className="text-2xl font-black text-primary/10 group-hover:text-primary/30 transition-colors w-6 italic">{i + 1}</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">{lesson.title}</span>
                <span className="text-[11px] text-muted-foreground font-medium">{lesson.helpful_count || 0} استفادوا</span>
              </div>
            </div>
          ))}
          {trendingLessons.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">قريباً...</p>
          )}
        </div>
      </div>
    </div>
  );
}
