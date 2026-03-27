"use client";

import { Sidebar } from "@/components/sidebar";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { Sparkles, TrendingUp, Clock, Loader2, Plus, ArrowDown, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CreatePostModal = dynamic(() => import("./create-post-modal").then(mod => mod.CreatePostModal), {
  ssr: false,
  loading: () => null
});
 
const RightSidebar = dynamic(() => import("./right-sidebar").then(mod => mod.RightSidebar), {
  ssr: false,
  loading: () => <div className="w-80 hidden lg:block h-[500px] animate-pulse bg-muted/20 rounded-3xl" />
});
 
import { getPosts } from "@/lib/actions";

export function HomeClientWrapper({ 
  posts: initialPosts,
  suggestedUsers,
  trendingLessons
}: { 
  posts: any[],
  suggestedUsers: any[],
  trendingLessons: any[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [sort, setSort] = useState<'latest' | 'trending' | 'foryou'>('foryou');
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 8;
  const [hasMore, setHasMore] = useState(initialPosts.length === PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const handleSortChange = async (value: string) => {
    setIsLoading(true);
    setSort(value as any);
    setPage(1);
    
    // Optimized: Use Promise.all for parallel operations
    const [newPosts] = await Promise.all([
      getPosts(value as any, PAGE_SIZE, 0)
    ]);
    
    setPosts(newPosts);
    setHasMore(newPosts.length === PAGE_SIZE);
    setIsLoading(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPosts = await getPosts(sort, PAGE_SIZE, posts.length);
    if (nextPosts.length > 0) {
      setPosts(prev => [...prev, ...nextPosts]);
      setHasMore(nextPosts.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    setPosts(initialPosts);
    setHasMore(initialPosts.length === PAGE_SIZE);
  }, [initialPosts]);

  return (
    <>
      <Sidebar onPostClick={() => setIsModalOpen(true)} />

      <div className="flex-1 flex flex-col gap-6 max-w-4xl">
        <div onClick={() => setIsModalOpen(true)} className="cursor-pointer group">
          <CreatePost />
        </div>

        {/* Animated Pill Tabs */}
        <div className="flex gap-1.5 bg-muted/30 p-1.5 rounded-2xl border border-border/40 w-fit mx-auto" dir="rtl">
          {[
            { value: 'foryou', label: 'لك', icon: Sparkles },
            { value: 'trending', label: 'الرائج', icon: TrendingUp },
            { value: 'latest', label: 'الأحدث', icon: Clock },
          ].map((tab, index) => {
            const Icon = tab.icon;
            const isActive = sort === tab.value;
            return (
              <div
                key={tab.value}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group cursor-pointer",
                  isActive
                    ? "text-white shadow-lg shadow-primary/25 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => handleSortChange(tab.value)}
                style={{
                  background: isActive 
                    ? "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)"
                    : "transparent",
                  color: isActive ? 'white' : undefined
                }}
              >
                <Icon className={`w-4 h-4 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="relative z-10">{tab.label}</span>
              </div>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-black">جاري التحميل...</span>
            </div>
          </div>
        )}

        {/* Posts Grid with Animation */}
        <div className="space-y-6 pb-20">
          {posts.map((post: any, index) => (
            <div 
              key={post.id} 
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${Math.min(index, 3) * 80}ms` }}
            >
              <PostCard 
                id={post.id} 
                user={{ 
                  id: post.user_id, 
                  name: post.name || post.username, 
                  handle: post.username, 
                  avatar: post.avatar_url || "/api/placeholder/user",
                  is_admin: post.is_admin
                }} 
                time={post.created_at}
                title={post.title}
                story={post.story}
                lesson={post.lesson}
                imageUrl={post.image_url}
                helpfulCount={parseInt(post.helpful_count)}
                commentsCount={parseInt(post.comments_count)}
                hasReacted={post.has_reacted}
                isSaved={post.is_saved}
                isFollowed={post.is_followed}
                category={post.category}
              />
            </div>
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-8 animate-in fade-in duration-700">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="h-12 px-8 rounded-2xl font-black gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    تحميل المزيد
                    <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <CreatePostModal open={isModalOpen} onOpenChange={() => setIsModalOpen(false)} />
      <RightSidebar 
        suggestedUsers={suggestedUsers} 
        trendingLessons={trendingLessons}
        className="hidden xl:flex w-80 shrink-0 flex-col gap-6 sticky top-20 h-fit" 
      />
    </>
  );
}
