import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { LikesModule } from '../likes/likes.module';
import { UploadsModule } from '../uploads/uploads.module';

/**
 * PostsModule wires post CRUD, image upload and post likes.
 * LikesModule is imported so posts can delegate like/unlike to LikesService.
 */
@Module({
  imports: [LikesModule, UploadsModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
