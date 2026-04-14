import {
  IsOptional,
  IsString,
  IsISO8601,
  IsEmail,
  IsBoolean,
} from 'class-validator';

export class UpdateUserDto {
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
  address?: string;

  @IsOptional()
  @IsString()
  permanent_address?: string;

  @IsOptional()
  @IsISO8601()
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  hashed_password?: string;

  @IsOptional()
  @IsBoolean()
  email_marketing_opt_in?: boolean;

  @IsOptional()
  @IsBoolean()
  sms_consent_opt_in?: boolean;

  @IsOptional()
  @IsBoolean()
  subscription_email_sent?: boolean;
}
