"use client";

import { useState } from "react";
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
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">تسجيل الخروج</h2>
              <p className="text-sm text-muted-foreground">هل أنت متأكد من تسجيل الخروج؟</p>
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
              className="flex-1 h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
