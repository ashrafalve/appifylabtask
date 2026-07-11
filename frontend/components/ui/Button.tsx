"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Show a spinner and disable interaction. */
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

function Spinner() {
  return (
    <svg
      className="buddy-spinner"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Generic button. Styling is delegated to the caller via `className`
 * (the design uses bespoke class combinations per screen), so this stays
 * a thin, reusable shell with built-in loading + disabled handling.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { loading = false, fullWidth = false, className, children, disabled, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      // Default to type="button" so it never submits a form by accident.
      type={type ?? "button"}
      className={cn(className, fullWidth && "_btn_full")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});
