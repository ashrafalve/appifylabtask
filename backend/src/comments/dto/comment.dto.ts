import { IsString, MaxLength } from 'class-validator';

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
