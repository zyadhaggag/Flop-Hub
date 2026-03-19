"use server";

import { sql } from "./db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Update user stats with "astronomical" numbers if needed.
 * Only accessible by admins.
 */
export async function updateUserStats(userId: string, stats: { followers?: number, posts?: number }) {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.is_admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    if (stats.followers !== undefined) {
      // Note: This assumes a column 'followers_count' or handled via a separate table.
      // If statistics are computed, this might need a 'bonus_stats' table or similar.
      // For now, we'll try to update the 'users' table directly if fields exist, 
      // or we might need to mock them in the DB view.
      await sql`UPDATE users SET followers_count = ${stats.followers} WHERE id = ${userId}`;
    }
    
    if (stats.posts !== undefined) {
      // Usually post count is computed, but we can have an 'override_post_count' field 
      // or just let the admin set a high number in a dedicated column.
      await sql`UPDATE users SET override_post_count = ${stats.posts} WHERE id = ${userId}`;
    }

    revalidatePath(`/u/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("UpdateUserStats Error:", error);
    return { success: false, error: "Database error" };
  }
}

/**
 * Set a temporary timeout for a user.
 */
export async function setUserTimeout(userId: string, minutes: number) {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.is_admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const timeoutUntil = new Date(Date.now() + minutes * 60000);
    const issuedBy = session.user.name || session.user.username;

    await sql`
      UPDATE users 
      SET 
        timeout_until = ${timeoutUntil.toISOString()},
        timeout_reason = 'Admin Action',
        timeout_by = ${issuedBy}
      WHERE id = ${userId}
    `;

    revalidatePath("/admin/users");
    return { success: true, until: timeoutUntil };
  } catch (error) {
    console.error("SetUserTimeout Error:", error);
    return { success: false, error: "Database error" };
  }
}

/**
 * Fetch all users for admin management.
 */
export async function getUsersAdmin() {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.is_admin) return [];

  try {
    const users = await sql`
      SELECT id, name, username, email, bio, image_url as avatar, is_admin, created_at, 
             timeout_until, timeout_reason, timeout_by, followers_count, override_post_count
      FROM users
      ORDER BY created_at DESC
    `;
    return users.map((u: any) => ({
      ...u,
      created_at: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2024-01-01'
    }));
  } catch (error) {
    console.error("GetUsersAdmin Error:", error);
    return [];
  }
}

/**
 * Clear user timeout.
 */
export async function clearUserTimeout(userId: string) {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.is_admin) return { success: false, error: "Unauthorized" };

  try {
    await sql`UPDATE users SET timeout_until = NULL WHERE id = ${userId}`;
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
