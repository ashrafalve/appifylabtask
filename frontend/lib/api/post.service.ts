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
    const result = await api.get<{ items: Post[]; meta: unknown }>("/posts", { params: { page, limit } });
    return result.items ?? [];
  },

  async getById(id: string): Promise<Post> {
    const data = await api.get<Post>(`/posts/${id}`);
    return data;
  },

  async create(payload: CreatePostPayload): Promise<Post> {
    const form = toFormData(
      { content: payload.content, visibility: payload.visibility },
      payload.image,
    );
    const data = await api.post<Post>("/posts", form);
    return data;
  },

  async update(id: string, payload: UpdatePostPayload): Promise<Post> {
    const form = toFormData(
      { content: payload.content, visibility: payload.visibility },
      payload.image,
    );
    const data = await api.patch<Post>(`/posts/${id}`, form);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async like(id: string): Promise<LikeResult> {
    const data = await api.post<LikeResult>(`/posts/${id}/like`);
    return data;
  },

  async unlike(id: string): Promise<LikeResult> {
    const data = await api.delete<LikeResult>(`/posts/${id}/like`);
    return data;
  },
};
