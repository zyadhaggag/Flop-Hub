import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { Settings, Calendar, ChevronLeft } from "lucide-react";
import { sql } from "@/lib/db";
import { getSuggestedUsers, getTrendingLessons } from "@/lib/actions";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { EditProfileModal } from "@/components/edit-profile-modal";
import { ProfileFollowButton } from "@/components/profile-follow-button";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";
import { getPlatformIcon, getPlatformColor } from "@/lib/social-links";

export const revalidate = 60; // ISR – revalidate every 60 seconds

// Centralized banner preset styles (must match ProfileBannerSelector)
const PRESET_STYLES: Record<string, { background: string; size?: string }> = {
  'preset-1':  { background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)' },
  'preset-2':  { background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)' },
  'preset-3':  { background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  'preset-4':  { background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' },
  'preset-5':  { background: 'linear-gradient(135deg, #000000 0%, #1e293b 100%)' },
  'preset-6':  { background: 'radial-gradient(#ffffff 0.5px, transparent 0.5px) #000', size: '20px 20px' },
  'preset-7':  { background: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px) #111827', size: '30px 30px' },
  'preset-8':  { background: 'radial-gradient(circle at center, #7c3aed 0%, #000 100%)' },
  'preset-9':  { background: 'linear-gradient(45deg, #ff00cc, #3333ff)' },
  'preset-10': { background: 'repeating-linear-gradient(45deg, #222 0, #222 1px, transparent 0, transparent 50%) #1a1a1a', size: '10px 10px' },
  'preset-11': { background: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)' },
  'preset-12': { background: 'linear-gradient(to right, #24c6dc, #514a9d)' },
  'preset-13': { background: 'linear-gradient(to right, #11998e, #38ef7d)' },
  'preset-14': { background: 'linear-gradient(to right, #ff9966, #ff5e62)' },
  'preset-15': { background: 'radial-gradient(circle, #fe8c00 0%, #f83600 100%)' },
};

function getBannerStyle(bannerUrl: string | null): React.CSSProperties {
  if (!bannerUrl) return {};
  if (bannerUrl.startsWith('preset-')) {
    const ps = PRESET_STYLES[bannerUrl];
    return ps ? { background: ps.background, backgroundSize: ps.size || 'cover' } : {};
  }
  return { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).trim();
  const users = await sql`SELECT name, username FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(${username}))`;
  if (users.length === 0) return { title: "المستخدم غير موجود" };
  const user = users[0];
  return {
    title: `${user.name || user.username} (@${user.username})`,
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).trim();
  const session = await getServerSession(authOptions);

  const users = await sql`
    SELECT id, username, name, email, bio, image_url, banner_url, created_at, social_links
    FROM users 
    WHERE LOWER(TRIM(username)) = LOWER(TRIM(${username}))
  `;

  if (users.length === 0) notFound();

  const user = users[0];
  const isOwnProfile = session?.user?.id === user.id;

  const [isFollowingRes, postCountRes, followersCountRes, followingCountRes, posts, suggestedUsers, trendingLessons] = await Promise.all([
    session?.user?.id
      ? sql`SELECT 1 FROM followers WHERE follower_id = ${session.user.id} AND following_id = ${user.id}`
      : Promise.resolve([]),
    sql`SELECT COUNT(*) FROM posts WHERE user_id = ${user.id}`,
    sql`SELECT COUNT(*) FROM followers WHERE following_id = ${user.id}`,
    sql`SELECT COUNT(*) FROM followers WHERE follower_id = ${user.id}`,
    sql`
      SELECT 
        p.*, 
        u.username, 
        u.name,
        u.image_url as avatar_url,
        (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id) as helpful_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
        ${session?.user?.id ? sql`EXISTS(SELECT 1 FROM reactions WHERE post_id = p.id AND user_id = ${session.user.id})` : sql`FALSE`}::boolean as has_reacted,
        ${session?.user?.id ? sql`EXISTS(SELECT 1 FROM saves WHERE post_id = p.id AND user_id = ${session.user.id})` : sql`FALSE`}::boolean as is_saved
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE u.id = ${user.id}
      ORDER BY p.created_at DESC
    `,
    getSuggestedUsers(),
    getTrendingLessons(),
  ]);

  const isFollowing = isFollowingRes.length > 0;
  const postCount = Number((postCountRes[0] as any)?.count || 0);
  const followersCount = Number((followersCountRes[0] as any)?.count || 0);
  const followingCount = Number((followingCountRes[0] as any)?.count || 0);
  const userInitial = user.name?.[0] || user.username?.[0] || "؟";

  const socialLinks = user.social_links 
    ? (typeof user.social_links === 'string' ? JSON.parse(user.social_links) : user.social_links)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8">
        <Sidebar className="hidden md:flex shrink-0 w-64" />

        <div className="flex-1 space-y-6 w-full max-w-4xl mx-auto">
          {/* Cover & Profile Header */}
          <div className="relative bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden group">
            {/* Banner */}
            <div 
              className={cn(
                "h-44 relative transition-all duration-700",
                !user.banner_url && "bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent"
              )}
              style={getBannerStyle(user.banner_url)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                <div />
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
                <div className="space-y-0.5">
                  <h1 className="text-3xl font-black tracking-tight">{user.name || user.username}</h1>
                  <span className="text-primary font-bold text-sm tracking-widest uppercase opacity-70">@{user.username}</span>
                </div>
                
                {user.bio && (
                  <p className="text-base font-medium leading-relaxed max-w-2xl text-muted-foreground/90">
                    {user.bio}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>انضم في {new Date(user.created_at).toLocaleDateString("ar-SA", { month: 'long', year: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-8 pt-1">
                  <div className="flex flex-col">
                    <span className="font-black text-2xl text-foreground tracking-tight">{followersCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">متابع</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-2xl text-foreground tracking-tight">{followingCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">يتابع</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-2xl text-foreground tracking-tight">{postCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">منشور</span>
                  </div>
                </div>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {socialLinks.map((link: any, i: number) => {
                      const Icon = getPlatformIcon(link.platform);
                      const color = getPlatformColor(link.platform);
                      const href = link.url.startsWith('http') ? link.url 
                        : link.platform === 'phone' ? `tel:${link.url}` 
                        : link.platform === 'email' ? `mailto:${link.url}` 
                        : `https://${link.url}`;
                      return (
                        <a 
                          key={i} 
                          href={href}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all group/link hover:bg-muted/50 shadow-sm"
                        >
                          <div className="p-2 rounded-xl bg-card shadow-sm group-hover/link:scale-110 transition-transform" style={{ color }}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black truncate">{link.name}</span>
                            <span className="text-[10px] text-muted-foreground font-bold truncate opacity-60">انقر للمواصلة</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
            <div className="px-8 pt-8 pb-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-xl font-black">المنشورات</h2>
              <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{postCount} منشور</span>
            </div>
            
            <div className="p-6">
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {posts.map((post: any) => (
                    <PostCard 
                      key={post.id} 
                      id={post.id}
                      user={{
                        id: user.id,
                        name: user.name || user.username,
                        handle: user.username,
                        avatar: user.image_url || ""
                      }}
                      time={new Date(post.created_at).toISOString()}
                      title={post.title}
                      story={post.story}
                      lesson={post.lesson}
                      imageUrl={post.image_url}
                      helpfulCount={Number(post.helpful_count)}
                      commentsCount={Number(post.comments_count)}
                      hasReacted={post.has_reacted}
                      isSaved={post.is_saved}
                      category={post.category}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/10 rounded-[2rem] border border-dashed border-border/50 text-muted-foreground">
                  <div className="text-5xl mb-4 opacity-20">📭</div>
                  <p className="font-bold text-lg">لا توجد منشورات حتى الآن.</p>
                  {isOwnProfile && (
                    <p className="text-sm mt-2 opacity-60">شارك قصة فشلك الأولى وابدأ رحلتك!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <RightSidebar suggestedUsers={suggestedUsers} trendingLessons={trendingLessons} />
      </main>
    </div>
  );
}
