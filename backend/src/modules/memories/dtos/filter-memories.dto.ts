import { IsOptional } from "class-validator";
import { PageOptionsDto } from "src/common/dtos/page-options.dto";

export class FilterMemoriesDto extends PageOptionsDto {

    @IsOptional()
    folder_id?: any;

}