"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Bell, Heart, LogOut, User as UserIcon, Settings, UserPlus, Lightbulb as BulbIcon, Sun, Moon, Shield } from "lucide-react";
import { getNotifications, markAllNotificationsRead, markNotificationRead, checkIsAdmin } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ProfileFrame } from "@/components/profile-frame";
import { getUserChallengeData } from "@/lib/challenge-actions";
import { getUserAppearance } from "@/lib/frames-challenges";

const LogoutModal = dynamic(() => import("@/components/logout-modal").then(mod => mod.LogoutModal), {
  ssr: false,
  loading: () => null,
});

export default function NavbarActions() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [appearance, setAppearance] = useState<any>({ frame: 'none', nameColorClass: '', badges: [] });

  const fetchNotifications = async () => {
    if (session) {
      const data = await getNotifications();
      setNotifications(data);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    if (session) {
      checkIsAdmin().then(setIsAdminUser);
      getUserChallengeData().then(data => {
        const app = getUserAppearance(data.challengeStates);
        setAppearance(app);
      });
    }
  }, [session]);

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllNotificationsRead();
      if (res.success) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const handleSignOut = () => {
    setShowLogoutModal(true);
  };

  // Client-side route protection
  useEffect(() => {
    const protectedRoutes = ['/admin', '/settings', '/account-settings'];
    const currentPath = window.location.pathname;
    
    if (!session && protectedRoutes.some(route => currentPath.includes(route))) {
      router.push('/login');
    }
  }, [session, router]);

  if (!mounted) return <div className="flex items-center gap-2 pr-4"><div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" /></div>;

  const userName = session?.user?.name || "مستخدم";
  const userInitial = userName[0] || "?";
  const avatarUrl = session?.user?.image;
  const username = session?.user?.username || userName;

  return (
    <div className="flex items-center gap-3 md:gap-4 pr-4">
      {/* Theme Toggle */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="rounded-full w-9 h-9 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">تبديل السمة</span>
      </Button>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center focus:outline-none">
          <Bell className="h-5 w-5" />
          {notifications.some(n => !n.read) && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px] font-tajawal p-2 rounded-2xl border-border shadow-2xl bg-popover text-popover-foreground max-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between p-3">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-black">الإشعارات</div>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-7 text-[10px] px-2 font-bold text-primary hover:bg-primary/5">
                تحديد الكل كمقروء
              </Button>
            )}
          </div>
          <DropdownMenuSeparator className="bg-border" />
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
              const href = n.type === 'helpful' || n.type === 'comment' || n.type === 'reply' 
                ? `/post/${data.postId}` 
                : `/u/${data.fromUser}`;

              return (
                <Link key={n.id} href={href} onClick={() => markNotificationRead(n.id)}>
                  <DropdownMenuItem className={cn(
                    "p-3 rounded-xl gap-3 cursor-pointer border-b border-border/20 last:border-0 transition-colors focus:bg-primary/5",
                    n.read ? "opacity-50" : "hover:bg-primary/5"
                  )}>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {n.type === 'helpful' ? <BulbIcon className="w-4 h-4 text-primary fill-primary/20" /> : 
                       n.type === 'follow' ? <UserPlus className="w-4 h-4 text-primary" /> :
                       <Heart className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-bold leading-tight">
                        {n.type === 'helpful' ? `${data.fromUser} رأى درسك مفيداً` : 
                         n.type === 'follow' ? `${data.fromUser} بدأ بمتابعتك` : 
                         `${data.fromUser} علق على قصة شاركتها`}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground text-xs font-bold">لا يوجد إشعارات حالياً</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger className="relative outline-none focus:outline-none cursor-pointer group">
          <ProfileFrame tier={isAdminUser ? 'admin' : appearance.frame} size="sm" showBadge={false}>
            <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors bg-muted flex items-center justify-center font-tajawal shadow-sm">
              {avatarUrl ? (
                <NextImage 
                  src={avatarUrl} 
                  alt={userName} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform" 
                  sizes="40px"
                />
              ) : (
                <span className="text-sm font-black">{userInitial}</span>
              )}
            </div>
          </ProfileFrame>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 font-tajawal p-2 rounded-2xl border-border shadow-xl bg-popover text-popover-foreground">
          <div className="p-3">
             <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm tracking-tight">{userName}</span>
                <span className="text-[10px] text-muted-foreground truncate">@{username}</span>
             </div>
          </div>
          <DropdownMenuSeparator className="my-1 bg-border" />
          <DropdownMenuGroup className="p-1">
            <DropdownMenuItem 
              onClick={() => router.push(`/u/${username}`)}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors focus:bg-primary/10"
            >
              <UserIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold">الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push('/settings')}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors focus:bg-primary/10"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold">الإعدادات</span>
            </DropdownMenuItem>
            {isAdminUser && (
              <DropdownMenuItem 
                onClick={() => router.push('/admin')}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors focus:bg-primary/10"
              >
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">لوحة التحكم</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-500/10 text-red-500 transition-colors focus:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-bold">تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </div>
  );
}
