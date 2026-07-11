"use client";

import { cn } from "@/lib/utils/cn";

interface LoaderProps {
  /** Cover the screen with a centered spinner (used for route/guard loading). */
  fullScreen?: boolean;
  label?: string;
  className?: string;
}

/** Thin spinner. Visuals live in app/globals.css (`.buddy-spinner`). */
export function Loader({ fullScreen = false, label, className }: LoaderProps) {
  if (fullScreen) {
    return (
      <div className="_buddy_loader_screen" role="status" aria-live="polite">
        <span className="buddy-spinner buddy-spinner-lg" aria-hidden="true" />
        {label && <span className="_buddy_loader_label">{label}</span>}
      </div>
    );
  }
  return (
    <div className={cn("_buddy_loader", className)} role="status" aria-live="polite">
      <span className="buddy-spinner" aria-hidden="true" />
      {label && <span className="_buddy_loader_label">{label}</span>}
    </div>
  );
}
