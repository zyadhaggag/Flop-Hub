import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { Settings, Calendar, ChevronLeft, Crown } from "lucide-react";
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
  'preset-1': { background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)' },
  'preset-2': { background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)' },
  'preset-3': { background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  'preset-4': { background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' },
  'preset-5': { background: 'linear-gradient(135deg, #000000 0%, #1e293b 100%)' },
  'preset-6': { background: 'radial-gradient(#ffffff 0.5px, transparent 0.5px) #000', size: '20px 20px' },
  'preset-7': { background: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px) #111827', size: '30px 30px' },
  'preset-8': { background: 'radial-gradient(circle at center, #7c3aed 0%, #000 100%)' },
  'preset-9': { background: 'linear-gradient(45deg, #ff00cc, #3333ff)' },
  'preset-10': { background: 'repeating-linear-gradient(45deg, #222 0, #222 1px, transparent 0, transparent 50%) #1a1a1a', size: '10px 10px' },
  'preset-11': { background: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)' },
  'preset-12': { background: 'linear-gradient(to right, #24c6dc, #514a9d)' },
  'preset-13': { background: 'linear-gradient(to right, #11998e, #38ef7d)' },
  'preset-14': { background: 'linear-gradient(to right, #ff9966, #ff5e62)' },
  'preset-15': { background: 'radial-gradient(circle, #fe8c00 0%, #f83600 100%)' },
  'admin-gold': { background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF8C00 50%, #FFD700 75%, #FFA500 100%)', size: '200% 200%' },
};

function getBannerStyle(bannerUrl: string | null, isAdmin: boolean = false): React.CSSProperties {
  if (isAdmin && !bannerUrl) {
    // Default gold theme for admin
    return { 
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF8C00 50%, #FFD700 75%, #FFA500 100%)',
      backgroundSize: '200% 200%',
      animation: 'goldShimmer 3s ease-in-out infinite'
    };
  }
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
    SELECT id, username, name, email, bio, image_url, banner_url, created_at, social_links, is_admin
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
    <div className="min-h-screen flex flex-col bg-background text-foreground pb-20 sm:pb-0" dir="rtl">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-4 p-4 md:p-6 lg:p-8">
        <Sidebar className="hidden md:flex shrink-0 w-64" />

        <div className="flex-1 space-y-6 w-full max-w-4xl mx-auto">
          {/* Cover & Profile Header */}
          <div className={cn(
            "relative bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-sm overflow-hidden group transition-all duration-500",
            user.is_admin && "ring-4 ring-amber-500/30 shadow-amber-500/20 shadow-2xl bg-gradient-to-br from-amber-50/5 via-yellow-50/2 to-transparent"
          )}>
            {/* Banner */}
            <div
              className={cn(
                "h-32 sm:h-44 relative transition-all duration-700",
                !user.banner_url && (user.is_admin ? "bg-gradient-to-br from-amber-500/20 via-yellow-200/5 to-transparent" : "bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent")
              )}
              style={getBannerStyle(user.banner_url, user.is_admin)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {user.is_admin && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
              )}
            </div>

            <div className={cn(
              "px-6 sm:px-8 pb-8 relative",
              user.is_admin && "bg-gradient-to-b from-transparent via-amber-50/5 to-transparent"
            )}>
              <div className="absolute -top-12 sm:-top-16 right-6 sm:right-8">
                <Avatar className={cn(
                  "w-24 h-24 sm:w-32 sm:h-32 border-4 shadow-2xl group-hover:scale-105 transition-transform duration-500",
                  user.is_admin ? "border-amber-400/50 ring-4 ring-amber-500/20" : "border-card"
                )}>
                  <AvatarImage src={user.image_url || "/api/placeholder/user"} />
                  <AvatarFallback className={cn("text-2xl sm:text-3xl font-black", user.is_admin ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" : "bg-primary/10 text-primary")}>
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                {user.is_admin && (
                  <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-gradient-to-br from-amber-400 to-amber-600 text-white p-1 sm:p-1.5 rounded-full shadow-lg border-2 border-amber-300/50 animate-pulse">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-16 sm:pt-6 mb-6 gap-4">
                <div className="space-y-0.5 pr-28 sm:pr-40">
                  <div className="flex items-center gap-2">
                    <h1 className={cn(
                      "text-2xl sm:text-3xl font-black tracking-tight",
                      user.is_admin && "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-clip-text text-transparent"
                    )}>{user.name || user.username}</h1>
                    {user.is_admin && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-600 text-white px-2 py-0.5 rounded-lg shadow-lg shadow-amber-500/30 animate-pulse">
                        <span className="text-[10px] font-black uppercase tracking-widest">ADMIN</span>
                      </div>
                    )}
                  </div>
                  <p className={cn(
                    "text-primary font-bold text-sm tracking-widest uppercase opacity-70",
                    user.is_admin && "text-amber-600/80"
                  )}>@{user.username}</p>
                </div>

                {isOwnProfile ? (
                  <Link href="/settings" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-10 rounded-xl sm:rounded-full font-black border-2 hover:bg-primary/5 hover:text-primary transition-all gap-2">
                      <Settings className="w-4 h-4" />
                      إعدادات الحساب
                    </Button>
                  </Link>
                ) : (
                  <ProfileFollowButton userId={user.id} initialIsFollowing={isFollowing} />
                )}
              </div>

              <div className="space-y-4">
                {user.bio && (
                  <p className="text-sm sm:text-base font-medium leading-relaxed max-w-2xl text-muted-foreground/90 text-center">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-1">
                  <div className="flex flex-col">
                    <span className="font-black text-xl sm:text-2xl text-foreground tracking-tight">{followersCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">متابع</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-xl sm:text-2xl text-foreground tracking-tight">{followingCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">يتابع</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-xl sm:text-2xl text-foreground tracking-tight">{postCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">منشور</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-bold mr-auto">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>انضم في {new Date(user.created_at).toLocaleDateString("ar-SA", { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {socialLinks.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 justify-items-center">
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
          <div className="bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black">المنشورات</h2>
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{postCount} منشور</span>
            </div>

            <div className="p-4 sm:p-6">
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {posts.map((post: any) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      user={{
                        id: user.id,
                        name: user.name,
                        handle: user.username,
                        avatar: user.image_url || "",
                        is_admin: user.is_admin
                      }}
                      time={post.created_at}
                      title={post.title}
                      story={post.story}
                      lesson={post.lesson}
                      imageUrl={post.image_url}
                      helpfulCount={post.reactions_count}
                      commentsCount={post.comments_count}
                      hasReacted={post.is_helpful}
                      category={post.category}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChevronLeft className="w-8 h-8 text-muted-foreground/30 rotate-180" />
                  </div>
                  <p className="text-muted-foreground font-black">لا توجد منشورات بعد.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <RightSidebar suggestedUsers={suggestedUsers} trendingLessons={trendingLessons} className="hidden lg:flex" />
      </main>
    </div>
  );
}
