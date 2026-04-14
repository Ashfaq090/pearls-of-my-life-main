import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ORDER } from "../constants";
import { Transform, Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class PageOptionsDto {
    
    @ApiPropertyOptional({
        enum: ORDER,
        default: ORDER.DESC
    })
    @IsOptional()
    @IsEnum(ORDER)
    readonly order?: ORDER = ORDER.DESC;

    @ApiPropertyOptional({
        default: 'updated_on'
    })
    @IsOptional()
    @IsString()
    readonly order_key?: 'updated_on';

    @ApiPropertyOptional({
        default: ''
    })
    @IsOptional()
    @IsString()
    readonly search?: string = '';

    @ApiPropertyOptional({
        minimum: 1,
        default: 1
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @IsInt()
    readonly page?: number = 1;

    @ApiPropertyOptional({
        minimum: 1,
        default: 20,
        maximum: 100
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    @IsInt()
    readonly pageSize?: number = 20;

    @ApiPropertyOptional({
        type: Boolean,
        default: true
    })
    @IsOptional()
    @Transform(({value}) => ['true',true,1].includes(value))
    @IsBoolean()
    readonly pagination?: boolean = true;

}