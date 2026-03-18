"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  X, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Crop, 
  Save,
  Loader2
} from "lucide-react";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImageUrl: string) => void;
}

export function ImageUploadModal({ isOpen, onClose, onSave }: ImageUploadModalProps) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
    img.src = "/api/placeholder/user"; // Default placeholder
  }, [isOpen]);

  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();
    
    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply transformations
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    // Draw image centered
    ctx.drawImage(
      img,
      -img.width / 2 + position.x,
      -img.height / 2 + position.y,
      img.width,
      img.height
    );
    
    // Restore context state
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            setUploadedImage(result);
            
            const img = new Image();
            img.onload = () => {
              imageRef.current = img;
              drawCanvas();
            };
            img.onerror = () => {
              console.error('Error loading image');
            };
            img.src = result;
          }
        } catch (error) {
          console.error('Error reading file:', error);
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setRotation(0);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;
    
    setLoading(true);
    
    try {
      // Create a new canvas with proper dimensions
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx || !canvasRef.current) return;
      
      // Set canvas size
      tempCanvas.width = 400;
      tempCanvas.height = 300;
      
      // Draw current canvas content to temp canvas
      tempCtx.drawImage(canvasRef.current, 0, 0);
      
      // Convert to data URL directly (more reliable than blob for CSP)
      const dataUrl = tempCanvas.toDataURL('image/png', 0.9);
      onSave(dataUrl);
      onClose();
      
    } catch (error) {
      console.error('Error in handleSave:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            تحرير الصورة
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Editor Area */}
        <div className="flex flex-col lg:flex-row">
          {/* Canvas Container */}
          <div 
            ref={containerRef}
            className="flex-1 bg-muted/30 p-4 overflow-hidden relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="border border-border rounded-lg bg-white shadow-lg mx-auto"
            />
          </div>

          {/* Controls */}
          <div className="w-full lg:w-80 p-4 border-r border-border space-y-4">
            {/* Upload Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">رفع صورة</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2"
                variant="outline"
              >
                <Upload className="w-4 h-4" />
                اختر صورة
              </Button>
            </div>

            {/* Rotation Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">التدوير</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotateLeft}
                  className="flex-1"
                >
                  <RotateCw className="w-4 h-4 ml-1" />
                  يسار
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotateRight}
                  className="flex-1"
                >
                  يمين
                  <RotateCw className="w-4 h-4 mr-1" />
                </Button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">التكبير والتصغير</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="flex-1"
                >
                  <ZoomOut className="w-4 h-4 ml-1" />
                  تصغير
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="flex-1"
                >
                  تكبير
                  <ZoomIn className="w-4 h-4 mr-1" />
                </Button>
              </div>
            </div>

            {/* Position Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">الموضع</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• اسحب الصورة لتغيير الموضع</p>
                <p>• استخدم أزرار التدوير والتكبير</p>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full gap-2"
            >
              <RotateCw className="w-4 h-4" />
              إعادة التعيين
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <p>• اسحب الصورة للتحريك</p>
            <p>• استخدم عجلة التمرير للتكبير</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ الصورة
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
