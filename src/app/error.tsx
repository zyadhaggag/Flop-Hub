"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            
            <h1 className="text-4xl font-black tracking-tight font-tajawal">عذراً، حدث خطأ غير متوقع!</h1>
            
            <p className="text-muted-foreground font-bold text-lg leading-relaxed">
                لا تحزن، فالفشل (التقني) هو جزء من رحلة النجاح.. دعنا نحاول إصلاح ذلك!
            </p>
            
            <div className="pt-4">
                <Button 
                    onClick={() => reset()}
                    size="lg" 
                    className="rounded-2xl gap-2 font-black h-14 px-8 bg-black hover:bg-slate-800 text-white shadow-2xl dark:bg-white dark:text-black dark:hover:bg-slate-200"
                >
                    <RefreshCcw className="w-5 h-5" />
                    <span>حاول مرة أخرى</span>
                </Button>
            </div>

            <div className="pt-8 text-[10px] text-muted-foreground font-mono opacity-50">
                Digest: {error.digest || "No ID available"}
            </div>
        </div>
      </main>
    </div>
  );
}
