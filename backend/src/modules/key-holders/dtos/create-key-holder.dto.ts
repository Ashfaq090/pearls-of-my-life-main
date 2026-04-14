import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateKeyHolderDto {
  @IsOptional()
  id: string;

  @IsOptional()
  file: any;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsString()
  relation?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  funeral_home_name?: string;

  @IsOptional()
  @IsString()
  contact_person?: string;
}
