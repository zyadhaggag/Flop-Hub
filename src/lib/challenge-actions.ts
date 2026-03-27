"use server";

import { sql } from "./db";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Fetches user stats and challenge states to compute progress
 */
export async function getUserChallengeData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { stats: { postCount: 0, totalReactions: 0, followersCount: 0, socialLinksCount: 0 }, challengeStates: [] };

  try {
    // Get user stats in parallel
    const [postsRes, reactionsRes, followersRes, userRes, challengeStates] = await Promise.all([
      sql`SELECT COUNT(*)::int as count FROM posts WHERE user_id = ${session.user.id}`,
      sql`SELECT COALESCE(SUM(p.helpful_count), 0)::int as count FROM posts p WHERE p.user_id = ${session.user.id}`,
      sql`SELECT COUNT(*)::int as count FROM followers WHERE following_id = ${session.user.id}`,
      sql`SELECT social_links FROM users WHERE id = ${session.user.id}`,
      sql`SELECT challenge_id, status, reward_claimed, accepted_at, completed_at, celebrated_at FROM user_challenges WHERE user_id = ${session.user.id}`,
    ]);

    let socialLinksCount = 0;
    try {
      const links = userRes[0]?.social_links;
      socialLinksCount = Array.isArray(links) ? links.length : (typeof links === 'string' ? JSON.parse(links).length : 0);
    } catch { socialLinksCount = 0; }

    return {
      stats: {
        postCount: postsRes[0]?.count || 0,
        totalReactions: reactionsRes[0]?.count || 0,
        followersCount: followersRes[0]?.count || 0,
        socialLinksCount,
      },
      challengeStates: challengeStates || [],
    };
  } catch (e) {
    console.error("getUserChallengeData error:", e);
    return { stats: { postCount: 0, totalReactions: 0, followersCount: 0, socialLinksCount: 0 }, challengeStates: [] };
  }
}

/**
 * Accepts a challenge. Enforces the "One Active Challenge" rule.
 */
export async function acceptChallenge(challengeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول" };

  try {
    // [ENFORCE] Check if user has any existing 'active' challenge
    const activeCount = await sql`
      SELECT COUNT(*)::int FROM user_challenges 
      WHERE user_id = ${session.user.id} AND status = 'active'
    `;

    if (activeCount[0].count > 0) {
      return { success: false, error: "لا يمكنك قبول أكثر من تحدي واحد في نفس الوقت. أكمل التحدي الحالي أولاً!" };
    }

    await sql`
      INSERT INTO user_challenges (user_id, challenge_id, status, accepted_at)
      VALUES (${session.user.id}, ${challengeId}, 'active', NOW())
      ON CONFLICT (user_id, challenge_id) 
      DO UPDATE SET status = 'active', accepted_at = NOW()
    `;
    
    revalidatePath("/challenges");
    return { success: true };
  } catch (e) {
    console.error("acceptChallenge error:", e);
    return { success: false, error: "حدث خطأ" };
  }
}

/**
 * Marks a challenge as completed and claims the reward
 */
export async function claimChallengeReward(challengeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "يجب تسجيل الدخول" };

  try {
    const existing = await sql`
      SELECT status, reward_claimed FROM user_challenges 
      WHERE user_id = ${session.user.id} AND challenge_id = ${challengeId}
    `;

    if (existing.length === 0 || existing[0].status !== 'active') {
      return { success: false, error: "التحدي غير نشط" };
    }
    if (existing[0].reward_claimed) {
      return { success: false, error: "تم تحصيل الجائزة مسبقاً" };
    }

    await sql`
      UPDATE user_challenges 
      SET status = 'completed', reward_claimed = true, completed_at = NOW()
      WHERE user_id = ${session.user.id} AND challenge_id = ${challengeId}
    `;

    // Create notification for challenge completion
    await sql`
      INSERT INTO notifications (user_id, type, data)
      VALUES (${session.user.id}, 'challenge', ${JSON.stringify({ challengeId, action: 'reward_claimed' })})
    `;

    revalidatePath("/challenges");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("claimChallengeReward error:", e);
    return { success: false, error: "حدث خطأ" };
  }
}

export async function markChallengeCelebrated(challengeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  try {
    await sql`
      UPDATE user_challenges 
      SET celebrated_at = NOW() 
      WHERE user_id = ${session.user.id} AND challenge_id = ${challengeId}
    `;
    return { success: true };
  } catch (e) {
    console.error("markChallengeCelebrated error:", e);
    return { success: false };
  }
}

export async function checkAndUpdateChallenges() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;

  try {
    const activeChallenges = await sql`
      SELECT challenge_id FROM user_challenges 
      WHERE user_id = ${session.user.id} AND status = 'active'
    `;
    
    if (activeChallenges.length === 0) return;
    
    // Potential for more logic here if we wanted auto-completion on server-side
  } catch (e) {
    console.error("checkAndUpdateChallenges error:", e);
  }
}
