import { z } from "zod";

/**
 * Schema for the "create post" composer.
 * Either text or an image is required (mirrors the backend's own rule).
 */
export const createPostSchema = z
  .object({
    content: z.string(),
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
    image: z.instanceof(File).nullable().optional(),
  })
  .refine(
    (values) => values.content.trim().length > 0 || values.image,
    { message: "Write something or add a photo", path: ["content"] },
  );

export type CreatePostValues = z.infer<typeof createPostSchema>;

export const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});

export type CommentValues = z.infer<typeof commentSchema>;

export const replySchema = commentSchema;
export type ReplyValues = CommentValues;
