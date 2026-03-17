import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PostCard } from "@/components/post-card";
import { Settings, MapPin, Calendar, Link as LinkIcon, UserPlus, UserMinus } from "lucide-react";
import { sql } from "@/lib/db";
import { getSuggestedUsers, getTrendingLessons } from "@/lib/actions";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { EditProfileModal } from "@/components/edit-profile-modal";
import { ProfileFollowButton } from "@/components/profile-follow-button";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import Link from "next/link";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).trim();
  const users = await sql`SELECT name, username FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(${username}))`;
  if (users.length === 0) return { title: "User Not Found | FlopHub" };
  const user = users[0];
  return {
    title: `${user.name || user.username} (@${user.username}) | FlopHub`,
  };
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).trim();
  const session = await getServerSession(authOptions);

  // Fetch real user data
  const users = await sql`
    SELECT id, username, name, email, bio, image_url, banner_url, created_at
    FROM users 
    WHERE LOWER(TRIM(username)) = LOWER(TRIM(${username}))
  `;

  if (users.length === 0) {
    notFound();
  }

  const user = users[0];
  const isOwnProfile = session?.user?.id === user.id;

  // Check if following
  const isFollowing = session?.user?.id 
    ? (await sql`SELECT 1 FROM followers WHERE follower_id = ${session.user.id} AND following_id = ${user.id}`).length > 0
    : false;

  // Fetch user stats
  const postCount = await sql`SELECT COUNT(*) FROM posts WHERE user_id = ${user.id}`;
  const followersCount = await sql`SELECT COUNT(*) FROM followers WHERE following_id = ${user.id}`;
  const followingCount = await sql`SELECT COUNT(*) FROM followers WHERE follower_id = ${user.id}`;

  // Fetch user posts
  const posts = await sql`
    SELECT 
      p.*, 
      u.username, 
      u.image_url as avatar_url,
      (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id) as helpful_count,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
      ${session?.user?.id ? sql`EXISTS(SELECT 1 FROM reactions WHERE post_id = p.id AND user_id = ${session.user.id})` : false} as has_reacted,
      ${session?.user?.id ? sql`EXISTS(SELECT 1 FROM saves WHERE post_id = p.id AND user_id = ${session.user.id})` : false} as is_saved
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE u.id = ${user.id}
    ORDER BY p.created_at DESC
  `;

  const userInitial = user.name ? user.name[0] : (user.username ? user.username[0] : "?");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8">
        <Sidebar className="hidden md:flex shrink-0 w-64" />

        <div className="flex-1 space-y-6 w-full max-w-4xl mx-auto">
          {/* Cover & Profile Header */}
          <div className="relative bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden group">
            <div 
              className={cn(
                "h-44 relative transition-all duration-700",
                !user.banner_url && "bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent"
              )}
              style={user.banner_url ? { 
                backgroundImage: user.banner_url.startsWith('preset-') 
                  ? undefined 
                  : `url(${user.banner_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : {}}
            >
               {user.banner_url?.startsWith('preset-') && (
                 <div className={cn("absolute inset-0 transition-opacity", user.banner_url.replace('preset-', 'banner-'))} />
               )}
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="px-8 pb-8 relative">
              <div className="absolute -top-16 right-8">
                <Avatar className="w-32 h-32 border-4 border-card shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  <AvatarImage src={user.image_url} />
                  <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex justify-between items-start pt-6 mb-6">
                 <div /> {/* Spacer */}
                 {isOwnProfile ? (
                   <Link href="/settings">
                     <Button variant="outline" className="rounded-full font-black border-2 hover:bg-primary/5 hover:text-primary transition-all gap-2">
                       <Settings className="w-4 h-4" />
                       تعديل الملف الشخصي
                     </Button>
                   </Link>
                 ) : (
                   <ProfileFollowButton userId={user.id} initialIsFollowing={isFollowing} />
                 )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-black tracking-tight">{user.name || user.username}</h1>
                  <span className="text-primary font-bold text-sm tracking-widest uppercase opacity-70">@{user.username}</span>
                </div>
                
                <p className="text-base font-medium leading-relaxed max-w-md text-muted-foreground/90 italic">
                  {user.bio || "لا يوجد وصف لهذا الملف الشخصي حتى الآن... هذا المستخدم يفضل ترك بصمته من خلال أفعاله!"}
                </p>

                <div className="flex flex-wrap gap-5 text-xs text-muted-foreground font-bold">
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                     <MapPin className="w-3.5 h-3.5 text-primary" />
                     <span>الرياض، السعودية</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                     <Calendar className="w-3.5 h-3.5 text-primary" />
                     <span>انضم في {new Date(user.created_at).toLocaleDateString("ar-SA", { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-10 pt-4">
                   <div className="flex flex-col">
                      <span className="font-black text-2xl text-foreground font-tajawal tracking-tight">{(followersCount[0] as any)?.count || 0}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">متابع</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="font-black text-2xl text-foreground font-tajawal tracking-tight">{(followingCount[0] as any)?.count || 0}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">يتابع</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="font-black text-2xl text-foreground font-tajawal tracking-tight">{(postCount[0] as any)?.count || 0}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">منشور</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content - Posts Only */}
          <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden">
            <div className="px-8 pt-8 pb-4 border-b border-border/50">
              <h2 className="text-xl font-black font-tajawal">المنشورات</h2>
            </div>
            
            <div className="p-6">
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-3">
                  {posts.map((post: any) => (
                    <Link key={post.id} href={`/post/${post.id}`}>
                      <div className="group bg-card/60 hover:bg-primary/5 border border-border/50 hover:border-primary/30 p-5 rounded-[1.5rem] transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-md">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-base font-black group-hover:text-primary transition-colors line-clamp-1">{post.title}</h3>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            {new Date(post.created_at).toLocaleDateString("ar-SA", { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/10 rounded-[2rem] border border-dashed border-border/50 text-muted-foreground">
                  <div className="text-5xl mb-4 opacity-20">📭</div>
                  <p className="font-bold text-lg">لا توجد منشورات حتى الآن.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <RightSidebar suggestedUsers={await getSuggestedUsers()} trendingLessons={await getTrendingLessons()} />
      </main>
    </div>
  );
}
