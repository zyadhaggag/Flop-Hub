"use client";

import { Sidebar } from "@/components/sidebar";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { Sparkles, TrendingUp, Clock, Loader2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

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
  const [hasMore, setHasMore] = useState(initialPosts.length === 5);

  const PAGE_SIZE = 5;

  const handleSortChange = async (value: string) => {
    setSort(value as any);
    const newPosts = await getPosts(value as any, PAGE_SIZE, 0);
    setPosts(newPosts);
    setHasMore(newPosts.length === PAGE_SIZE);
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
        <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <CreatePost />
        </div>

        {/* Pill Tabs */}
        <div className="flex gap-1.5 bg-muted/30 p-1.5 rounded-2xl border border-border/40 w-fit mx-auto" dir="rtl">
          {[
            { value: 'foryou', label: 'لك', icon: Sparkles },
            { value: 'trending', label: 'الرائج', icon: TrendingUp },
            { value: 'latest', label: 'الأحدث', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = sort === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleSortChange(tab.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-6 pb-20">
          {posts.map((post: any) => (
             <PostCard 
               key={post.id} 
               id={post.id}
               user={{ id: post.user_id, name: post.name || post.username, handle: post.username, avatar: post.avatar_url }}
               time={post.created_at}
               title={post.title}
               story={post.story}
               lesson={post.lesson}
               helpfulCount={parseInt(post.helpful_count)}
               commentsCount={parseInt(post.comments_count)}
               hasReacted={post.has_reacted}
               isSaved={post.is_saved}
               isFollowed={post.is_followed}
               category={post.category}
             />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="group flex items-center gap-3 px-8 py-4 bg-primary/5 hover:bg-primary/10 text-primary rounded-2xl font-black transition-all border border-primary/20 hover:border-primary/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التحميل...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>تحميل المزيد من القصص</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <CreatePostModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <RightSidebar suggestedUsers={suggestedUsers} trendingLessons={trendingLessons} />
    </>
  );
}
