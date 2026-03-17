import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { PostCard } from "@/components/post-card";
import { searchPosts, getSuggestedUsers, getTrendingLessons } from "@/lib/actions";
import { Search as SearchIcon, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  return { title: `نتائج البحث عن: ${q || ""}` };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const query = q || "";
  const { posts, users } = query ? await searchPosts(query) : { posts: [], users: [] };
  const suggestedUsers = await getSuggestedUsers();
  const trendingLessons = await getTrendingLessons();

  const hasResults = posts.length > 0 || users.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8">
        <Sidebar className="hidden md:flex" />
        
        <div className="flex-1 max-w-2xl mx-auto w-full space-y-8">
          <div className="flex items-center gap-3 mb-2 px-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
               <SearchIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight font-tajawal">نتائج البحث</h1>
              <p className="text-sm text-muted-foreground font-medium">عن: "{query}"</p>
            </div>
          </div>

          {users.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Users className="w-4 h-4 text-primary" />
                <h2 className="text-lg font-black font-tajawal">المستخدمين</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((user: any) => (
                  <Link 
                    key={user.id} 
                    href={`/u/${user.username}`}
                    className="flex items-center gap-3 p-4 rounded-[2rem] bg-card/40 border border-border/50 hover:border-primary/30 transition-all group"
                  >
                    <Avatar className="w-12 h-12 border-2 border-background group-hover:border-primary transition-colors">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm truncate">{user.name}</span>
                      <span className="text-[11px] text-muted-foreground font-medium">@{user.username}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6 pb-20">
            {posts.length > 0 ? (
              <>
                <div className="flex items-center gap-2 px-2 pt-4 border-t border-border/20">
                  <h2 className="text-lg font-black font-tajawal">المنشورات</h2>
                </div>
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
                    isSaved={post.is_saved}
                  />
                ))}
              </>
            ) : !hasResults ? (
              <div className="text-center py-20 text-muted-foreground bg-card/40 backdrop-blur-sm rounded-[2.5rem] border border-dashed p-10">
                <div className="text-5xl mb-6">🔍</div>
                <h3 className="text-xl font-black text-foreground">لا توجد نتائج</h3>
                <p className="text-sm mt-2">جرب البحث بكلمات أخرى أو ابحث باسم الملف الشخصي.</p>
              </div>
            ) : null}
          </div>
        </div>

        <RightSidebar suggestedUsers={suggestedUsers} trendingLessons={trendingLessons} className="hidden lg:flex" />
      </main>
    </div>
  );
}
