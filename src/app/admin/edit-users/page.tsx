"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Calendar,
  Search,
  Edit,
  Save,
  X,
  Shield,
  Ban,
  Check,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  is_admin: boolean;
  created_at: string;
  is_banned: boolean;
}

export default function AdminEditUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load users data
    const mockUsers: User[] = [
      {
        id: "1",
        name: "أحمد محمد",
        username: "ahmed_mohammed",
        email: "ahmed@example.com",
        bio: "مطور ومحب للتقنية، أشارك قصصي وخبراتي هنا.",
        avatar: "/api/placeholder/user1",
        is_admin: false,
        created_at: "2024-01-15",
        is_banned: false
      },
      {
        id: "2",
        name: "فاطمة علي",
        username: "fatima_ali",
        email: "fatima@example.com",
        bio: "مصممة ومبدعة، أحب مشاركة الأفكار الإبداعية.",
        avatar: "/api/placeholder/user2",
        is_admin: false,
        created_at: "2024-02-20",
        is_banned: false
      },
      {
        id: "3",
        name: "محمد سعيد",
        username: "mohammed_saeed",
        email: "mohammed@example.com",
        bio: "كاتب ومحتوى رقمي، مهتم بالتقنية والابتكار.",
        avatar: "/api/placeholder/user3",
        is_admin: false,
        created_at: "2024-03-10",
        is_banned: true
      }
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      toast.success("تم تحديث بيانات المستخدم بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث المستخدم");
    } finally {
      setSaving(false);
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_banned: isBanned } : u
      ));
      
      toast.success(isBanned ? "تم حظر المستخدم بنجاح" : "تم فك حظر المستخدم بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة المستخدم");
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              العودة للوحة التحكم
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-xl font-black">تعديل المستخدمين</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar || "/api/placeholder/user"} />
                    <AvatarFallback className="font-black bg-primary text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black">{user.name}</h3>
                      {user.is_admin && (
                        <Badge className="bg-yellow-500 text-white text-xs">
                          <Shield className="w-3 h-3 ml-1" />
                          أدمن
                        </Badge>
                      )}
                      {user.is_banned && (
                        <Badge className="bg-red-500 text-white text-xs">
                          <Ban className="w-3 h-3 ml-1" />
                          محظور
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingUser?.id === user.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">الاسم الكامل</label>
                      <Input
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">البريد الإلكتروني</label>
                      <Input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">البايو</label>
                      <Textarea
                        value={editingUser.bio}
                        onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                        className="min-h-[80px] rounded-xl resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveUser}
                        disabled={saving}
                        className="flex-1 h-10 rounded-xl gap-2"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            حفظ
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex-1 h-10 rounded-xl gap-2"
                      >
                        <X className="w-4 h-4" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest">البريد الإلكتروني</h4>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest">البايو</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest">تاريخ الإنشاء</h4>
                      <p className="text-sm text-muted-foreground">{user.created_at}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditUser(user)}
                        className="flex-1 h-10 rounded-xl gap-2"
                        variant="outline"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل
                      </Button>
                      <Button
                        onClick={() => handleBanUser(user.id, !user.is_banned)}
                        className={`flex-1 h-10 rounded-xl gap-2 ${
                          user.is_banned 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        {user.is_banned ? (
                          <>
                            <Check className="w-4 h-4" />
                            فك الحظر
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4" />
                            حظر
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
