"use client";

import { Sidebar } from "@/components/sidebar";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, Clock, Loader2 } from "lucide-react";
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

  const handleSortChange = async (value: string) => {
    setSort(value as any);
    const newPosts = await getPosts(value === 'trending' ? 'trending' : 'latest');
    setPosts(newPosts);
  };

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  return (
    <>
      <Sidebar onPostClick={() => setIsModalOpen(true)} />

      <div className="flex-1 flex flex-col gap-6 max-w-2xl">
        <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <CreatePost />
        </div>

        <Tabs defaultValue="foryou" className="w-full" dir="rtl" onValueChange={handleSortChange}>
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-8">
            <TabsTrigger 
              value="foryou" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>لك</span>
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 gap-2 opacity-50 data-[state=active]:opacity-100"
            >
              <TrendingUp className="w-4 h-4" />
              <span>الرائج</span>
            </TabsTrigger>
            <TabsTrigger 
              value="latest" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 gap-2 opacity-50 data-[state=active]:opacity-100"
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
               user={{ id: post.user_id, name: post.username, handle: post.username, avatar: post.avatar_url }}
               time={new Date(post.created_at).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}
               title={post.title}
               story={post.story}
               lesson={post.lesson}
               helpfulCount={parseInt(post.helpful_count)}
               commentsCount={parseInt(post.comments_count)}
               hasReacted={post.has_reacted}
               isSaved={post.is_saved}
             />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 text-muted-foreground bg-card rounded-2xl border border-dashed p-8">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-bold text-foreground">لا توجد منشورات بعد</h3>
              <p className="text-sm">كن أول من يشارك فشله ويلهم الآخرين!</p>
            </div>
          )}
        </div>
      </div>

      <CreatePostModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <RightSidebar suggestedUsers={suggestedUsers} trendingLessons={trendingLessons} />
    </>
  );
}
