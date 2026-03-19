import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { getSuggestedUsers, getTrendingLessons } from "@/lib/actions";
import { ChallengesClient } from "@/components/challenges-client";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  const [suggestedUsers, trendingLessons] = await Promise.all([
    getSuggestedUsers(),
    getTrendingLessons(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pb-20 sm:pb-0" dir="rtl">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8">
        <Sidebar className="hidden md:flex shrink-0 w-64" />
        <div className="flex-1 max-w-2xl mx-auto w-full">
          <ChallengesClient />
        </div>
        <RightSidebar suggestedUsers={suggestedUsers} trendingLessons={trendingLessons} className="hidden lg:flex" />
      </main>
    </div>
  );
}
