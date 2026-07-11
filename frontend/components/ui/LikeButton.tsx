"use client";

import { cn } from "@/lib/utils/cn";

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
  /** "sm" for compact comment/reply rows. */
  size?: "sm" | "md";
  /** Visible text label, e.g. "Like". */
  label?: string;
  /** Show the numeric count next to the icon. */
  showCount?: boolean;
  icon?: "heart" | "thumbs";
  className?: string;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ThumbsIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

/**
 * Reusable like/unlike control (posts, comments, replies).
 * Optimistic toggling is handled by the parent data hooks; this only
 * reflects + reports state.
 */
export function LikeButton({
  liked,
  count,
  onToggle,
  disabled,
  size = "md",
  label,
  showCount = true,
  icon = "heart",
  className,
}: LikeButtonProps) {
  const Icon = icon === "thumbs" ? ThumbsIcon : HeartIcon;
  return (
    <button
      type="button"
      className={cn(
        "_buddy_like_btn",
        size === "sm" && "_buddy_like_btn_sm",
        liked && "_active",
        className,
      )}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      disabled={disabled}
      onClick={onToggle}
    >
      <Icon filled={liked} />
      {label && <span>{label}</span>}
      {showCount && count > 0 && <span className="_buddy_like_count">{count}</span>}
    </button>
  );
}
