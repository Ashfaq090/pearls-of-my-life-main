import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateMemoryFoldersDto {
  @IsOptional()
  user_id?: any;

  @IsNotEmpty()
  @IsString()
  folder_name: string; // Frontend sends folder_name, maps to 'name' in database

  @IsOptional()
  @IsString()
  description?: string;
}
