"use client";

import { Home, User, Bookmark, Settings, Quote, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export const menuItems = [
  { id: "home", label: "الرئيسية", icon: Home, href: "/" },
  { id: "challenges", label: "التحديات", icon: Trophy, href: "/challenges" },
  { id: "saved", label: "المحفوظات", icon: Bookmark, href: "/saved" },
  { id: "settings", label: "الإعدادات", icon: Settings, href: "/settings" },
];

export function Sidebar({ onPostClick, className }: { onPostClick?: () => void, className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const profileHref = session?.user?.username ? `/u/${session.user.username}` : null;
  
  const allItems = [
    ...menuItems,
    ...(profileHref ? [{ id: "profile", label: "ملفي الشخصي", icon: User, href: profileHref }] : []),
  ];

  const activeItem = allItems.find(item => item.href === pathname) || allItems[0];

  return (
    <div className="w-64 flex flex-col gap-2 p-4 hidden md:flex sticky top-20 h-fit">
      <div className="mb-4 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
        <span className="text-[10px] text-muted-foreground block uppercase tracking-wider">أنت متواجد في</span>
        <span className="text-sm font-bold text-primary">{activeItem.label}</span>
      </div>

      {allItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
              isActive 
                ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
            <span className={cn("text-sm font-black transition-transform duration-300 group-hover:translate-x-1", isActive ? "text-white" : "text-muted-foreground")}>{item.label}</span>
          </Link>
        );
      })}

      <div className="mt-8 p-4 rounded-2xl bg-card border border-border shadow-sm dark:shadow-none space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
        <div className="flex items-center gap-2 text-primary font-bold relative">
          <Quote className="w-4 h-4" />
          <span className="text-sm">فلسفتنا</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed relative italic">
          "النمو يأتي من الفشل، لا فقط من النجاح."
        </p>
      </div>
    </div>
  );
}
