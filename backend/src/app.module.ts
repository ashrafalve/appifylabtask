import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { RepliesModule } from './replies/replies.module';
import { LikesModule } from './likes/likes.module';

/**
 * Root application module. Feature modules are composed here; Prisma, config
 * and uploads are global so they don't need re-importing downstream.
 */
@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    UploadsModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    RepliesModule,
    LikesModule,
  ],
})
export class AppModule {}
