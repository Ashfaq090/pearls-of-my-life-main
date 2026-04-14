import { IsArray } from "class-validator";
import { PageMetaDto } from "./page-meta.dto";

export class PaginateDto<T> {
    constructor(
        data: T[],
        meta: PageMetaDto
    ){
        this.data = data;
        this.meta = meta;
    }

    readonly meta: PageMetaDto;

    @IsArray()
    readonly data: T[];
}