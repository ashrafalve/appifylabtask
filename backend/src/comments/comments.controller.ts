import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, CommentQueryDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthRequired } from '../common/decorators/current-user.decorator';


/**
 * Comment endpoints. All require a valid JWT.
 * Nested under /comments; likes live at /comments/:id/like.
 */
@ApiTags('comments')
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  @AuthRequired()
  @ApiOperation({ summary: 'Create a comment on a post' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(userId, dto.postId, dto);
  }

  @Get()
  @AuthRequired()
  @ApiOperation({ summary: 'List comments for a post (paginated)' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: CommentQueryDto,
  ) {
    return this.commentsService.findAll(query.postId, userId, query);
  }

  @Get(':id')
  @AuthRequired()
  @ApiOperation({ summary: 'Get a single comment' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.commentsService.findOne(id, userId);
  }

  @Patch(':id')
  @AuthRequired()
  @ApiOperation({ summary: 'Update a comment' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(userId, id, dto);
  }

  @Delete(':id')
  @AuthRequired()
  @ApiOperation({ summary: 'Delete a comment' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.commentsService.remove(userId, id);
  }

  @Post(':id/like')
  @AuthRequired()
  @ApiOperation({ summary: 'Like a comment (idempotent)' })
  async like(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.commentsService.like(userId, id);
  }

  @Delete(':id/like')
  @AuthRequired()
  @ApiOperation({ summary: 'Unlike a comment' })
  async unlike(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.commentsService.unlike(userId, id);
  }
}
