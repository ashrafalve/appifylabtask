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
    const result = (await api.get("/replies", {
      params: { commentId, page, limit },
    })) as { items: Reply[]; meta: unknown };
    return result.items ?? [];
  },

  async create(payload: CreateReplyPayload): Promise<Reply> {
    return api.post("/replies", payload) as Promise<Reply>;
  },

  async update(id: string, content: string): Promise<Reply> {
    return api.patch(`/replies/${id}`, { content }) as Promise<Reply>;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/replies/${id}`);
  },

  async like(id: string): Promise<LikeResult> {
    return api.post(`/replies/${id}/like`) as Promise<LikeResult>;
  },

  async unlike(id: string): Promise<LikeResult> {
    return api.delete(`/replies/${id}/like`) as Promise<LikeResult>;
  },
};
