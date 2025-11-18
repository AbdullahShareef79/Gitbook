import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInteractionDto {
  @IsEnum(['LIKE', 'BOOKMARK', 'COMMENT'])
  kind: 'LIKE' | 'BOOKMARK' | 'COMMENT';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;
}

export class DeleteInteractionDto {
  @IsEnum(['LIKE', 'BOOKMARK', 'COMMENT'])
  kind: 'LIKE' | 'BOOKMARK' | 'COMMENT';
}
