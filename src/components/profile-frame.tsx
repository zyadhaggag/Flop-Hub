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

export function ProfileFrame({ tier, size = 'md', children, className, showBadge = true }: ProfileFrameProps) {
  const config = getFrameConfig(tier);
  const sizeConfig = SIZE_MAP[size];

  if (tier === 'none' || !tier) {
    return (
      <div className={cn("relative", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("relative group/frame inline-block shrink-0", className)}>
      {/* Frame ring */}
      <div className={cn(
        "rounded-full p-[2px] overflow-hidden",
        sizeConfig.border,
        config.borderClass,
        config.glowClass,
        "transition-all duration-300 group-hover/frame:scale-105"
      )}>
        {children}
      </div>

      {/* Badge */}
      {showBadge && config.badgeEmoji && (
        <div className={cn(
          "absolute flex items-center justify-center rounded-full bg-background shadow-md z-10",
          sizeConfig.badge
        )}>
          <span>{config.badgeEmoji}</span>
        </div>
      )}
    </div>
  );
}
