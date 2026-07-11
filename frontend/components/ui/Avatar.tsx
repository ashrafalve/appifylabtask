"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { resolveAssetUrl } from "@/lib/utils/format";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  /** Extra classes for sizing/shape (e.g. "_post_img", "_comment_img1"). */
  className?: string;
  /** Fallback image under /assets. Defaults to the design's profile placeholder. */
  fallback?: string;
}

/**
 * Image with graceful fallback. Used for user avatars and post/comment
 * thumbnails. The backend returns upload URLs as relative paths
 * (/uploads/...), which `resolveAssetUrl` turns into absolute ones.
 */
export function Avatar({ src, alt = "", className, fallback = "/assets/images/profile.png" }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored || !src ? fallback : resolveAssetUrl(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      className={cn(className)}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
