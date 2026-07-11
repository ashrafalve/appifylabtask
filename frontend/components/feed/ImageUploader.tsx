"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ImageUploaderProps {
  /** The selected file (or null). Controlled by the composer. */
  value: File | null;
  onChange: (file: File | null) => void;
  className?: string;
}

/**
 * Image picker with a live preview + remove button.
 * The actual `<input type="file">` is hidden and triggered by the
 * styled "Photo" button so the markup matches the design's composer row.
 */
export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Build/revoke an object URL whenever the selected file changes.
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className={cn("_buddy_uploader", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="_buddy_uploader_input"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onChange(file);
          // Reset so selecting the same file again re-triggers change.
          e.target.value = "";
        }}
      />

      {preview ? (
        <div className="_buddy_uploader_preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selected attachment preview" className="_buddy_uploader_img" />
          <button
            type="button"
            className="_buddy_uploader_remove"
            aria-label="Remove image"
            onClick={() => onChange(null)}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="_feed_inner_text_area_bottom_photo_link"
          onClick={() => inputRef.current?.click()}
        >
          <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                fill="#666"
                d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 0 1-.016 1.063.642.642 0 0 1-.894.058l-.076-.074-1.9-2.148a.806.806 0 0 0-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 0 0-.793-.07l-.075.073-1.4 1.617a.645.645 0 0 1-.97.029.805.805 0 0 1-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 0 0 .861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z"
              />
            </svg>
          </span>
          Photo
        </button>
      )}
    </div>
  );
}
