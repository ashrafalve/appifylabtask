import { IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateCommentDto {
  @IsString()
  @MaxLength(2000)
  content: string;

  @IsString()
  postId: string;
}

export class UpdateCommentDto {
  @IsString()
  @MaxLength(2000)
  content: string;
}

/**
 * Query DTO for listing comments.
 * Extends PaginationDto so that `postId` is a recognised (whitelisted)
 * property and NestJS's `forbidNonWhitelisted` validation does not reject
 * the request with a 400 error.
 */
export class CommentQueryDto extends PaginationDto {
  @IsString()
  postId: string;
}
