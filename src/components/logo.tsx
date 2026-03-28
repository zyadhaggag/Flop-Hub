"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const sizes = {
    sm: { width: 120, height: 33 },
    md: { width: 180, height: 50 },
    lg: { width: 240, height: 67 }
  };

  if (!mounted) {
    return <div className={className} style={{ width: sizes[size].width, height: sizes[size].height }} />;
  }

  return (
    <div className={className}>
      <Image
        src={resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
        alt="FlopHub"
        width={sizes[size].width}
        height={sizes[size].height}
        className="object-contain"
        priority
      />
    </div>
  );
}
