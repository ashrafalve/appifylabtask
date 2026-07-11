import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { LikesModule } from '../likes/likes.module';

/**
 * CommentsModule wires comment CRUD + comment likes.
 */
@Module({
  imports: [LikesModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
