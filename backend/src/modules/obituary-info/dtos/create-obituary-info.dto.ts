import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class ChildDto {
  @IsOptional()
  @IsString()
  first?: string;

  @IsOptional()
  @IsString()
  middle?: string;

  @IsOptional()
  @IsString()
  last?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : null)
  dateOfBirth?: Date;

  @IsOptional()
  @IsBoolean()
  isLiving?: boolean;

  // Legacy support
  @IsOptional()
  @IsString()
  name?: string;
}

class SiblingDto {
  @IsOptional()
  @IsString()
  first?: string;

  @IsOptional()
  @IsString()
  middle?: string;

  @IsOptional()
  @IsString()
  last?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsBoolean()
  isAlive?: boolean;

  // Legacy support
  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateObituaryInfoDto {
  @IsOptional()
  user_id?: string;

  // Core fields
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  birth_name?: string;

  @IsOptional()
  @IsString()
  married_name?: string;

  @IsOptional()
  @IsString()
  current_name?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  date_of_birth?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  birth_date?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  date_of_death?: Date;

  @IsOptional()
  @IsString()
  place_of_birth?: string;

  @IsOptional()
  @IsString()
  birth_city?: string;

  @IsOptional()
  @IsString()
  birth_state?: string;

  @IsOptional()
  @IsString()
  place_of_death?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsString()
  father_name?: string;

  @IsOptional()
  @IsString()
  mother_name?: string;

  @IsOptional()
  @IsString()
  biological_mother_first?: string;

  @IsOptional()
  @IsString()
  biological_mother_middle?: string;

  @IsOptional()
  @IsString()
  biological_mother_last?: string;

  @IsOptional()
  @IsString()
  biological_father_first?: string;

  @IsOptional()
  @IsString()
  biological_father_middle?: string;

  @IsOptional()
  @IsString()
  biological_father_last?: string;

  @IsOptional()
  @IsString()
  stepmother_first?: string;

  @IsOptional()
  @IsString()
  stepmother_middle?: string;

  @IsOptional()
  @IsString()
  stepmother_last?: string;

  @IsOptional()
  @IsString()
  stepfather_first?: string;

  @IsOptional()
  @IsString()
  stepfather_middle?: string;

  @IsOptional()
  @IsString()
  stepfather_last?: string;

  @IsOptional()
  @IsString()
  spouse_name?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  spouse_marriage_date?: Date;

  @IsOptional()
  @IsString()
  spouse2_name?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  spouse2_marriage_date?: Date;

  @IsOptional()
  @IsString()
  spouse3_name?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  spouse3_marriage_date?: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChildDto)
  children?: ChildDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChildDto)
  children2?: ChildDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChildDto)
  children3?: ChildDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiblingDto)
  siblings?: SiblingDto[];

  @IsOptional()
  @IsArray()
  schools?: {
    school_name?: string;
    degree?: string;
    start_date?: string;
    end_date?: string;
  }[];

  @IsOptional()
  @IsArray()
  employment?: {
    employer?: string;
    title?: string;
    start_date?: string;
    end_date?: string;
  }[];

  @IsOptional()
  @IsArray()
  career_achievements?: {
    title?: string;
    date?: string;
  }[];

  @IsOptional()
  @IsObject()
  church_affiliation?: {
    church_name?: string;
    titles_held?: string;
    year_joined?: string;
  };

  @IsOptional()
  @IsArray()
  other_achievements?: {
    text?: string;
  }[];

  @IsOptional()
  @IsArray()
  club_memberships?: {
    text?: string;
  }[];

  @IsOptional()
  @IsArray()
  other_group_affiliations?: {
    text?: string;
  }[];

  @IsOptional()
  @IsArray()
  greatest_friendships?: {
    text?: string;
  }[];

  @IsOptional()
  @IsString()
  special_instructions?: string;
}
