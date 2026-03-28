"use client";

import { cn } from "@/lib/utils";
import { type FrameTier, getFrameConfig } from "@/lib/frames-challenges";

interface ProfileFrameProps {
  tier: FrameTier;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  showBadge?: boolean;
}

const SIZE_MAP = {
  sm: { wrapper: 'w-10 h-10', badge: 'w-4 h-4 text-[8px] -top-0.5 -right-0.5', border: 'border-2' },
  md: { wrapper: 'w-12 h-12', badge: 'w-5 h-5 text-[10px] -top-0.5 -right-0.5', border: 'border-[3px]' },
  lg: { wrapper: 'h-[100px] w-[100px] sm:h-[120px] sm:w-[120px]', badge: 'w-7 h-7 text-sm -top-1 -right-1', border: 'border-4' },
};

export function ProfileFrame({ children, className }: ProfileFrameProps) {
  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      {children}
    </div>
  );
}
