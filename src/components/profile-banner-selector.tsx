"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileBannerSelectorProps {
  currentBanner: string | null;
  onSelect: (presetId: string) => void;
}

const PRESETS = [
  'preset-1', 'preset-2', 'preset-3', 'preset-4', 'preset-5',
  'preset-6', 'preset-7', 'preset-8', 'preset-9', 'preset-10',
  'preset-11', 'preset-12', 'preset-13', 'preset-14', 'preset-15'
];

const BANNER_STYLES: Record<string, React.CSSProperties> = {
  'banner-1': { backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)' },
  'banner-2': { backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)' },
  'banner-3': { backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  'banner-4': { backgroundImage: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' },
  'banner-5': { backgroundImage: 'linear-gradient(135deg, #000000 0%, #1e293b 100%)' },
  'banner-6': { backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundColor: '#000', backgroundSize: '20px 20px' },
  'banner-7': { backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)', backgroundColor: '#111827', backgroundSize: '30px 30px' },
  'banner-8': { backgroundImage: 'radial-gradient(circle at center, #7c3aed 0%, #000 100%)' },
  'banner-9': { backgroundImage: 'linear-gradient(45deg, #ff00cc, #3333ff)' },
  'banner-10': { backgroundImage: 'repeating-linear-gradient(45deg, #222 0, #222 1px, transparent 0, transparent 50%)', backgroundColor: '#1a1a1a', backgroundSize: '10px 10px' },
  'banner-11': { backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  'banner-12': { backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  'banner-13': { backgroundImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  'banner-14': { backgroundImage: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  'banner-15': { backgroundImage: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
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
              style={BANNER_STYLES[styleId] || {}} 
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
