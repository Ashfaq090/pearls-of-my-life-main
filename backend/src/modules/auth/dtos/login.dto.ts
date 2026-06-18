import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class LoginDto {
    
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    hashed_password: string;

    @IsString()
    @IsOptional()
    ssn: string;
    
}