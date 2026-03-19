import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { getPosts, getSuggestedUsers, getTrendingLessons } from "@/lib/actions";
import { HomeClientWrapper } from "@/components/home-client-wrapper";
 
export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPosts('latest', 4, 0);
  const suggestedUsers = await getSuggestedUsers();
  const trendingLessons = await getTrendingLessons();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8">
        <HomeClientWrapper 
          posts={posts} 
          suggestedUsers={suggestedUsers} 
          trendingLessons={trendingLessons} 
        />
      </main>
    </div>
  );
}
