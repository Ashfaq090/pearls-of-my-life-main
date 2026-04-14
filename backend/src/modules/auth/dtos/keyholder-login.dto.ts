import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class KeyHolderLoginDto {

    @IsString()
    @IsNotEmpty()
    token_url: string;

    @IsString()
    @IsNotEmpty()
    pin: string;

}