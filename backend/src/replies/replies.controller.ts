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
import { RepliesService } from './replies.service';
import { CreateReplyDto, UpdateReplyDto } from './dto/reply.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthRequired } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

/**
 * Reply endpoints. Replies target a comment. All require a valid JWT.
 */
@ApiTags('replies')
@Controller('replies')
@UseGuards(JwtAuthGuard)
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @Post()
  @AuthRequired()
  @ApiOperation({ summary: 'Create a reply to a comment' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateReplyDto) {
    return this.repliesService.create(userId, dto.commentId, dto);
  }

  @Get()
  @AuthRequired()
  @ApiOperation({ summary: 'List replies for a comment (paginated)' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('commentId') commentId: string,
    @Query() query: PaginationDto,
  ) {
    return this.repliesService.findAll(commentId, userId, query);
  }

  @Get(':id')
  @AuthRequired()
  @ApiOperation({ summary: 'Get a single reply' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.repliesService.findOne(id, userId);
  }

  @Patch(':id')
  @AuthRequired()
  @ApiOperation({ summary: 'Update a reply' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReplyDto,
  ) {
    return this.repliesService.update(userId, id, dto);
  }

  @Delete(':id')
  @AuthRequired()
  @ApiOperation({ summary: 'Delete a reply' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.repliesService.remove(userId, id);
  }

  @Post(':id/like')
  @AuthRequired()
  @ApiOperation({ summary: 'Like a reply (idempotent)' })
  async like(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.repliesService.like(userId, id);
  }

  @Delete(':id/like')
  @AuthRequired()
  @ApiOperation({ summary: 'Unlike a reply' })
  async unlike(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.repliesService.unlike(userId, id);
  }
}
