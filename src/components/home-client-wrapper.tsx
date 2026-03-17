"use client";

import { Sidebar } from "@/components/sidebar";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

        <Tabs defaultValue="foryou" className="w-full" dir="rtl" onValueChange={handleSortChange}>
          <TabsList className="bg-transparent border-none w-full justify-start rounded-none h-auto p-0 gap-2 sm:gap-8">
            <TabsTrigger 
              value="foryou" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 gap-2 text-sm font-bold transition-all hover:bg-primary/5 h-14"
            >
              <Sparkles className="w-4 h-4" />
              <span>لك</span>
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 gap-2 text-sm font-bold opacity-50 data-[state=active]:opacity-100 transition-all hover:bg-primary/5 h-14"
            >
              <TrendingUp className="w-4 h-4" />
              <span>الرائج</span>
            </TabsTrigger>
            <TabsTrigger 
              value="latest" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 gap-2 text-sm font-bold opacity-50 data-[state=active]:opacity-100 transition-all hover:bg-primary/5 h-14"
            >
              <Clock className="w-4 h-4" />
              <span>الأحدث</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
