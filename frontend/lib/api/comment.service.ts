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
    const result = await api.get<{ items: Comment[]; meta: unknown }>("/comments", {
      params: { postId, page, limit },
    }) as unknown;
    console.log("[commentService.list] API result:", result);
    // Handle case where API returns null or the data structure is different
    if (!result) return [];
    if (Array.isArray(result)) return result as Comment[];
    if (result && typeof result === 'object' && 'items' in result) {
      return (result as { items: Comment[] }).items;
    }
    return [];
  },

  async create(payload: CreateCommentPayload): Promise<Comment> {
    const data = await api.post<Comment>("/comments", payload) as unknown as Comment;
    return data;
  },

  async update(id: string, content: string): Promise<Comment> {
    const data = await api.patch<Comment>(`/comments/${id}`, { content }) as unknown as Comment;
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },

  async like(id: string): Promise<LikeResult> {
    const data = await api.post<LikeResult>(`/comments/${id}/like`) as unknown as LikeResult;
    return data;
  },

  async unlike(id: string): Promise<LikeResult> {
    const data = await api.delete<LikeResult>(`/comments/${id}/like`) as unknown as LikeResult;
    return data;
  },
};
