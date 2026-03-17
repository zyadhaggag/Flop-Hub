"use client";

import { Input } from "@/components/ui/input";
import { Search, Menu, X, Sun, Moon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sidebar, menuItems } from "./sidebar";
import { cn } from "@/lib/utils";

const NavbarActions = dynamic(() => import("./navbar-actions"), { 
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-muted animate-pulse mr-4" />
});

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <img src="/logo.svg" alt="FlopHub" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-black text-foreground hidden sm:block font-tajawal tracking-tight">
              FlopHub
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl relative hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
            if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query)}`;
          }}>
            {mounted ? (
              <Input
                name="search"
                placeholder="ابحث عن قصص، دروس، أو مستخدمين..."
                className="h-10 bg-muted/50 border-none rounded-xl pl-10 focus-visible:ring-primary/20 font-tajawal text-sm"
              />
            ) : (
              <div className="h-10 bg-muted/50 rounded-xl w-full animate-pulse" />
            )}
          </form>
        </div>

        {/* Actions */}
        <NavbarActions />
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-background animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-black">FlopHub</span>
            </Link>
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="p-8 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground text-center font-medium opacity-60 uppercase tracking-widest">
              FlopHub © 2024
              <br />
              الفشل هو بداية النجاح
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
