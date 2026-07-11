import { IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateReplyDto {
  @IsString()
  @MaxLength(2000)
  content: string;

  @IsString()
  commentId: string;
}

export class UpdateReplyDto {
  @IsString()
  @MaxLength(2000)
  content: string;
}

/**
 * Query DTO for listing replies.
 * Extends PaginationDto so that `commentId` is a recognised (whitelisted)
 * property and NestJS's `forbidNonWhitelisted` validation does not reject
 * the request with a 400 error.
 */
export class ReplyQueryDto extends PaginationDto {
  @IsString()
  commentId: string;
}

