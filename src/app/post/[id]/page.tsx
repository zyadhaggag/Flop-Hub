import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { PostCard } from "@/components/post-card";
import { getPostById, getSuggestedUsers, getTrendingLessons } from "@/lib/actions";
import { RightSidebar } from "@/components/right-sidebar";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // ISR – revalidate every 60 seconds for better performance

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  return {
    title: `${post.title}`,
    description: post.story.substring(0, 160),
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  
  // Parallel data fetching for better performance
  const [post, suggestedUsers, trendingLessons] = await Promise.all([
    getPostById(id),
    getSuggestedUsers(),
    getTrendingLessons()
  ]);
  
  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8" dir="rtl">
        <Sidebar className="hidden lg:flex shrink-0 w-64 sticky top-20 h-fit" />

        <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
            <div className="flex items-center gap-4 mb-2 px-2 animate-in fade-in slide-in-from-right-8 duration-700">
                <Link href="/" className="w-12 h-12 rounded-2xl bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-sm border border-border/40 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all group">
                   <ChevronLeft className="w-6 h-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                  <h1 className="text-3xl font-black tracking-tight font-tajawal">عرض المنشور</h1>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">
                    <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                    <span>/</span>
                    <span className="text-primary/80">المنشور</span>
                  </div>
                </div>
            </div>
            
            <div className="animate-in fade-in zoom-in-95 duration-1000 delay-200">
               <PostCard 
                  id={post.id} 
                  user={{
                      id: post.user_id,
                      name: post.name || post.username,
                      handle: post.username,
                      avatar: post.avatar_url
                  }} 
                  time={post.created_at}
                  title={post.title} 
                  story={post.story} 
                  lesson={post.lesson}
                  imageUrl={post.image_url}
                  helpfulCount={Number(post.helpful_count)}
                  commentsCount={Number(post.comments_count)}
                  hasReacted={post.has_reacted}
                  isSaved={post.is_saved}
                  isFollowed={post.is_followed}
                  category={post.category}
               />
            </div>
        </div>

        <RightSidebar 
          suggestedUsers={suggestedUsers} 
          trendingLessons={trendingLessons}
          className="hidden xl:flex w-80 shrink-0 flex-col gap-6 sticky top-20 h-fit" 
        />
      </main>
    </div>
  );
}
