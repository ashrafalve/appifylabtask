"use client";

import { cn } from "@/lib/utils/cn";
import type { Visibility } from "@/lib/types";

interface VisibilitySelectorProps {
  value: Visibility;
  onChange: (value: Visibility) => void;
  className?: string;
}

/**
 * Public / Private toggle used by the post composer. Styled to match the
 * design language via `.buddy-vis` in app/globals.css.
 */
export function VisibilitySelector({ value, onChange, className }: VisibilitySelectorProps) {
  return (
    <div className={cn("_buddy_vis", className)} role="group" aria-label="Post visibility">
      <button
        type="button"
        className={cn("_buddy_vis_btn", value === "PUBLIC" && "_active")}
        aria-pressed={value === "PUBLIC"}
        onClick={() => onChange("PUBLIC")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"
          />
        </svg>
        Public
      </button>
      <button
        type="button"
        className={cn("_buddy_vis_btn", value === "PRIVATE" && "_active")}
        aria-pressed={value === "PRIVATE"}
        onClick={() => onChange("PRIVATE")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Private
      </button>
    </div>
  );
}
