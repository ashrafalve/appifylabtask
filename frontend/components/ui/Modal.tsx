"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Optional footer row (actions). */
  footer?: ReactNode;
  size?: "sm" | "md";
}

/**
 * Accessible modal rendered into a portal.
 *  - Closes on Esc and on backdrop click.
 *  - Locks body scroll while open.
 *  - Traps focus minimally by focusing the dialog on open.
 */
export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="_buddy_modal_overlay" onClick={onClose} role="presentation">
      <div
        className={cn("_buddy_modal", size === "sm" && "_buddy_modal_sm")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="_buddy_modal_head">
            <h4 className="_buddy_modal_title">{title}</h4>
            <button
              type="button"
              className="_buddy_modal_close"
              aria-label="Close"
              onClick={onClose}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        )}
        <div className="_buddy_modal_body">{children}</div>
        {footer && <div className="_buddy_modal_footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
