import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  // Frontend sends 'heading' but database uses 'title'
  @IsNotEmpty()
  @IsString()
  heading: string;

  // Frontend sends 'description' but database uses 'content'
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsISO8601()
  @IsNotEmpty()
  note_date: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  is_pinned?: boolean;

  @IsOptional()
  @IsString()
  user_id?: string;
}
