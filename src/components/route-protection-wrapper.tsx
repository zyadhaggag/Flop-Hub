"use client";

import { useRouteProtection } from "@/components/route-protector";

interface RouteProtectionWrapperProps {
  children: React.ReactNode;
}

export function RouteProtectionWrapper({ children }: RouteProtectionWrapperProps) {
  useRouteProtection();
  return <>{children}</>;
}
