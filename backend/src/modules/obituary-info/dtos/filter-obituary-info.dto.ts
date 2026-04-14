import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos/page-options.dto';

export class FilterObituaryInfoDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  heading: string;

  @IsOptional()
  @IsString()
  year: string;
}
