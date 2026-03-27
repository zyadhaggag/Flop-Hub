"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  checkIsAdmin,
  adminGetStats,
  adminGetUsers,
  adminDeleteUser,
  adminResetAvatar,
  adminGetUserPosts,
  adminGetUserComments,
  adminDeletePost,
  adminDeleteComment,
  adminUpdateUser,
} from "@/lib/actions";
import { Navbar } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  FileText,
  MessageSquare,
  Trash2,
  ImageOff,
  Search,
  Shield,
  ChevronLeft,
  Eye,
  X,
  Loader2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    // Fast admin check with caching
    checkIsAdmin().then((ok) => {
      setAuthorized(ok);
      if (ok) {
        // Load data in parallel for faster loading
        loadData();
      }
    });
  }, []);

  const loadData = async () => {
    // Parallel data fetching for better performance
    const [s, u] = await Promise.all([
      adminGetStats(),
      adminGetUsers()
    ]);
    setStats(s);
    setUsers(u);
  };

  const handleSearch = () => {
    startTransition(async () => {
      const u = await adminGetUsers(search);
      setUsers(u);
    });
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`حذف المستخدم @${username} نهائياً؟ سيتم حذف كل بياناته.`)) return;
    const res = await adminDeleteUser(userId);
    if (res.success) {
      toast.success("تم حذف المستخدم");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
      if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
    } else toast.error(res.error);
  };

  const handleResetAvatar = async (userId: string) => {
    const res = await adminResetAvatar(userId);
    if (res.success) {
      toast.success("تم إعادة تعيين الصورة");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, image_url: null } : u)));
    } else toast.error(res.error);
  };

  const [editingUser, setEditingUser] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", username: "", bio: "" });

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    const res = await adminUpdateUser(selectedUser.id, editForm);
    if (res.success) {
      toast.success("تم تحديث بيانات المستخدم");
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, ...editForm } : u)));
      setSelectedUser({ ...selectedUser, ...editForm });
      setEditingUser(false);
    } else toast.error(res.error);
  };

  const viewUserDetail = async (user: any) => {
    setSelectedUser(user);
    setEditForm({ name: user.name || "", username: user.username || "", bio: user.bio || "" });
    setEditingUser(false);
    setLoadingDetail(true);
    const [posts, comments] = await Promise.all([
      adminGetUserPosts(user.id),
      adminGetUserComments(user.id),
    ]);
    setUserPosts(posts);
    setUserComments(comments);
    setLoadingDetail(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("حذف هذا المنشور؟")) return;
    const res = await adminDeletePost(postId);
    if (res.success) {
      toast.success("تم حذف المنشور");
      setUserPosts((prev) => prev.filter((p) => p.id !== postId));
    } else toast.error(res.error);
  };

  const handleDeleteComment = async (commentId: string) => {
    const res = await adminDeleteComment(commentId);
    if (res.success) {
      toast.success("تم حذف التعليق");
      setUserComments((prev) => prev.filter((c) => c.id !== commentId));
    } else toast.error(res.error);
  };

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4" dir="rtl">
        <Shield className="w-16 h-16 text-red-500/30" />
        <h1 className="text-2xl font-black">غير مصرح</h1>
        <p className="text-muted-foreground">ليس لديك صلاحية الوصول لهذه الصفحة.</p>
        <Link href="/">
          <Button variant="outline" className="rounded-xl">العودة للرئيسية</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground">إدارة المستخدمين والمحتوى</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Users} label="المستخدمون" value={stats.totalUsers} color="text-blue-500" bg="bg-blue-500/10" />
            <StatCard icon={FileText} label="المنشورات" value={stats.totalPosts} color="text-primary" bg="bg-primary/10" />
            <StatCard icon={MessageSquare} label="التعليقات" value={stats.totalComments} color="text-secondary" bg="bg-secondary/10" />
          </div>
        )}

        {/* Search */}
        <div className="flex gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ابحث عن مستخدم بالاسم أو البريد..."
            className="h-12 rounded-xl bg-card border-border text-base"
          />
          <Button onClick={handleSearch} className="h-12 px-6 rounded-xl font-black gap-2" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            بحث
          </Button>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Users Table */}
          <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/50 font-black text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              المستخدمون ({users.length})
            </div>
            <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
              {users.map((u) => (
                <div
                  key={u.id}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer",
                    selectedUser?.id === u.id && "bg-primary/5 border-r-4 border-primary"
                  )}
                  onClick={() => viewUserDetail(u)}
                >
                  <Avatar className="w-10 h-10 border border-border shrink-0">
                    <AvatarImage src={u.image_url || "/api/placeholder/user"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                      {u.name?.[0] || "؟"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black truncate">{u.name}</span>
                      {u.is_admin && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-black">أدمن</span>}
                    </div>
                    <span className="text-[11px] text-muted-foreground">@{u.username}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-left shrink-0">
                    <div>{u.post_count} منشور</div>
                    <div>{u.comment_count} تعليق</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg hover:bg-secondary/10 hover:text-secondary"
                      onClick={(e) => { e.stopPropagation(); handleResetAvatar(u.id); }}
                      title="إعادة تعيين الصورة"
                    >
                      <ImageOff className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500"
                      onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id, u.username); }}
                      title="حذف المستخدم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-center py-12 text-muted-foreground text-sm">لا يوجد مستخدمون</p>
              )}
            </div>
          </div>

          {/* User Detail Panel */}
          {selectedUser && (
            <div className="w-full lg:w-[400px] bg-card rounded-2xl border border-border shadow-sm overflow-hidden shrink-0">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="font-black text-sm">تفاصيل @{selectedUser.username}</span>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* User Profile Info & Edit Toggle */}
                    <div className="flex items-start justify-between bg-muted/30 p-4 rounded-2xl border border-border/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                          <AvatarImage src={selectedUser.image_url || "/api/placeholder/user"} />
                          <AvatarFallback className="bg-primary/10 text-primary font-black">
                            {selectedUser.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-sm">{selectedUser.name}</p>
                          <p className="text-xs text-muted-foreground">@{selectedUser.username}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={editingUser ? "secondary" : "outline"} 
                        className="h-8 rounded-xl gap-2 font-bold px-3"
                        onClick={() => setEditingUser(!editingUser)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        {editingUser ? "إلغاء التعديل" : "تعديل البيانات"}
                      </Button>
                    </div>

                    {editingUser ? (
                      <div className="space-y-4 bg-primary/5 p-4 rounded-2xl border border-primary/10 animate-in fade-in duration-300">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase mr-1">الاسم</label>
                          <Input 
                            value={editForm.name} 
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            className="h-10 rounded-xl bg-card border-border font-bold text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase mr-1">اسم المستخدم (@)</label>
                          <Input 
                            value={editForm.username} 
                            onChange={e => setEditForm({...editForm, username: e.target.value})}
                            className="h-10 rounded-xl bg-card border-border font-bold text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase mr-1">البايو / الوصف</label>
                          <Textarea 
                            value={editForm.bio} 
                            onChange={e => setEditForm({...editForm, bio: e.target.value})}
                            className="rounded-xl bg-card border-border font-medium text-sm min-h-[80px]"
                          />
                        </div>
                        <Button 
                          onClick={handleUpdateUser} 
                          className="w-full h-10 rounded-xl font-black gap-2" 
                          disabled={isPending}
                        >
                          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                          حفظ التعديلات
                        </Button>
                      </div>
                    ) : (
                      <div className="px-1">
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed italic border-r-2 border-primary/20 pr-3">
                          {selectedUser.bio || "لا يوجد وصف."}
                        </p>
                      </div>
                    )}

                    <div className="h-px bg-border/30 my-2" />

                    {/* User Posts */}
                    <div className="pt-2">
                      <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">
                        المنشورات ({userPosts.length})
                      </h3>
                      <div className="space-y-2">
                        {userPosts.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30 group">
                            <div className="flex-1 min-w-0">
                              <Link href={`/post/${p.id}`} className="text-sm font-bold truncate block hover:text-primary">{p.title}</Link>
                              <span className="text-[10px] text-muted-foreground">{Number(p.helpful_count)} إعجاب · {Number(p.comments_count)} تعليق</span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                              onClick={() => handleDeletePost(p.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        {userPosts.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا توجد منشورات</p>}
                      </div>
                    </div>

                    {/* User Comments */}
                    <div>
                      <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">
                        التعليقات ({userComments.length})
                      </h3>
                      <div className="space-y-2">
                        {userComments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2 p-3 rounded-xl bg-muted/30 border border-border/30 group">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-2" style={{ overflowWrap: 'anywhere' }}>{c.text}</p>
                              <Link href={`/post/${c.post_id}`} className="text-[10px] text-primary hover:underline">في: {c.post_title}</Link>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all shrink-0"
                              onClick={() => handleDeleteComment(c.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        {userComments.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا توجد تعليقات</p>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number; color: string; bg: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4">
      <div className={cn("p-3 rounded-xl", bg)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <div>
        <span className="text-3xl font-black tracking-tight">{value}</span>
        <p className="text-xs text-muted-foreground font-bold">{label}</p>
      </div>
    </div>
  );
}
