"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRouteProtection() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // List of protected routes
    const protectedRoutes = [
      '/admin',
      '/settings',
      '/account-settings',
      '/saved',
      '/notifications'
    ];

    const currentPath = window.location.pathname;
    
    // Check if current route is protected and user is not authenticated
    if (protectedRoutes.some(route => currentPath.includes(route)) && !session) {
      // Store the attempted route for redirect after login
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      router.push('/login');
      return;
    }

    // Check if admin route and user is not admin
    if (currentPath.includes('/admin') && session) {
      const isAdmin = (session?.user as any)?.is_admin || false;
      if (!isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [session, router]);
}

// Simple encryption utility for client-side
export function simpleEncrypt(text: string): string {
  return btoa(text).split('').reverse().join('');
}

export function simpleDecrypt(encryptedText: string): string {
  try {
    return atob(encryptedText.split('').reverse().join(''));
  } catch {
    return '';
  }
}
