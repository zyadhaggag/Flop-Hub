"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

interface AvatarEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string | null;
  onSave: (croppedImage: string) => void;
}

export function AvatarEditorModal({ isOpen, onClose, image, onSave }: AvatarEditorModalProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!imgRef.current) return;
    setIsSaving(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = 400; // Final avatar size
      canvas.width = size;
      canvas.height = size;

      const img = imgRef.current;
      const container = containerRef.current;
      if (!container) return;

      // Draw the current view onto the canvas
      // We need to account for the zoom and translates
      ctx.fillStyle = "white"; // Fallback background
      ctx.fillRect(0, 0, size, size);

      // Center of the canvas
      ctx.translate(size / 2, size / 2);
      // Apply zoom from the modal
      ctx.scale(zoom, zoom);
      // Apply position (normalized to scale)
      ctx.translate(position.x, position.y);
      // Draw centered image
      ctx.drawImage(img, -size / 2, -size / 2, size, size);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      onSave(dataUrl);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden rounded-[2rem]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black font-tajawal text-center">تعديل الصورة الشخصية</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div 
            ref={containerRef}
            className="relative aspect-square w-full max-w-[300px] mx-auto overflow-hidden rounded-full border-4 border-primary/20 bg-muted"
          >
            <img
              ref={imgRef}
              src={image}
              alt="Preview"
              className="absolute cursor-move transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span>تكبير</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([val]: number[]) => setZoom(val)}
              className="py-4"
            />
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/50 border-t border-border flex gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">إلغاء</Button>
          <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-black flex-1 shadow-lg shadow-primary/20">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ الصورة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
