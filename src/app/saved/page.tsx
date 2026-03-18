import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { PostCard } from "@/components/post-card";
import { Bookmark } from "lucide-react";
import { getSavedPosts, getSuggestedUsers, getTrendingLessons } from "@/lib/actions";

export const metadata = {
  title: "المحفوظات",
};

export default async function SavedPage() {
  const savedPosts = await getSavedPosts();
  const suggestedUsers = await getSuggestedUsers();
  const trendingLessons = await getTrendingLessons();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8" dir="rtl">
        <Sidebar className="hidden lg:flex shrink-0 w-64 sticky top-20 h-fit" />
        
        <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-3 mb-2 px-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
               <Bookmark className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight font-tajawal">المحفوظات</h1>
              <p className="text-sm text-muted-foreground font-medium">القصص والدروس التي قمت بحفظها للرجوع إليها</p>
            </div>
          </div>

          <div className="space-y-6 pb-20">
            {savedPosts.length > 0 ? (
              savedPosts.map((post: any) => (
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
                  isSaved={true}
                  category={post.category}
                />
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground bg-card/40 backdrop-blur-sm rounded-[2.5rem] border border-dashed p-10">
                <div className="text-5xl mb-6">🔖</div>
                <h3 className="text-xl font-black text-foreground">لا توجد محفوظات</h3>
                <p className="text-sm mt-2">احفظ القصص التي تهمك لتجدها هنا لاحقاً.</p>
              </div>
            )}
          </div>
        </div>

        <RightSidebar suggestedUsers={suggestedUsers} trendingLessons={trendingLessons} className="hidden xl:flex w-80 shrink-0 flex-col gap-6 sticky top-20 h-fit" />
      </main>
    </div>
  );
}
