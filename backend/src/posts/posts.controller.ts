import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthRequired } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SupabaseService } from '../uploads/supabase.service';
import { ImageUploadInterceptor } from '../uploads/image-upload.interceptor';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly supabase: SupabaseService,
  ) {}

  @Post()
  @AuthRequired()
  @ApiOperation({ summary: 'Create a post' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(ImageUploadInterceptor)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await this.supabase.upload(file);
    }
    return this.postsService.create(userId, dto, imageUrl);
  }

  @Get()
  @AuthRequired()
  @ApiOperation({ summary: 'List posts (paginated, respecting visibility)' })
  async findAll(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.postsService.findAll(userId, query);
  }

  @Get(':id')
  @AuthRequired()
  @ApiOperation({ summary: 'Get a single post' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.findOne(userId, id);
  }

  @Patch(':id')
  @AuthRequired()
  @ApiOperation({ summary: 'Update a post' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(ImageUploadInterceptor)
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined = undefined;
    if (file) {
      imageUrl = await this.supabase.upload(file);
    }
    return this.postsService.update(userId, id, dto, imageUrl);
  }

  @Delete(':id')
  @AuthRequired()
  @ApiOperation({ summary: 'Delete a post' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.remove(userId, id);
  }

  @Post(':id/like')
  @AuthRequired()
  @ApiOperation({ summary: 'Like a post (idempotent)' })
  async like(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.like(userId, id);
  }

  @Delete(':id/like')
  @AuthRequired()
  @ApiOperation({ summary: 'Unlike a post' })
  async unlike(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.unlike(userId, id);
  }
}
