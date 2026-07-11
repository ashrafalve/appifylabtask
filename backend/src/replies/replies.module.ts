import { Module } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { RepliesController } from './replies.controller';
import { LikesModule } from '../likes/likes.module';

/**
 * RepliesModule wires reply CRUD + reply likes.
 */
@Module({
  imports: [LikesModule],
  controllers: [RepliesController],
  providers: [RepliesService],
  exports: [RepliesService],
})
export class RepliesModule {}
