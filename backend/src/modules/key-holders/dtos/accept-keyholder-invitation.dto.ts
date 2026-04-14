import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AcceptKeyHolderInvitationDto {
  @IsNotEmpty()
  @IsString()
  token_url: string;

  @IsNotEmpty()
  @IsString()
  pin: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

