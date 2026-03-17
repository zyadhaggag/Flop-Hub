"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Bell, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { CreatePostModal } from "./create-post-modal";

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "الرئيسية", href: "/" },
    { icon: Search, label: "البحث", href: "/search" },
    { icon: PlusCircle, label: "نشر", isAction: true },
    { icon: Bell, label: "تنبيهات", href: "/notifications" },
    { icon: User, label: "حسابي", href: session?.user?.username ? `/u/${session.user.username}` : "/login" },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-between pb-safe">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={i}
                  onClick={() => setIsModalOpen(true)}
                  className="relative group h-14 w-14 flex items-center justify-center -translate-y-4"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all scale-150" />
                  <div className="relative h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_8px_20px_rgba(124,58,237,0.4)] group-hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-background">
                    <PlusCircle className="w-8 h-8 fill-white/10" />
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={i}
                href={item.href || "#"}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300 group flex-1",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                    "p-2 rounded-xl transition-all duration-300 flex flex-col items-center gap-0.5",
                    isActive && "bg-primary/5"
                )}>
                    <Icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
                    <span className="text-[10px] font-bold">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      <CreatePostModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
