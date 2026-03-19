"use client";

import { useState } from "react";
import { Check, Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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

// Quick color swatches for custom solid colors
const QUICK_COLORS = [
  "#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316",
];

export function ProfileBannerSelector({ currentBanner, onSelect }: ProfileBannerSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customColor1, setCustomColor1] = useState("#6366f1");
  const [customColor2, setCustomColor2] = useState("#ec4899");

  const applyCustomGradient = () => {
    // Store as a special format: "custom-{color1}-{color2}"
    const customId = `custom-${customColor1.replace('#','')}-${customColor2.replace('#','')}`;
    onSelect(customId);
  };

  return (
    <div className="space-y-4">
      {/* Preset Grid */}
      <div className="grid grid-cols-5 gap-3">
        {PRESETS.map((preset) => {
          const styleId = preset.replace('preset-', 'banner-') as keyof typeof BANNER_STYLES;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onSelect(preset)}
              className={cn(
                "aspect-square rounded-xl border-2 transition-all relative overflow-hidden group hover:scale-105",
                currentBanner === preset ? "border-primary ring-2 ring-primary/20 scale-105" : "border-border hover:border-primary/50"
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

      {/* Custom Color Section */}
      <div className="border-t border-border/50 pt-4">
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors w-full"
        >
          <Palette className="w-4 h-4" />
          <span>أو اختر ألوانك المخصصة</span>
          <Sparkles className="w-3 h-3 text-primary/40" />
        </button>

        {showCustom && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Quick color swatches */}
            <div className="flex gap-2 flex-wrap">
              {QUICK_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCustomColor1(color)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                    customColor1 === color ? "border-primary ring-2 ring-primary/30 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Two-color gradient builder */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground">اللون الأول</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={customColor1}
                    onChange={(e) => setCustomColor1(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input 
                    value={customColor1}
                    onChange={(e) => setCustomColor1(e.target.value)}
                    className="h-10 rounded-lg text-xs font-mono flex-1"
                    placeholder="#HEX"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground">اللون الثاني</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={customColor2}
                    onChange={(e) => setCustomColor2(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input 
                    value={customColor2}
                    onChange={(e) => setCustomColor2(e.target.value)}
                    className="h-10 rounded-lg text-xs font-mono flex-1"
                    placeholder="#HEX"
                  />
                </div>
              </div>
            </div>

            {/* Preview + Apply */}
            <div className="flex items-center gap-3">
              <div 
                className="flex-1 h-12 rounded-xl border border-border overflow-hidden"
                style={{ backgroundImage: `linear-gradient(135deg, ${customColor1}, ${customColor2})` }}
              />
              <button
                type="button"
                onClick={applyCustomGradient}
                className="h-12 px-4 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shrink-0 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                تطبيق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
