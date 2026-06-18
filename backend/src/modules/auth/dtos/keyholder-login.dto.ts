import { IsEmail, IsISO8601, IsNotEmpty, IsString } from "class-validator";

export class KeyHolderLoginDto {

    @IsString()
    @IsNotEmpty()
    token_url: string;

    @IsString()
    @IsNotEmpty()
    pin: string;

}

export class KeyHolderAccessDto {

    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsISO8601()
    @IsNotEmpty()
    date_of_death: string;

    @IsString()
    @IsNotEmpty()
    ssn: string;

}