"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const { theme } = useTheme();
  
  const sizes = {
    sm: { width: 120, height: 33 },
    md: { width: 180, height: 50 },
    lg: { width: 240, height: 67 }
  };

  return (
    <div className={className}>
      <Image
        src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
        alt="FlopHub"
        width={sizes[size].width}
        height={sizes[size].height}
        className="object-contain"
        priority
      />
    </div>
  );
}
