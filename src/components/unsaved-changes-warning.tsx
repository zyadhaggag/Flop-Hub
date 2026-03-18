"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnsavedChangesWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesWarning({ open, onOpenChange, onSave, onDiscard }: UnsavedChangesWarningProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-card" dir="rtl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-black tracking-tight text-foreground">
                هل أنت متأكد؟
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                لديك تغييرات غير محفوظة
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-medium text-foreground leading-relaxed">
              قمت بإجراء تغييرات على ملفك الشخصي ولكن لم تقم بحفظها بعد. إذا غادرت هذه الصفحة الآن، ستفقد جميع التغييرات.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-600 font-black">
              <AlertTriangle className="w-4 h-4" />
              <span>هذا الإجراء لا يمكن التراجع عنه</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 bg-muted/5 border-t border-border/50">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={onDiscard}
              className="w-full sm:w-auto rounded-2xl px-6 font-bold border-2 hover:bg-muted h-12"
            >
              تجاهل التغييرات
            </Button>
            <Button 
              onClick={onSave}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white rounded-2xl px-6 font-black h-12 shadow-lg shadow-amber-500/20 transition-all"
            >
              حفظ التغييرات
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
