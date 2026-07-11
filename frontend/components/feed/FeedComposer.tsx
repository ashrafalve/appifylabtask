"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, type CreatePostValues } from "@/lib/schemas/post.schema";
import type { Visibility } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { VisibilitySelector } from "@/components/feed/VisibilitySelector";
import { ImageUploader } from "@/components/feed/ImageUploader";
import { cn } from "@/lib/utils/cn";

interface FeedComposerProps {
  onSubmit: (content: string, visibility: Visibility, image: File | null) => Promise<void>;
}

/**
 * "Create Post" composer. Mirrors the design's
 * `_feed_inner_text_area` block: avatar + textarea + attachment button +
 * visibility toggle + Post button. React Hook Form + Zod validate that
 * at least text or an image is provided.
 */
export function FeedComposer({ onSubmit }: FeedComposerProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: "", visibility: "PUBLIC", image: null },
  });

  const visibility = watch("visibility");
  const image = watch("image");

  const [submittingError, setSubmittingError] = useState<string | null>(null);

  const submit = handleSubmit(async (values) => {
    setSubmittingError(null);
    try {
      await onSubmit(values.content.trim(), values.visibility, values.image ?? null);
      reset({ content: "", visibility: "PUBLIC", image: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create post";
      setSubmittingError(message);
    }
  });

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <form onSubmit={submit} noValidate>
        <div className="_feed_inner_text_area_box">
          <div className="_feed_inner_text_area_box_image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/txt_img.png" alt="" className="_txt_img" />
          </div>
          <div className="form-floating _feed_inner_text_area_box_form">
            <textarea
              className={cn("form-control _textarea", errors.content && "_textarea_error")}
              placeholder="Leave a comment here"
              id="composerTextarea"
              rows={2}
              {...register("content")}
            />
            <label className="_feed_textarea_label" htmlFor="composerTextarea">
              Write something ...
              <svg width="23" height="24" viewBox="0 0 23 24" fill="none" aria-hidden="true">
                <path
                  fill="#666"
                  d="M19.504 19.209c.332 0 .601.289.601.646 0 .326-.226.596-.52.64l-.081.005h-6.276c-.332 0-.602-.289-.602-.645 0-.327.227-.597.52-.64l.082-.006h6.276zM13.4 4.417c1.139-1.223 2.986-1.223 4.125 0l1.182 1.268c1.14 1.223 1.14 3.205 0 4.427L9.82 19.649a2.619 2.619 0 0 1-1.916.85h-3.64c-.337 0-.61-.298-.6-.66l.09-3.941a3.019 3.019 0 0 1 .794-1.982l8.852-9.5zm-.688 2.562l-7.313 7.85a1.68 1.68 0 0 0-.441 1.101l-.077 3.278h3.023c.356 0 .698-.133.968-.376l.098-.096 7.35-7.887-3.608-3.87zm3.962-1.65a1.633 1.633 0 0 0-2.423 0l-.688.737 3.606 3.87.688-.737c.631-.678.666-1.755.105-2.477l-.105-.124-1.183-1.268z"
                />
              </svg>
            </label>
          </div>
        </div>

        {errors.content && (
          <span className="_field_error _composer_error">{errors.content.message}</span>
        )}

        <ImageUploader value={image ?? null} onChange={(file) => setValue("image", file, { shouldValidate: true })} />

        <div className="_feed_inner_text_area_bottom">
          <div className="_feed_inner_text_area_item">
            <VisibilitySelector
              value={visibility}
              onChange={(v) => setValue("visibility", v, { shouldValidate: true })}
            />
            <div className="_feed_inner_text_area_btn">
              <Button
                type="submit"
                className="_feed_inner_text_area_btn_link"
                loading={isSubmitting}
              >
                <svg className="_mar_img" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
                  <path
                    fill="#fff"
                    fillRule="evenodd"
                    d="M6.37 7.879l2.438 3.955a.335.335 0 0 0 .34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 0 0-.09-.35.341.341 0 0 0-.34-.088L1.75 4.03a.34.34 0 0 0-.247.289.343.343 0 0 0 .16.347L5.666 7.17 9.2 3.597a.5.5 0 0 1 .712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 0 1-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 0 1 1.67 1.682l-3.05 10.296A1.332 1.332 0 0 1 9.098 13z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Post</span>
              </Button>
            </div>
          </div>
        </div>
        {submittingError && (
          <span className="_field_error _composer_error" role="alert">{submittingError}</span>
        )}
      </form>
    </div>
  );
}
