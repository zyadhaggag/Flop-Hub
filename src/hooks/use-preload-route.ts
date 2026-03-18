"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function usePreloadRoute(paths: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    paths.forEach(path => {
      if (!preloadedRef.current.has(path) && path !== pathname) {
        router.prefetch(path);
        preloadedRef.current.add(path);
      }
    });
  }, [paths, pathname, router]);
}
