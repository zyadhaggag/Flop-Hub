"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string;
  className?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  fallback = "/placeholder.jpg", 
  className,
  ...props 
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <Image
        src={hasError ? fallback : src}
        alt={alt}
        {...props}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
}
