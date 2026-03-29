"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogOut } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const router = useRouter();

  // Set portal target on mount
  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  // Handle open/close animation + lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      document.body.style.overflow = '';
      setIsAnimating(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    }
  };

  const handleOverlayClick = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  if (!isOpen || !portalTarget) return null;

  // Render via Portal directly in <body> to escape any stacking context
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      className={`transition-all duration-300 ${
        isAnimating ? "bg-black/60 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-background rounded-2xl border border-border shadow-2xl max-w-sm w-full transition-all duration-300 ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6" dir="rtl">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">تسجيل الخروج</h2>
              <p className="text-sm text-muted-foreground mt-1">هل أنت متأكد من تسجيل الخروج؟</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleLogout}
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    portalTarget
  );
}
