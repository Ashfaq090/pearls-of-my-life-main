import { IsOptional, IsString } from "class-validator";
import { PageOptionsDto } from "src/common/dtos/page-options.dto";

export class FilterCredentialsDto extends PageOptionsDto {

    @IsOptional()
    @IsString()
    domain_name: string;

}