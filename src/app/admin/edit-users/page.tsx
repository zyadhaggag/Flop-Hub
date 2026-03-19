"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Mail, 
  Search,
  Edit,
  Save,
  X,
  Shield,
  Ban,
  Check,
  Loader2,
  Zap,
  Clock,
  Unlock
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getUsersAdmin, updateUserStats, setUserTimeout, clearUserTimeout } from "@/lib/admin-actions";

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  is_admin: boolean;
  created_at: string;
  timeout_until: string | null;
  followers_count: number;
  override_post_count: number | null;
}

export default function AdminEditUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [timeoutMinutes, setTimeoutMinutes] = useState("60");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getUsersAdmin();
      setUsers(data as AdminUser[]);
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStats = async (userId: string, followers: number, posts: number) => {
    setActionLoading(userId);
    try {
      const res = await updateUserStats(userId, { followers, posts });
      if (res.success) {
        toast.success("تم تحديث الأرقام الفلكية بنجاح! 🚀");
        loadUsers();
      } else {
        toast.error(res.error || "فشل التحديث");
      }
    } catch (e) {
      toast.error("خطأ تقني");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetTimeout = async (userId: string) => {
    const mins = parseInt(timeoutMinutes);
    if (isNaN(mins) || mins <= 0) return toast.error("أدخل وقت صحيح");
    
    setActionLoading(userId + '-timeout');
    try {
      const res = await setUserTimeout(userId, mins);
      if (res.success) {
        toast.success(`تم إعطاء تايم أوت لمدة ${mins} دقيقة`);
        loadUsers();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearTimeout = async (userId: string) => {
    setActionLoading(userId + '-timeout');
    try {
      const res = await clearUserTimeout(userId);
      if (res.success) {
        toast.success("تم فك التايم أوت");
        loadUsers();
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                <X className="w-4 h-4" />
                العودة
              </Button>
              <h1 className="text-xl font-black">إدارة جحافل المستخدمين</h1>
            </div>
            <Badge variant="outline" className="text-primary border-primary">نظام التحكم الشامل</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالحرف عن أي مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 h-12 rounded-2xl bg-muted/50 border-none"
            />
          </div>
          <p className="text-sm font-bold text-muted-foreground">عدد النتائج: {filteredUsers.length}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* User Info Section */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16 border-2 border-primary/20">
                        <AvatarImage src={user.avatar || "/api/placeholder/user"} />
                        <AvatarFallback className="font-black bg-primary/10 text-primary text-xl">
                          {user.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black">{user.name}</h3>
                          {user.is_admin && <Badge className="bg-amber-500 hover:bg-amber-600">أدمن</Badge>}
                          {user.timeout_until && new Date(user.timeout_until) > new Date() && (
                            <Badge variant="destructive" className="animate-pulse">تايم أوت</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                      </div>
                    </div>

                    {/* Astronomical Stats Section */}
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Zap className="w-4 h-4 fill-current" />
                        <span className="text-xs font-black uppercase tracking-tighter">تعديل الأرقام الفلكية</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground mr-1">المتابعين</span>
                          <Input 
                            type="number" 
                            defaultValue={user.followers_count}
                            id={`f-${user.id}`}
                            className="h-9 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground mr-1">المنشورات</span>
                          <Input 
                            type="number" 
                            defaultValue={user.override_post_count || 0}
                            id={`p-${user.id}`}
                            className="h-9 rounded-xl text-xs font-bold"
                          />
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="w-full h-8 rounded-xl text-xs font-black"
                        onClick={() => {
                          const f = (document.getElementById(`f-${user.id}`) as HTMLInputElement).value;
                          const p = (document.getElementById(`p-${user.id}`) as HTMLInputElement).value;
                          handleUpdateStats(user.id, parseInt(f), parseInt(p));
                        }}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "تطبيق الأرقام الفلكية"}
                      </Button>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="w-full md:w-48 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-r border-border/50 pt-4 md:pt-0 md:pr-6">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black text-muted-foreground uppercase mr-1">نظام التايم أوت</span>
                       <div className="flex gap-2">
                         <Input 
                            type="number" 
                            placeholder="دقيقة"
                            value={timeoutMinutes}
                            onChange={(e) => setTimeoutMinutes(e.target.value)}
                            className="h-9 w-20 rounded-xl text-xs"
                         />
                         <Button 
                            size="sm" 
                            variant="destructive"
                            className="flex-1 h-9 rounded-xl text-xs font-black"
                            onClick={() => handleSetTimeout(user.id)}
                            disabled={actionLoading === user.id + '-timeout'}
                         >
                           {actionLoading === user.id + '-timeout' ? <Loader2 className="w-3 h-3 animate-spin"/> : "تايم أوت"}
                         </Button>
                       </div>
                       {user.timeout_until && new Date(user.timeout_until) > new Date() && (
                         <Button 
                           size="sm" 
                           variant="outline"
                           className="w-full h-9 rounded-xl text-xs font-black border-green-500/50 text-green-600 hover:bg-green-50"
                           onClick={() => handleClearTimeout(user.id)}
                         >
                           <Unlock className="w-3 h-3 ml-2" />
                           فك التايم أوت
                         </Button>
                       )}
                    </div>

                    <div className="pt-4 mt-auto">
                       <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                          <Clock className="w-3 h-3" />
                          <span>انضم في: {user.created_at}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
