import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * LikesService
 * Single source of truth for likes across posts, comments and replies.
 * Each entity has its own like table with a (entityId, userId) unique
 * constraint, which makes duplicate likes impossible at the DB level and turns
 * "like" into an idempotent upsert.
 *
 * Also exposes batched "status" lookups so feed/list endpoints can tell whether
 * the current viewer already liked each item in ONE query (no N+1).
 */
@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Posts ----

  async likePost(userId: string, postId: string) {
    await this.prisma.postLike.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId },
      update: {},
    });
    const count = await this.prisma.postLike.count({ where: { postId } });
    return { liked: true, likeCount: count };
  }

  async unlikePost(userId: string, postId: string) {
    await this.prisma.postLike.deleteMany({ where: { postId, userId } });
    const count = await this.prisma.postLike.count({ where: { postId } });
    return { liked: false, likeCount: count };
  }

  async getPostLikeStatus(userId: string, postIds: string[]): Promise<Set<string>> {
    if (postIds.length === 0) {
      return new Set();
    }
    const rows = await this.prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    });
    return new Set(rows.map((r) => r.postId));
  }

  // ---- Comments ----

  async likeComment(userId: string, commentId: string) {
    await this.prisma.commentLike.upsert({
      where: { commentId_userId: { commentId, userId } },
      create: { commentId, userId },
      update: {},
    });
    const count = await this.prisma.commentLike.count({ where: { commentId } });
    return { liked: true, likeCount: count };
  }

  async unlikeComment(userId: string, commentId: string) {
    await this.prisma.commentLike.deleteMany({ where: { commentId, userId } });
    const count = await this.prisma.commentLike.count({ where: { commentId } });
    return { liked: false, likeCount: count };
  }

  async getCommentLikeStatus(userId: string, commentIds: string[]): Promise<Set<string>> {
    if (commentIds.length === 0) {
      return new Set();
    }
    const rows = await this.prisma.commentLike.findMany({
      where: { userId, commentId: { in: commentIds } },
      select: { commentId: true },
    });
    return new Set(rows.map((r) => r.commentId));
  }

  // ---- Replies ----

  async likeReply(userId: string, replyId: string) {
    await this.prisma.replyLike.upsert({
      where: { replyId_userId: { replyId, userId } },
      create: { replyId, userId },
      update: {},
    });
    const count = await this.prisma.replyLike.count({ where: { replyId } });
    return { liked: true, likeCount: count };
  }

  async unlikeReply(userId: string, replyId: string) {
    await this.prisma.replyLike.deleteMany({ where: { replyId, userId } });
    const count = await this.prisma.replyLike.count({ where: { replyId } });
    return { liked: false, likeCount: count };
  }

  async getReplyLikeStatus(userId: string, replyIds: string[]): Promise<Set<string>> {
    if (replyIds.length === 0) {
      return new Set();
    }
    const rows = await this.prisma.replyLike.findMany({
      where: { userId, replyId: { in: replyIds } },
      select: { replyId: true },
    });
    return new Set(rows.map((r) => r.replyId));
  }
}
