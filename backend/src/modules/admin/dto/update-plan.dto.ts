import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  features?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Video limits
  @IsOptional()
  @IsBoolean()
  videoRecordingAllowed?: boolean;

  @IsOptional()
  @IsNumber()
  maxVideoLengthInSeconds?: number;

  @IsOptional()
  @IsNumber()
  maxVideoUploads?: number;

  // Audio limits
  @IsOptional()
  @IsBoolean()
  audioRecordingAllowed?: boolean;

  @IsOptional()
  @IsNumber()
  maxAudioLengthInSeconds?: number;

  @IsOptional()
  @IsNumber()
  maxAudioUploads?: number;

  // Other limits
  @IsOptional()
  @IsNumber()
  max_images?: number;

  @IsOptional()
  @IsNumber()
  maxNotes?: number;

  // Legacy fields for backward compatibility
  @IsOptional()
  @IsNumber()
  max_video_length?: number;

  @IsOptional()
  @IsNumber()
  max_uploads?: number;

  @IsOptional()
  @IsString()
  billing_period?: string;
}
