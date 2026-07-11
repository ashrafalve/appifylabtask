import { IsString, MaxLength } from 'class-validator';

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
