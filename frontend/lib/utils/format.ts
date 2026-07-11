import type { Author, User } from "@/lib/types";

/**
 * Backend base URL, read from the public env var.
 * Example: http://localhost:3001/api
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

/**
 * Origin of the backend, derived from API_BASE_URL by dropping the
 * `/api` suffix. Used to turn relative upload paths (/uploads/...)
 * into absolute URLs the browser can load.
 * Example: http://localhost:3001
 */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

/**
 * Resolve an asset URL returned by the backend into something the browser
 * can actually request.
 *
 *  - Already-absolute URLs are returned untouched.
 *  - Paths under /uploads (and any other backend path) are joined with
 *    API_ORIGIN.
 *  - Empty/null is returned as empty string (callers render a fallback).
 *
 * Design assets (logo, illustrations) live under /assets and are served by
 * the Next.js public folder, so they are never passed through here.
 */
export function resolveAssetUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return url;
}

/** Build a display name from a first/last name pair. */
export function displayName(author?: Author | User | null): string {
  if (!author) return "Unknown";
  const first = (author as Author).firstName ?? (author as User).firstName ?? "";
  const last = (author as Author).lastName ?? (author as User).lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || "Unknown";
}

/**
 * Light-weight relative time formatter ("5 minute ago", "3h", "2d").
 * Avoids a date library for a single localized-ish use case.
 */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(then).toLocaleDateString();
}
