import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';

/**
 * LikesModule centralizes like/unlike + status logic for posts, comments and
 * replies. Imported (not global) so only resource modules that need it pull it in.
 */
@Module({
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
