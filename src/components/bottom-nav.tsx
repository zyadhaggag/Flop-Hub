"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Settings, User } from "lucide-react";
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
    { icon: Search, label: "البحث", href: "/search" },
    { icon: PlusCircle, label: "نشر", isAction: true },
    { icon: Settings, label: "الإعدادات", href: "/settings" },
    { icon: User, label: "ملفي", href: `/u/${userHandle}` },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-2xl border border-border/40 rounded-[2rem] shadow-2xl shadow-black/20 p-1.5 w-[90%] max-w-[400px]">
        <div className="flex items-center justify-between">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={i}
                  onClick={() => setIsModalOpen(true)}
                  className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/40 active:scale-90 transition-all -mt-8 border-4 border-background"
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
                  "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all grow",
                  isActive ? "text-primary bg-primary/5" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "fill-primary/10")} />
                <span className="text-[9px] font-black mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <CreatePostModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
