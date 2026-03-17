"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileBannerSelectorProps {
  currentBanner: string | null;
  onSelect: (presetId: string) => void;
}

const PRESETS = [
  'preset-1', 'preset-2', 'preset-3', 'preset-4', 'preset-5',
  'preset-6', 'preset-7', 'preset-8', 'preset-9', 'preset-10'
];

const BANNER_STYLES = {
  'banner-1': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
  'banner-2': 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
  'banner-3': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'banner-4': 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
  'banner-5': 'linear-gradient(135deg, #000000 0%, #1e293b 100%)',
  'banner-6': 'radial-gradient(#ffffff 0.5px, transparent 0.5px) #000',
  'banner-7': 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px) #111827',
  'banner-8': 'radial-gradient(circle at center, #7c3aed 0%, #000 100%)',
  'banner-9': 'linear-gradient(45deg, #ff00cc, #3333ff)',
  'banner-10': 'repeating-linear-gradient(45deg, #222 0, #222 1px, transparent 0, transparent 50%) #1a1a1a',
};

export function ProfileBannerSelector({ currentBanner, onSelect }: ProfileBannerSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {PRESETS.map((preset) => {
        const styleId = preset.replace('preset-', 'banner-') as keyof typeof BANNER_STYLES;
        return (
          <button
            key={preset}
            type="button"
            onClick={() => onSelect(preset)}
            className={cn(
              "aspect-square rounded-xl border-2 transition-all relative overflow-hidden group",
              currentBanner === preset ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
            )}
          >
            <div 
              className="w-full h-full" 
              style={{ 
                background: BANNER_STYLES[styleId],
                backgroundSize: styleId === 'banner-6' ? '20px 20px' : styleId === 'banner-7' ? '30px 30px' : styleId === 'banner-10' ? '10px 10px' : 'cover'
              }} 
            />
            {currentBanner === preset && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                <Check className="w-5 h-5 text-primary" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
