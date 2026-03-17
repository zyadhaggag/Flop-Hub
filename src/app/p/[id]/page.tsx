import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { PostCard } from "@/components/post-card";
import { getPostById, getSuggestedUsers, getTrendingLessons } from "@/lib/actions";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  if (!post) return { title: "المنشور غير موجود" };
  return { title: post.title };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  const suggestedUsers = await getSuggestedUsers();
  const trendingLessons = await getTrendingLessons();

  if (!post) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8">
        <Sidebar className="hidden md:flex" />
        
        <div className="flex-1 max-w-2xl mx-auto w-full">
          <PostCard 
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
          />
        </div>

        <RightSidebar suggestedUsers={suggestedUsers} trendingLessons={trendingLessons} className="hidden lg:flex" />
      </main>
    </div>
  );
}
