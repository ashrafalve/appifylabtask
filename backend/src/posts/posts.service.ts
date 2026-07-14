import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LikesService } from '../likes/likes.service';
import {
  PaginationDto,
  resolvePagination,
  buildPaginationMeta,
} from '../common/dto/pagination.dto';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly likes: LikesService,
  ) {}

  async create(authorId: string, dto: CreatePostDto, imageUrl?: string | null) {
    const post = await this.prisma.post.create({
      data: {
        authorId,
        content: dto.content?.trim() ?? '',
        visibility: dto.visibility ?? Visibility.PUBLIC,
        image: imageUrl ?? null,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    return this.mapPost(post, authorId, false);
  }

  async findAll(viewerId: string, query: PaginationDto) {
    const p = resolvePagination(query);
    const where = this.visibleToViewer(viewerId);

    const [total, posts] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: p.skip,
        take: p.take,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: { select: { comments: true, likes: true } },
        },
      }),
    ]);

    const likedIds = await this.likes.getPostLikeStatus(
      viewerId,
      posts.map((post) => post.id),
    );
    const items = posts.map((post) =>
      this.mapPost(post, viewerId, likedIds.has(post.id)),
    );

    return { items, meta: buildPaginationMeta(p, total) };
  }

  async findOne(viewerId: string, id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    this.assertVisible(post, viewerId);
    const liked = await this.likes.getPostLikeStatus(viewerId, [post.id]);
    return this.mapPost(post, viewerId, liked.has(post.id));
  }

  async update(
    authorId: string,
    id: string,
    dto: UpdatePostDto,
    imageUrl?: string | null,
  ) {
    await this.getOwnedPost(id, authorId);
    return this.prisma.post.update({
      where: { id },
      data: {
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.visibility !== undefined ? { visibility: dto.visibility } : {}),
        ...(imageUrl !== undefined ? { image: imageUrl } : {}),
      },
    });
  }

  async remove(authorId: string, id: string) {
    await this.getOwnedPost(id, authorId);
    await this.prisma.post.delete({ where: { id } });
    return { id };
  }

  // ----- Like delegation (endpoints live on the posts router) -----

  async like(authorId: string, postId: string) {
    await this.assertExists(postId);
    return this.likes.likePost(authorId, postId);
  }

  async unlike(authorId: string, postId: string) {
    await this.assertExists(postId);
    return this.likes.unlikePost(authorId, postId);
  }

  // ----- internals -----

  private async getOwnedPost(id: string, authorId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only modify your own posts');
    }
    return post;
  }

  private async assertExists(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }

  private assertVisible(
    post: { visibility: Visibility; authorId: string },
    viewerId: string,
  ) {
    if (post.visibility === Visibility.PRIVATE && post.authorId !== viewerId) {
      throw new NotFoundException('Post not found');
    }
  }

  private visibleToViewer(viewerId: string): Prisma.PostWhereInput {
    return {
      OR: [{ visibility: Visibility.PUBLIC }, { authorId: viewerId }],
    };
  }

  private mapPost(
    post: {
      id: string;
      authorId: string;
      content: string;
      image: string | null;
      visibility: Visibility;
      createdAt: Date;
      updatedAt: Date;
      author: { id: string; firstName: string; lastName: string } | null;
      _count?: { comments: number; likes: number };
    },
    _viewerId: string,
    likedByMe: boolean,
  ) {
    return {
      id: post.id,
      authorId: post.authorId,
      content: post.content,
      image: post.image,
      visibility: post.visibility,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      likeCount: post._count?.likes ?? 0,
      commentCount: post._count?.comments ?? 0,
      likedByMe,
    };
  }
}
