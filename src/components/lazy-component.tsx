"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

interface LazyComponentProps {
  componentPath: string;
  fallback?: React.ReactNode;
}

export function LazyComponent({
  componentPath,
  fallback = <div className="animate-pulse bg-muted h-20 rounded-lg" />,
}: LazyComponentProps) {
  const DynamicComponent = dynamic(
    () => import(componentPath).then(mod => ({ default: mod.default })),
    {
      loading: () => <>{fallback}</>,
      ssr: false,
    }
  );

  return <DynamicComponent />;
}

// Pre-configured lazy components
export const LazyPostCard = dynamic(
  () => import("@/components/post-card").then(mod => ({ default: mod.PostCard })),
  {
    loading: () => <div className="animate-pulse bg-muted h-40 rounded-lg" />,
    ssr: false,
  }
);

export const LazyCreatePostModal = dynamic(
  () => import("@/components/create-post-modal").then(mod => ({ default: mod.CreatePostModal })),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyAvatarEditorModal = dynamic(
  () => import("@/components/avatar-editor-modal").then(mod => ({ default: mod.AvatarEditorModal })),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyProfileBannerSelector = dynamic(
  () => import("@/components/profile-banner-selector").then(mod => ({ default: mod.ProfileBannerSelector })),
  {
    loading: () => null,
    ssr: false,
  }
);
