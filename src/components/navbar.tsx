"use client";

import { Input } from "@/components/ui/input";
import { 
  Search, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  FileText, 
  Loader2, 
  Plus, 
  Globe, 
  Zap, 
  Gem, 
  Trophy 
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sidebar, menuItems } from "./sidebar";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { searchPosts } from "@/lib/actions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { ProfileFrame } from "./profile-frame";

const NavbarActions = dynamic(() => import("./navbar-actions"), { 
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-muted animate-pulse mr-4" />
});

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ posts: any[], users: any[] }>({ posts: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);



  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const results = await searchPosts(searchQuery);
          setSearchResults(results);
          setShowResults(true);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background backdrop-blur-md transition-colors duration-300">
       <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Hamburger menu removed in favor of BottomNav */}

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="h-10 transition-transform duration-500 hover:scale-105 active:scale-95">
              <Logo size="md" />
            </div>
          </Link>
        </div>

        <div className="flex-1 max-w-xl relative hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground z-10">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </div>
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 1 && setShowResults(true)}
              placeholder="ابحث عن قصص، دروس، أو مستخدمين..."
              className="h-10 bg-muted/50 border-none rounded-xl pl-10 focus-visible:ring-primary/20 font-tajawal text-sm"
              autoComplete="off"
            />
            
            {showResults && (
              <div className="absolute top-12 left-0 right-0 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-4">
                  {searchResults.users.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>الأشخاص</span>
                      </div>
                      {searchResults.users.map((user) => (
                        <Link 
                          key={user.id} 
                          href={`/u/${user.username}`}
                          onClick={() => setShowResults(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 transition-colors group"
                        >
                          <ProfileFrame tier={user.is_admin ? 'admin' : (user.challenge_ids?.includes('thirty-posts') ? 'diamond' : 'none')} size="sm" showBadge={false}>
                            <Avatar className="w-8 h-8 border border-border/50">
                              <AvatarImage src={user.avatar_url || "/api/placeholder/user"} />
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">{user.name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                          </ProfileFrame>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                               <span className="text-sm font-bold group-hover:text-primary transition-colors">{user.name}</span>
                               {user.is_admin && <Trophy className="w-3 h-3 text-primary" />}
                            </div>
                            <span className="text-[10px] text-muted-foreground">@{user.username}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.posts.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        <span>القصص والدروس</span>
                      </div>
                      {searchResults.posts.map((post) => (
                        <Link 
                          key={post.id} 
                          href={`/post/${post.id}`}
                          onClick={() => setShowResults(false)}
                          className="flex flex-col p-3 rounded-xl hover:bg-primary/5 transition-colors group border border-transparent hover:border-primary/10"
                        >
                          <span className="text-sm font-bold group-hover:text-primary transition-all line-clamp-1">{post.title}</span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{post.lesson}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.users.length === 0 && searchResults.posts.length === 0 && !isSearching && (
                    <div className="p-8 text-center space-y-2">
                      <div className="text-2xl opacity-20">🔍</div>
                      <p className="text-sm font-bold text-muted-foreground">لا توجد نتائج لـ "{searchQuery}"</p>
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setShowResults(false)}
                  className="block p-3 bg-muted/30 text-center text-xs font-black text-primary hover:bg-primary/5 transition-colors border-t border-border/50"
                >
                  مشاهدة جميع النتائج
                </Link>
              </div>
            )}
          </div>
          {/* Overlay to close on outside click */}
          {showResults && <div className="fixed inset-0 z-50 pointer-events-auto" onClick={() => setShowResults(false)} />}
        </div>

        {/* Actions */}
        <NavbarActions />
      </div>
    </nav>
  );
}
