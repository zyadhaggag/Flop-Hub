"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Lock, 
  Palette, 
  Bell, 
  Shield, 
  Camera, 
  Upload,
  X,
  Check,
  Settings,
  LogOut,
  AlertTriangle,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogoutModal } from "@/components/logout-modal";
import { ImageUploadModal } from "@/components/image-upload-modal";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    avatar: "",
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: "light",
    notifications: true,
    language: "ar",
    privacy: "public",
  });

  // Banner state
  const [banner, setBanner] = useState({
    current: "",
    preset: "preset-1",
  });

  const banners = [
    { id: "preset-1", name: "أزرق بنفسجي", preview: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)" },
    { id: "preset-2", name: "أزرق سماوي", preview: "linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)" },
    { id: "preset-3", name: "برتقالي أحمر", preview: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" },
    { id: "preset-4", name: "أخضر أزرق", preview: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)" },
    { id: "preset-5", name: "أسود كلاسيكي", preview: "linear-gradient(135deg, #000000 0%, #1e293b 100%)" },
    { id: "preset-6", name: "نقط أسود", preview: "radial-gradient(#ffffff 0.5px, transparent 0.5px) #000" },
    { id: "preset-7", name: "خطوط شبكة", preview: "linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px) #111827" },
    { id: "preset-8", name: "بنفسجي دائري", preview: "radial-gradient(circle at center, #7c3aed 0%, #000 100%)" },
    { id: "preset-9", name: "وردي أزرق", preview: "linear-gradient(45deg, #ff00cc, #3333ff)" },
  ];

  const categories = [
    { id: "tech", name: "التقنية", icon: "💻", color: "bg-blue-500" },
    { id: "business", name: "الأعمال", icon: "�", color: "bg-green-500" },
    { id: "life", name: "الحياة", icon: "💡", color: "bg-yellow-500" },
    { id: "education", name: "التعليم", icon: "📚", color: "bg-purple-500" },
    { id: "health", name: "الصحة", icon: "❤️", color: "bg-red-500" },
    { id: "creative", name: "الإبداع", icon: "🎨", color: "bg-pink-500" },
    { id: "sports", name: "الرياضة", icon: "⚡", color: "bg-orange-500" },
    { id: "travel", name: "السفر", icon: "🌍", color: "bg-cyan-500" },
  ];

  useEffect(() => {
    // Load user data
    const userData = {
      name: "أحمد محمد",
      username: "ahmed_mohammed",
      email: "ahmed@example.com",
      bio: "مطور ومحب للتقنية، أشارك قصصي وخبراتي هنا.",
      avatar: "/api/placeholder/user",
    };
    setProfile(userData);
    // Check if user is admin
    setIsAdminUser(true); // For demo purposes
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الملف الشخصي");
    }
    setLoading(false);
  };

  const handleSavePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("تم تغيير كلمة المرور بنجاح");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error("حدث خطأ أثناء تغيير كلمة المرور");
    }
    setLoading(false);
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("تم حفظ التفضيلات بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ التفضيلات");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleImageUpload = (editedImageUrl: string) => {
    setProfile({ ...profile, avatar: editedImageUrl });
    setShowImageUploadModal(false);
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
              العودة
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-xl font-black">إطارات الحساب</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/30 rounded-2xl border border-border/40">
            <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">الملف الشخصي</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">المظهر</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">التفضيلات</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">الأمان</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  معلومات الملف الشخصي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-4 border-background shadow-lg">
                      <AvatarImage src={profile.avatar || "/api/placeholder/user"} />
                      <AvatarFallback className="text-xl font-black bg-primary text-white">
                        {profile.name?.charAt(0) || "أ"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-primary hover:bg-primary/90"
                      onClick={() => setShowImageUploadModal(true)}
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black mb-1">صورة الملف الشخصي</h3>
                    <p className="text-sm text-muted-foreground">صورة مربعة مقاسها 400x400 بكسل على الأقل</p>
                    <Button
                      size="sm"
                      className="mt-2 rounded-xl gap-2"
                      onClick={() => setShowImageUploadModal(true)}
                    >
                      <Upload className="w-4 h-4" />
                      تطبيق الصورة
                    </Button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">الاسم الكامل</label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="أدخل اسمك الكامل"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">اسم المستخدم</label>
                    <Input
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      placeholder="@username"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="example@email.com"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">البايو / الوصف</label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="اكتب شيئاً عن نفسك..."
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-black gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-primary" />
                  تخصيص المظهر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Banner Selection */}
                <div>
                  <h3 className="text-lg font-black mb-4">خلفية الملف الشخصي</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {banners.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBanner({ ...banner, preset: b.id })}
                        className={`relative h-16 rounded-xl border-2 transition-all hover:scale-105 ${
                          banner.preset === b.id ? "border-primary shadow-lg" : "border-border"
                        }`}
                        style={{ background: b.preview }}
                      >
                        {banner.preset === b.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                          {b.name}
                        </div>
                      </button>
                    ))}
                    {/* Admin-only gold banner */}
                    {isAdminUser && (
                      <button
                        onClick={() => setBanner({ ...banner, preset: "admin-gold" })}
                        className={`relative h-16 rounded-xl border-2 transition-all hover:scale-105 ${
                          banner.preset === "admin-gold" ? "border-yellow-500 shadow-lg" : "border-border"
                        }`}
                        style={{ 
                          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF8C00 50%, #FFD700 75%, #FFA500 100%)",
                          backgroundSize: "200% 200%"
                        }}
                      >
                        {banner.preset === "admin-gold" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                          ذهبي للأدمن
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-lg font-black mb-4">الفئات المفضلة</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className="flex items-center gap-2 p-3 rounded-xl border border-border hover:bg-muted/50 transition-all"
                      >
                        <span className="text-xl">{category.icon}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-black gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      حفظ المظهر
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-primary" />
                  التفضيلات العامة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black">الإعدادات الأساسية</h3>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">الوضع الليلي</span>
                      </div>
                      <Button variant="outline" size="sm">
                        تفعيل
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">الإشعارات</span>
                      </div>
                      <Button variant="outline" size="sm">
                        تفعيل
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">البريد الإلكتروني</span>
                      </div>
                      <Button variant="outline" size="sm">
                        إدارة
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-black">الخصوصية</h3>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">الملف العام</span>
                      </div>
                      <Button variant="outline" size="sm">
                        عام
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">الحماية</span>
                      </div>
                      <Button variant="outline" size="sm">
                        إعدادات
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <LogOut className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">تسجيل الخروج</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleLogout}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        تسجيل الخروج
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-black gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      حفظ التفضيلات
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  الأمان والخصوصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change */}
                <div>
                  <h3 className="text-lg font-black mb-4">تغيير كلمة المرور</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">كلمة المرور الحالية</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                          placeholder="أدخل كلمة المرور الحالية"
                          className="h-12 rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">كلمة المرور الجديدة</label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={passwords.new}
                          onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                          placeholder="أدخل كلمة المرور الجديدة"
                          className="h-12 rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">تأكيد كلمة المرور</label>
                      <Input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Security */}
                <div>
                  <h3 className="text-lg font-black mb-4">إعدادات الأمان الإضافية</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">المصادقة الثنائية</span>
                          <p className="text-xs text-muted-foreground">إضافة طبقة أمان إضافية</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        تفعيل
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">الجلسات النشطة</span>
                          <p className="text-xs text-muted-foreground">إدارة الأجهزة المتصلة</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSavePassword}
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-black gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      تحديث كلمة المرور
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
      
      {/* Image Upload Modal */}
      <ImageUploadModal 
        isOpen={showImageUploadModal} 
        onClose={() => setShowImageUploadModal(false)} 
        onSave={handleImageUpload} 
      />
    </div>
  );
}
