import { api } from "@/lib/api/client";
import type { LikeResult, Post, Visibility } from "@/lib/types";

/**
 * Post service.
 *
 *  POST   /posts                 (multipart: content, visibility, image)
 *  GET    /posts?page=&limit= -> Post[]   (newest first)
 *  GET    /posts/:id
 *  PATCH  /posts/:id              (multipart: content?, visibility?, image?)
 *  DELETE /posts/:id
 *  POST   /posts/:id/like        -> LikeResult
 *  DELETE /posts/:id/like        -> LikeResult
 */

export interface CreatePostPayload {
  content: string;
  visibility: Visibility;
  image?: File | null;
}

export interface UpdatePostPayload {
  content?: string;
  visibility?: Visibility;
  image?: File | null;
}

/**
 * Build multipart form data. We omit `Content-Type` so axios sets the
 * multipart boundary itself.
 */
function toFormData(
  fields: Record<string, string | undefined | null>,
  file?: File | null,
): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) form.append(key, value);
  }
  if (file) form.append("image", file);
  return form;
}

export const postService = {
  async list(page = 1, limit = 10): Promise<Post[]> {
    const result = (await api.get("/posts", { params: { page, limit } })) as { items: Post[]; meta: unknown };
    return result.items ?? [];
  },

  async getById(id: string): Promise<Post> {
    return api.get(`/posts/${id}`) as Promise<Post>;
  },

  async create(payload: CreatePostPayload): Promise<Post> {
    const form = toFormData(
      { content: payload.content, visibility: payload.visibility },
      payload.image,
    );
    return api.post("/posts", form) as Promise<Post>;
  },

  async update(id: string, payload: UpdatePostPayload): Promise<Post> {
    const form = toFormData(
      { content: payload.content, visibility: payload.visibility },
      payload.image,
    );
    return api.patch(`/posts/${id}`, form) as Promise<Post>;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async like(id: string): Promise<LikeResult> {
    return api.post(`/posts/${id}/like`) as Promise<LikeResult>;
  },

  async unlike(id: string): Promise<LikeResult> {
    return api.delete(`/posts/${id}/like`) as Promise<LikeResult>;
  },
};
