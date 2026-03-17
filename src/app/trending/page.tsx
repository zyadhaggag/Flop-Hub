import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { TrendingUp } from "lucide-react";
import { getSuggestedUsers, getTrendingLessons } from "@/lib/actions";

export default async function TrendingPage() {
  const suggestedUsers = await getSuggestedUsers();
  const trendingLessons = await getTrendingLessons();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8">
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-card rounded-3xl border border-border shadow-xl min-h-[60vh] text-center space-y-6">
          <TrendingUp className="w-20 h-20 text-primary opacity-20" />
          <h1 className="text-3xl font-black">المواضيع الرائجة</h1>
          <p className="text-muted-foreground max-w-md">نحن هنا نجمع لك أكثر الدروس التي أحدثت ضجة وتفاعلاً. قريباً ستتمكن من تصفحها بالكامل.</p>
        </div>
        <RightSidebar suggestedUsers={suggestedUsers} trendingLessons={trendingLessons} className="hidden lg:flex" />
      </main>
    </div>
  );
}
