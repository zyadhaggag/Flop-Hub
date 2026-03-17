"use server";

import { sql } from "@/lib/db";
import { postSchema, PostInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Helper to avoid top-level revalidatePath bundle leak
const revalidateHome = async () => {
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
  } catch (e) {
    console.error("Revalidation error:", e);
  }
};

export async function createPost(input: PostInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول للنشر" };

  try {
    const validated = postSchema.parse(input);
    const imageUrl = validated.imageUrl && validated.imageUrl.trim() !== "" ? validated.imageUrl : null;
    
    const result = await sql`
      INSERT INTO posts (user_id, title, story, lesson, image_url)
      VALUES (${session.user.id}, ${validated.title}, ${validated.story}, ${validated.lesson}, ${imageUrl})
      RETURNING id
    `;

    await revalidateHome();
    return { success: true, postId: result[0].id };
  } catch (error: any) {
    console.error("CreatePost Error:", error);
    if (error.name === "ZodError") {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "حدث خطأ أثناء حفظ القصة." };
  }
}

export async function editPost(postId: string, input: PostInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول" };

  try {
    const validated = postSchema.parse(input);
    const imageUrl = validated.imageUrl && validated.imageUrl.trim() !== "" ? validated.imageUrl : null;

    const result = await sql`
      UPDATE posts 
      SET title = ${validated.title}, story = ${validated.story}, lesson = ${validated.lesson}, image_url = ${imageUrl}
      WHERE id = ${postId} AND user_id = ${session.user.id}
      RETURNING id
    `;

    if (result.length === 0) return { success: false, error: "لا تملك صلاحية التعديل" };

    await revalidateHome();
    return { success: true };
  } catch (error: any) {
    console.error("EditPost Error:", error);
    return { success: false, error: "حدث خطأ أثناء التعديل" };
  }
}

export async function getPosts(sort: 'latest' | 'trending' = 'latest') {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  try {
    const posts = await sql`
      SELECT 
        p.*, 
        u.username, 
        u.image_url as avatar_url,
        (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id) as helpful_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
        ${currentUserId ? sql`EXISTS(SELECT 1 FROM reactions WHERE post_id = p.id AND user_id = ${currentUserId})` : false} as has_reacted,
        ${currentUserId ? sql`EXISTS(SELECT 1 FROM saves WHERE post_id = p.id AND user_id = ${currentUserId})` : false} as is_saved
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY ${sort === 'trending' ? sql`helpful_count DESC, p.created_at DESC` : sql`p.created_at DESC`}
      LIMIT 20
    `;
    return posts;
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

export async function toggleHelpful(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول" };
  const userId = session.user.id;

  try {
    const existing = await sql`
      SELECT id FROM reactions WHERE post_id = ${postId} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      await sql`DELETE FROM reactions WHERE id = ${existing[0].id}`;
    } else {
      await sql`
        INSERT INTO reactions (post_id, user_id)
        VALUES (${postId}, ${userId})
      `;
      
      // Notify post owner
      const postOwner = await sql`SELECT user_id FROM posts WHERE id = ${postId}`;
      if (postOwner[0].user_id !== userId) {
        await createNotification(postOwner[0].user_id, 'helpful', { postId, fromUser: session.user.name });
      }
    }

    await revalidateHome();
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}


export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول" };

  try {
    const result = await sql`
      DELETE FROM posts 
      WHERE id = ${postId} AND user_id = ${session.user.id}
      RETURNING id
    `;
    
    if (result.length === 0) return { success: false, error: "لا تملك صلاحية الحذف" };

    await revalidateHome();
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطأ أثناء الحذف" };
  }
}

export async function getSuggestedUsers() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  try {
    return await sql`
      SELECT id, username, name, image_url as avatar_url,
      (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as post_count,
      ${currentUserId ? sql`EXISTS(SELECT 1 FROM followers WHERE follower_id = ${currentUserId} AND following_id = users.id)` : false} as is_followed
      FROM users
      ${currentUserId ? sql`WHERE id != ${currentUserId}` : sql``}
      ORDER BY post_count DESC
      LIMIT 5
    `;
  } catch (e) { return []; }
}

export async function getTrendingLessons() {
  try {
    return await sql`
      SELECT id, title, lesson, 
      (SELECT COUNT(*) FROM reactions r WHERE r.post_id = posts.id) as helpful_count
      FROM posts
      ORDER BY helpful_count DESC, created_at DESC
      LIMIT 6
    `;
  } catch (e) { return []; }
}

export async function toggleSave(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول" };
  const userId = session.user.id;

  try {
    const existing = await sql`SELECT id FROM saves WHERE post_id = ${postId} AND user_id = ${userId}`;
    if (existing.length > 0) {
      await sql`DELETE FROM saves WHERE id = ${existing[0].id}`;
      return { success: true, saved: false };
    } else {
      await sql`INSERT INTO saves (post_id, user_id) VALUES (${postId}, ${userId})`;
      return { success: true, saved: true };
    }
  } catch (e) { return { success: false }; }
}

export async function getSavedPosts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  
  try {
    return await sql`
      SELECT p.*, u.username, u.image_url as avatar_url,
      (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id) as helpful_count,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
      TRUE as is_saved
      FROM saves s
      JOIN posts p ON s.post_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE s.user_id = ${session.user.id}
      ORDER BY s.created_at DESC
    `;
  } catch (e) { return []; }
}

export async function searchPosts(query: string) {
  try {
    const search = `%${query}%`;
    
    const posts = await sql`
      SELECT p.*, u.username, u.image_url as avatar_url,
      (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id) as helpful_count,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.title ILIKE ${search} OR p.story ILIKE ${search} OR p.lesson ILIKE ${search}
      ORDER BY p.created_at DESC
      LIMIT 10
    `;

    const users = await sql`
      SELECT id, username, name, image_url as avatar_url, bio,
      (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as post_count
      FROM users
      WHERE username ILIKE ${search} OR name ILIKE ${search}
      LIMIT 10
    `;

    return { posts, users };
  } catch (e) { 
    console.error("Search Error:", e);
    return { posts: [], users: [] }; 
  }
}

export async function getPostById(id: string) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  try {
    const posts = await sql`
      SELECT p.*, u.username, u.image_url as avatar_url,
      (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id) as helpful_count,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
      ${currentUserId ? sql`EXISTS(SELECT 1 FROM reactions WHERE post_id = p.id AND user_id = ${currentUserId})` : false} as has_reacted,
      ${currentUserId ? sql`EXISTS(SELECT 1 FROM saves WHERE post_id = p.id AND user_id = ${currentUserId})` : false} as is_saved
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ${id}
    `;
    return posts[0] || null;
  } catch (e) { return null; }
}

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  
  try {
    return await sql`
      SELECT * FROM notifications 
      WHERE user_id = ${session.user.id} 
      ORDER BY created_at DESC 
      LIMIT 20
    `;
  } catch (e) { return []; }
}

async function createNotification(userId: string, type: string, data: any) {
  try {
    await sql`
      INSERT INTO notifications (user_id, type, data)
      VALUES (${userId}, ${type}, ${JSON.stringify(data)})
    `;
  } catch (e) { console.error("Notification Error:", e); }
}

export async function register(formData: any) {
  const { email, password, name, username } = formData;
  
  try {
    await sql`
      INSERT INTO users (email, password, name, username, image_url)
      VALUES (${email}, ${password}, ${name}, ${username}, NULL)
    `;
    return { success: true };
  } catch (error: any) {
    console.error("Signup Database Error:", error);
    const errorMsg = error.message?.toLowerCase() || "";
    if (errorMsg.includes("unique") || errorMsg.includes("already exists")) {
       if (errorMsg.includes("email")) return { success: false, error: "البريد الإلكتروني مستخدم بالفعل" };
       if (errorMsg.includes("username")) return { success: false, error: "اسم المستخدم مأخوذ بالفعل" };
       return { success: false, error: "البيانات المدخلة موجودة مسبقاً" };
    }
    return { success: false, error: "حدث خطأ غير متوقع أثناء إنشاء الحساب" };
  }
}

export async function updateProfile(data: { name?: string, bio?: string, image_url?: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول" };

  try {
    // Get current data to merge or use build dynamic query if possible
    // For simplicity, we'll fetch current if fields missing or just update what's sent
    const current = await sql`SELECT name, bio, image_url FROM users WHERE id = ${session.user.id}`;
    if (current.length === 0) return { success: false, error: "المستخدم غير موجود" };

    const name = data.name !== undefined ? data.name : current[0].name;
    const bio = data.bio !== undefined ? data.bio : current[0].bio;
    const image_url = data.image_url !== undefined ? data.image_url : current[0].image_url;

    await sql`
      UPDATE users 
      SET name = ${name}, bio = ${bio}, image_url = ${image_url}
      WHERE id = ${session.user.id}
    `;
    
    revalidatePath(`/u/${session.user.username}`);
    return { success: true };
  } catch (error: any) {
    console.error("UpdateProfile Error:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث الملف الشخصي" };
  }
}

export async function updateUsername(username: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول" };

  username = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (username.length < 3) return { success: false, error: "اسم المستخدم قصير جداً" };

  try {
    const existing = await sql`SELECT id FROM users WHERE username = ${username} AND id != ${session.user.id}`;
    if (existing.length > 0) return { success: false, error: "اسم المستخدم مأخوذ بالفعل" };

    await sql`
      UPDATE users 
      SET username = ${username}
      WHERE id = ${session.user.id}
    `;
    
    revalidatePath(`/u/${username}`);
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    console.error("UpdateUsername Error:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث اسم المستخدم" };
  }
}

export async function clearAvatar() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول" };

  try {
    await sql`
      UPDATE users 
      SET image_url = NULL
      WHERE id = ${session.user.id}
    `;
    
    revalidatePath(`/u/${session.user.username}`);
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    console.error("ClearAvatar Error:", error);
    return { success: false, error: "حدث خطأ" };
  }
}

export async function addComment(postId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول للتعليق" };

  try {
    await sql`
      INSERT INTO comments (post_id, user_id, text)
      VALUES (${postId}, ${session.user.id}, ${content})
    `;
    
    // Notify post owner
    const postOwner = await sql`SELECT user_id FROM posts WHERE id = ${postId}`;
    if (postOwner[0].user_id !== session.user.id) {
      await createNotification(postOwner[0].user_id, 'comment', { postId, fromUser: session.user.name });
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("AddComment Error:", error);
    return { success: false, error: "حدث خطأ" };
  }
}

export async function getComments(postId: string) {
  try {
    return await sql`
      SELECT c.id, c.text as content, c.created_at, u.username, u.name, u.image_url as avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at ASC
    `;
  } catch (error) {
    console.error("GetComments Error:", error);
    return [];
  }
}

export async function toggleFollow(followingId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول" };
  if (session.user.id === followingId) return { success: false, error: "لا يمكنك متابعة نفسك" };

  try {
    const existing = await sql`
      SELECT id FROM followers 
      WHERE follower_id = ${session.user.id} AND following_id = ${followingId}
    `;

    if (existing.length > 0) {
      await sql`DELETE FROM followers WHERE id = ${existing[0].id}`;
      return { success: true, followed: false };
    } else {
      await sql`
        INSERT INTO followers (follower_id, following_id)
        VALUES (${session.user.id}, ${followingId})
      `;
      // Notify
      await createNotification(followingId, 'follow', { fromUser: session.user.name });
      return { success: true, followed: true };
    }
  } catch (error) {
    console.error("ToggleFollow Error:", error);
    return { success: false, error: "حدث خطأ" };
  }
}

export async function markAllNotificationsRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };
  
  try {
    await sql`
      UPDATE notifications 
      SET read = TRUE 
      WHERE user_id = ${session.user.id}
    `;
    revalidatePath('/');
    return { success: true };
  } catch (e) { return { success: false }; }
}

export async function markNotificationAsRead(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };
  
  try {
    await sql`
      UPDATE notifications 
      SET read = TRUE 
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;
    return { success: true };
  } catch (e) { return { success: false }; }
}
