"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Lock } from "lucide-react";
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

    // If already following, don't allow unfollow
    if (isFollowing) {
      toast.error("متابعة دائمة - لا يمكن إلغاء المتابعة");
      return;
    }

    setIsLoading(true);
    const res = await toggleFollow(userId);
    if (res.success) {
      setIsFollowing(res.followed || false);
      window.dispatchEvent(new CustomEvent('user-follow-updated', { 
        detail: { userId, isFollowing: res.followed } 
      }));
      toast.success(res.permanent ? "تمت المتابعة بشكل دائم" : "تمت المتابعة");
    } else {
      toast.error(res.error || "حدث خطأ");
    }
    setIsLoading(false);
  };

  return (
    <Button 
      onClick={handleFollow}
      suppressHydrationWarning
      disabled={isLoading || isFollowing}
      className={cn(
        "rounded-2xl gap-2 font-black h-11 px-8 transition-all shadow-lg active:scale-95",
        isFollowing 
          ? "bg-gradient-to-r from-secondary to-primary text-white border border-white/20 cursor-not-allowed opacity-90" 
          : "bg-primary text-white shadow-primary/20 hover:shadow-primary/40 hover:scale-105"
      )}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          <span>تم المتابعة</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>متابعة</span>
        </>
      )}
    </Button>
  );
}
