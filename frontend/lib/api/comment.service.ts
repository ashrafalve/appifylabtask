import { api } from "@/lib/api/client";
import type { Comment, LikeResult } from "@/lib/types";

/**
 * Comment service. Comments belong to a post.
 *
 *  POST   /comments            { postId, content }
 *  GET    /comments?postId=&page=&limit= -> Comment[]
 *  GET    /comments/:id
 *  PATCH  /comments/:id       { content }
 *  DELETE /comments/:id
 *  POST   /comments/:id/like   -> LikeResult
 *  DELETE /comments/:id/like   -> LikeResult
 */

export interface CreateCommentPayload {
  postId: string;
  content: string;
}

export const commentService = {
  async list(postId: string, page = 1, limit = 20): Promise<Comment[]> {
    const result = (await api.get("/comments", {
      params: { postId, page, limit },
    })) as { items: Comment[]; meta: unknown };
    return result.items ?? [];
  },

  async create(payload: CreateCommentPayload): Promise<Comment> {
    return api.post("/comments", payload) as Promise<Comment>;
  },

  async update(id: string, content: string): Promise<Comment> {
    return api.patch(`/comments/${id}`, { content }) as Promise<Comment>;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },

  async like(id: string): Promise<LikeResult> {
    return api.post(`/comments/${id}/like`) as Promise<LikeResult>;
  },

  async unlike(id: string): Promise<LikeResult> {
    return api.delete(`/comments/${id}/like`) as Promise<LikeResult>;
  },
};
