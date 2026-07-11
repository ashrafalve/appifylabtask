import { api } from "@/lib/api/client";
import type { LikeResult, Reply } from "@/lib/types";

/**
 * Reply service. Replies belong to a comment.
 *
 *  POST   /replies            { commentId, content }
 *  GET    /replies?commentId=&page=&limit= -> Reply[]
 *  GET    /replies/:id
 *  PATCH  /replies/:id       { content }
 *  DELETE /replies/:id
 *  POST   /replies/:id/like   -> LikeResult
 *  DELETE /replies/:id/like   -> LikeResult
 */

export interface CreateReplyPayload {
  commentId: string;
  content: string;
}

export const replyService = {
  async list(commentId: string, page = 1, limit = 20): Promise<Reply[]> {
    const result = await api.get<{ items: Reply[]; meta: unknown }>("/replies", {
      params: { commentId, page, limit },
    });
    return result.items ?? [];
  },

  async create(payload: CreateReplyPayload): Promise<Reply> {
    const data = await api.post<Reply>("/replies", payload);
    return data;
  },

  async update(id: string, content: string): Promise<Reply> {
    const data = await api.patch<Reply>(`/replies/${id}`, { content });
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/replies/${id}`);
  },

  async like(id: string): Promise<LikeResult> {
    const data = await api.post<LikeResult>(`/replies/${id}/like`);
    return data;
  },

  async unlike(id: string): Promise<LikeResult> {
    const data = await api.delete<LikeResult>(`/replies/${id}/like`);
    return data;
  },
};
