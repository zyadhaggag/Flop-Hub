"use client";

import { Navbar } from "@/components/navbar";
import { buttonVariants } from "@/components/ui/button";
import { MoveLeft, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
                <h1 className="text-[10rem] font-black opacity-10 leading-none">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black tracking-tight font-tajawal">هذه الصفحة غير موجودة!</span>
                </div>
            </div>
            
            <p className="text-muted-foreground font-bold text-lg leading-relaxed">
                يبدو أنك سلكت طريقاً خاطئاً.. ولكن لا تقلق، في FlopHub نؤمن أن الضياع هو بداية الطريق للاكتشاف!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link 
                    href="/" 
                    className={cn(buttonVariants({ size: "lg" }), "rounded-2xl gap-2 font-black h-14 px-8 shadow-xl shadow-primary/20")}
                >
                    <Home className="w-5 h-5" />
                    <span>العودة للرئيسية</span>
                </Link>
                <button 
                    onClick={() => window.history.back()}
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-2xl gap-2 font-black h-14 px-8 border-border hover:bg-muted/50")}
                >
                    <MoveLeft className="w-5 h-5" />
                    <span>الرجوع للخلف</span>
                </button>
            </div>
        </div>
      </main>
    </div>
  );
}
