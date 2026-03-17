"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

export function CreatePost() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "مستخدم";
  const userInitial = userName[0] || "?";
  const avatarUrl = session?.user?.image;

  return (
    <div className="bg-card rounded-[2.5rem] p-6 border border-border/50 shadow-sm space-y-4 hover:shadow-xl transition-all duration-500 bg-card/40 backdrop-blur-xl group">
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12 border-2 border-background ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className="bg-primary/5 text-primary font-black text-lg">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-muted/30 rounded-2xl px-4 h-14 flex items-center group-hover:bg-muted/50 transition-colors">
          <span className="text-muted-foreground font-tajawal font-medium text-sm">شارك قصة فشلك... ماذا تعلمت اليوم؟</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-border/20 pt-4 px-2">
        <div className="flex items-center gap-6">
          <p className="text-[10px] text-muted-foreground/60 font-tajawal font-bold uppercase tracking-widest">شارك لكي تلهم الآخرين وتتعلم من أخطائك</p>
        </div>
      </div>
    </div>
  );
}
