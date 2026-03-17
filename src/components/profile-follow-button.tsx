"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { useState, useEffect } from "react";
import { toggleFollow } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileFollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
}

export function ProfileFollowButton({ userId, initialIsFollowing }: ProfileFollowButtonProps) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  useEffect(() => {
    const handleFollowUpdate = (e: any) => {
      if (e.detail.userId === userId) {
        setIsFollowing(e.detail.isFollowing);
      }
    };
    window.addEventListener('user-follow-updated', handleFollowUpdate);
    return () => window.removeEventListener('user-follow-updated', handleFollowUpdate);
  }, [userId]);

  const handleFollow = async () => {
    if (!session) return toast.error("يجب تسجيل الدخول للمتابعة");
    if (session.user.id === userId) return;

    // Optimistic Update
    const prevFollowing = isFollowing;
    setIsFollowing(!prevFollowing);

    const res = await toggleFollow(userId);
    if (res.success) {
      window.dispatchEvent(new CustomEvent('user-follow-updated', { 
        detail: { userId, isFollowing: res.followed } 
      }));
      toast.success(res.followed ? "تمت المتابعة" : "تم إلغاء المتابعة");
    } else {
      setIsFollowing(prevFollowing);
      toast.error(res.error || "حدث خطأ");
    }
  };

  return (
    <Button 
      onClick={handleFollow}
      className={cn(
        "rounded-2xl gap-2 font-black h-11 px-8 transition-all shadow-lg active:scale-95",
        isFollowing 
          ? "bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-500 border border-border" 
          : "bg-primary text-white shadow-primary/20 hover:shadow-primary/40"
      )}
    >
      {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      {isFollowing ? "إلغاء المتابعة" : "متابعة"}
    </Button>
  );
}
