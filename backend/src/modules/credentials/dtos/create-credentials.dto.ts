import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCredentialsDto {

    @IsString()
    @IsNotEmpty()
    domain_name: string;
    
    @IsString()
    @IsNotEmpty()
    domain_url: string;

    @IsString()
    @IsNotEmpty()
    username: string;
    
    @IsString()
    @IsNotEmpty()
    password: string;
    
    @IsOptional()
    @IsString()
    user_id?: string;

}