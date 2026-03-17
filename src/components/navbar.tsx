"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const NavbarActions = dynamic(() => import("./navbar-actions"), { 
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-muted animate-pulse mr-4" />
});

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-colors" />
            <div className="relative w-full h-full bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10 overflow-hidden">
               {/* Animated accent */}
               <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/20 rotate-45 transform group-hover:translate-x-full duration-1000 transition-transform" />
               <span className="text-white text-2xl font-black italic tracking-tighter">F</span>
            </div>
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent hidden sm:block font-tajawal tracking-tight">
            FlopHub
          </span>
        </Link>

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
            <Input
              name="search"
              id="navbar-search"
              placeholder="ابحث عن قصص، دروس، أو مستخدمين..."
              className="h-11 bg-muted/50 border-none rounded-xl pl-10 focus-visible:ring-primary/20 transition-all font-tajawal group-hover:bg-muted/80 transition-colors"
            />
          </form>
        </div>

        {/* Actions */}
        <NavbarActions />
      </div>
    </nav>
  );
}
