import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LikesService } from '../likes/likes.service';
import {
  PaginationDto,
  resolvePagination,
  buildPaginationMeta,
} from '../common/dto/pagination.dto';
import { CreateReplyDto, UpdateReplyDto } from './dto/reply.dto';

/**
 * RepliesService. Replies belong to a Comment, which belongs to a Post. Reading
 * a reply enforces the grand-parent post's visibility. Like state is batched.
 */
@Injectable()
export class RepliesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly likes: LikesService,
  ) {}

  async create(authorId: string, commentId: string, dto: CreateReplyDto) {
    await this.assertParentVisible(commentId, authorId);
    const reply = await this.prisma.reply.create({
      data: { commentId, authorId, content: dto.content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return this.mapReply(reply, authorId, false);
  }

  async findAll(commentId: string, viewerId: string, query: PaginationDto) {
    await this.assertParentVisible(commentId, viewerId);
    const p = resolvePagination(query);
    const where: Prisma.ReplyWhereInput = { commentId };

    const [total, replies] = await this.prisma.$transaction([
      this.prisma.reply.count({ where }),
      this.prisma.reply.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: p.skip,
        take: p.take,
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    const likedIds = await this.likes.getReplyLikeStatus(
      viewerId,
      replies.map((r) => r.id),
    );
    const items = replies.map((r) => this.mapReply(r, viewerId, likedIds.has(r.id)));
    return { items, meta: buildPaginationMeta(p, total) };
  }

  async findOne(replyId: string, viewerId: string) {
    const reply = await this.prisma.reply.findUnique({
      where: { id: replyId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }
    await this.assertParentVisible(reply.commentId, viewerId);
    const liked = await this.likes.getReplyLikeStatus(viewerId, [reply.id]);
    return this.mapReply(reply, viewerId, liked.has(reply.id));
  }

  async update(authorId: string, id: string, dto: UpdateReplyDto) {
    await this.getOwnedReply(id, authorId);
    return this.prisma.reply.update({
      where: { id },
      data: { content: dto.content },
    });
  }

  async remove(authorId: string, id: string) {
    await this.getOwnedReply(id, authorId);
    await this.prisma.reply.delete({ where: { id } });
    return { id };
  }

  async like(authorId: string, replyId: string) {
    const reply = await this.prisma.reply.findUnique({
      where: { id: replyId },
      select: { id: true },
    });
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }
    return this.likes.likeReply(authorId, replyId);
  }

  async unlike(authorId: string, replyId: string) {
    const reply = await this.prisma.reply.findUnique({
      where: { id: replyId },
      select: { id: true },
    });
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }
    return this.likes.unlikeReply(authorId, replyId);
  }

  private async getOwnedReply(id: string, authorId: string) {
    const reply = await this.prisma.reply.findUnique({ where: { id } });
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }
    if (reply.authorId !== authorId) {
      throw new ForbiddenException('You can only modify your own replies');
    }
    return reply;
  }

  private async assertParentVisible(commentId: string, viewerId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        post: { select: { authorId: true, visibility: true } },
      },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (
      comment.post.visibility === Visibility.PRIVATE &&
      comment.post.authorId !== viewerId
    ) {
      throw new NotFoundException('Comment not found');
    }
  }

  private mapReply(
    reply: {
      id: string;
      commentId: string;
      authorId: string;
      content: string;
      createdAt: Date;
      author: { id: string; firstName: string; lastName: string } | null;
    },
    _viewerId: string,
    likedByMe: boolean,
  ) {
    return {
      id: reply.id,
      commentId: reply.commentId,
      authorId: reply.authorId,
      content: reply.content,
      createdAt: reply.createdAt,
      author: reply.author,
      likedByMe,
    };
  }
}
