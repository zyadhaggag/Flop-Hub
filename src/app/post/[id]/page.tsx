import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { PostCard } from "@/components/post-card";
import { getPostById, getSuggestedUsers, getTrendingLessons } from "@/lib/actions";
import { RightSidebar } from "@/components/right-sidebar";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostById(params.id);
  if (!post) return { title: "Post Not Found | FlopHub" };
  
  return {
    title: `${post.title} | FlopHub`,
    description: post.story.substring(0, 160),
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPostById(params.id);
  
  if (!post) {
    notFound();
  }

  const [suggestedUsers, trendingLessons] = await Promise.all([
    getSuggestedUsers(),
    getTrendingLessons()
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8" dir="rtl">
        <Sidebar className="hidden lg:flex" />

        <div className="flex-1 max-w-2xl mx-auto w-full">
            <div className="mb-6 flex items-center gap-2 text-muted-foreground">
                <span className="text-sm font-bold">الرئيسية</span>
                <span className="text-sm opacity-50">/</span>
                <span className="text-sm font-black text-primary">المنشور</span>
            </div>
            
            <PostCard 
                id={post.id} 
                user={{
                    id: post.user_id,
                    name: post.name,
                    handle: post.username,
                    avatar: post.avatar_url
                }} 
                time={new Date(post.created_at).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}
                title={post.title} 
                story={post.story} 
                lesson={post.lesson}
                imageUrl={post.image_url}
                helpfulCount={Number(post.helpful_count)}
                commentsCount={Number(post.comments_count)}
                hasReacted={post.has_reacted}
                isSaved={post.is_saved}
                isFollowed={post.is_followed}
            />
        </div>

        <RightSidebar 
          suggestedUsers={suggestedUsers} 
          trendingLessons={trendingLessons}
          className="hidden xl:flex" 
        />
      </main>
    </div>
  );
}
