import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LikesService } from '../likes/likes.service';
import {
  PaginationDto,
  resolvePagination,
  buildPaginationMeta,
} from '../common/dto/pagination.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

/**
 * CommentsService. Comments belong to a Post. Listing/reading respects the
 * parent post's visibility (private posts hide their comments from others).
 * Like state is batched in a single query to avoid N+1 on feeds.
 */
@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly likes: LikesService,
  ) {}

  async create(authorId: string, postId: string, dto: CreateCommentDto) {
    await this.assertPostVisible(postId, authorId);
    const comment = await this.prisma.comment.create({
      data: { postId, authorId, content: dto.content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { replies: true, likes: true } },
      },
    });
    return this.mapComment(comment, authorId, false);
  }

  async findAll(postId: string, viewerId: string, query: PaginationDto) {
    await this.assertPostVisible(postId, viewerId);
    const p = resolvePagination(query);
    const where: Prisma.CommentWhereInput = { postId };

    const [total, comments] = await this.prisma.$transaction([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: p.skip,
        take: p.take,
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { replies: true, likes: true } },
        },
      }),
    ]);

    const likedIds = await this.likes.getCommentLikeStatus(
      viewerId,
      comments.map((c) => c.id),
    );
    const items = comments.map((c) => this.mapComment(c, viewerId, likedIds.has(c.id)));
    return { items, meta: buildPaginationMeta(p, total) };
  }

  async findOne(commentId: string, viewerId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { replies: true, likes: true } },
      },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.assertPostVisible(comment.postId, viewerId);
    const liked = await this.likes.getCommentLikeStatus(viewerId, [comment.id]);
    return this.mapComment(comment, viewerId, liked.has(comment.id));
  }

  async update(authorId: string, id: string, dto: UpdateCommentDto) {
    await this.getOwnedComment(id, authorId);
    return this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
    });
  }

  async remove(authorId: string, id: string) {
    await this.getOwnedComment(id, authorId);
    await this.prisma.comment.delete({ where: { id } });
    return { id };
  }

  async like(authorId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return this.likes.likeComment(authorId, commentId);
  }

  async unlike(authorId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return this.likes.unlikeComment(authorId, commentId);
  }

  private async getOwnedComment(id: string, authorId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only modify your own comments');
    }
    return comment;
  }

  private async assertPostVisible(postId: string, viewerId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, visibility: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.visibility === Visibility.PRIVATE && post.authorId !== viewerId) {
      throw new NotFoundException('Post not found');
    }
  }

  private mapComment(
    comment: {
      id: string;
      postId: string;
      authorId: string;
      content: string;
      createdAt: Date;
      author: { id: string; firstName: string; lastName: string } | null;
      _count?: { replies: number; likes: number };
    },
    _viewerId: string,
    likedByMe: boolean,
  ) {
    return {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.author,
      likeCount: comment._count?.likes ?? 0,
      replyCount: comment._count?.replies ?? 0,
      likedByMe,
    };
  }
}
