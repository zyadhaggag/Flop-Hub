"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAuth = false, requireAdmin = false }: AuthGuardProps) {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (requireAuth && !session) {
      router.push('/login');
      return;
    }

    // Check if user is admin (for admin routes)
    if (requireAdmin) {
      if (!session) {
        router.push('/login');
        return;
      }
      
      // Check admin status (you might need to add this to the session)
      const isAdmin = (session?.user as any)?.is_admin || false;
      if (!isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [session, router, requireAuth, requireAdmin]);

  // If all checks pass, render children
  if (requireAuth && !session) return null;
  if (requireAdmin && (!session || !(session?.user as any)?.is_admin)) return null;

  return <>{children}</>;
}
