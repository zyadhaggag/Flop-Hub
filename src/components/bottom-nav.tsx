"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, PlusCircle, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { CreatePostModal } from "./create-post-modal";

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (pathname === "/login" || pathname === "/signup") return null;

  const userHandle = session?.user?.username || session?.user?.name || "profile";

  const navItems = [
    { icon: Home, label: "الرئيسية", href: "/" },
    { icon: Trophy, label: "التحديات", href: "/challenges" },
    { icon: PlusCircle, label: "نشر", isAction: true },
    { icon: Settings, label: "الإعدادات", href: "/settings" },
    { icon: User, label: "ملفي", href: `/u/${userHandle}` },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-t border-border/40 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] pb-safe h-16 transition-all duration-300">
        <div className="max-w-md mx-auto h-full px-4 flex items-center justify-between">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={i}
                  onClick={() => setIsModalOpen(true)}
                  className="relative -top-3 h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 active:scale-90 transition-all border-4 border-background"
                >
                  <PlusCircle className="w-8 h-8" />
                </button>
              );
            }

            return (
              <Link
                key={i}
                href={item.href || "#"}
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-full transition-all gap-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn("relative p-1.5 rounded-xl transition-all", isActive && "bg-primary/10")}>
                  <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                </div>
                <span className={cn("text-[9px] font-black tracking-tight", isActive ? "opacity-100" : "opacity-60")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <CreatePostModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
