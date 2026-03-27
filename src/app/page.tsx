import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { getPosts, getSuggestedUsers, getTrendingLessons } from "@/lib/actions";
import { HomeClientWrapper } from "@/components/home-client-wrapper";
import { Suspense } from "react";

// ISR: revalidate every 30 seconds instead of force-dynamic (much faster)
export const revalidate = 30;

export default async function Home() {
  // Parallel fetching - all 3 queries run simultaneously
  const [posts, suggestedUsers, trendingLessons] = await Promise.all([
    getPosts('latest', 8, 0),
    getSuggestedUsers(),
    getTrendingLessons(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8">
        <Suspense fallback={<div className="flex-1 animate-pulse bg-muted/20 rounded-3xl h-screen" />}>
          <HomeClientWrapper 
            posts={posts} 
            suggestedUsers={suggestedUsers} 
            trendingLessons={trendingLessons} 
          />
        </Suspense>
      </main>
    </div>
  );
}
