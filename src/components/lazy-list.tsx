"use client";

import { ReactNode, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface LazyListProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export function LazyList({ 
  children, 
  className, 
  threshold = 0.1,
  rootMargin = "50px"
}: LazyListProps) {
  const { ref, isVisible } = useIntersectionObserver({ 
    threshold, 
    rootMargin,
    freezeOnceVisible: true 
  });

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (
        <div className="animate-pulse">
          <div className="h-40 bg-muted rounded-lg mb-4" />
          <div className="h-40 bg-muted rounded-lg mb-4" />
          <div className="h-40 bg-muted rounded-lg" />
        </div>
      )}
    </div>
  );
}
