import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsISO8601,
} from 'class-validator';

export class CreateMemoryDto {
  @IsNotEmpty()
  @IsString()
  user_id?: string;

  @IsNotEmpty()
  @IsString()
  folder_id: string; // Frontend sends folder_id, maps to memory_folder_id in database

  @IsNotEmpty()
  @IsString()
  image_details_id: string; // Frontend sends image_details_id, maps to image_detail_id in database

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsISO8601()
  memory_date?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  tags?: any;
}
