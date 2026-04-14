import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('obituary_info')
export class ObituaryInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  full_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  birth_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  married_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_name: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'date', nullable: true })
  date_of_death: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  place_of_birth: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  birth_city: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  birth_state: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  place_of_death: string;

  @Column({ type: 'text', nullable: true })
  biography: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  father_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mother_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  biological_mother_first: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  biological_mother_middle: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  biological_mother_last: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  biological_father_first: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  biological_father_middle: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  biological_father_last: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stepmother_first: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stepmother_middle: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stepmother_last: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stepfather_first: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stepfather_middle: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stepfather_last: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  spouse_name: string;

  @Column({ type: 'date', nullable: true })
  spouse_marriage_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  spouse2_name: string;

  @Column({ type: 'date', nullable: true })
  spouse2_marriage_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  spouse3_name: string;

  @Column({ type: 'date', nullable: true })
  spouse3_marriage_date: Date;

  @Column({ type: 'json', nullable: true })
  children: {
    first: string;
    middle: string;
    last: string;
    relationship: string;
    dateOfBirth: Date;
    isLiving: boolean;
  }[];

  @Column({ type: 'json', nullable: true })
  children2: {
    first: string;
    middle: string;
    last: string;
    relationship: string;
    dateOfBirth: Date;
    isLiving: boolean;
  }[];

  @Column({ type: 'json', nullable: true })
  children3: {
    first: string;
    middle: string;
    last: string;
    relationship: string;
    dateOfBirth: Date;
    isLiving: boolean;
  }[];

  @Column({ type: 'json', nullable: true })
  siblings: {
    first: string;
    middle: string;
    last: string;
    relationship: string;
    isAlive: boolean;
  }[];

  @Column({ name: 'schools_json', type: 'json', nullable: true })
  schools: {
    school_name?: string;
    degree?: string;
    start_date?: string;
    end_date?: string;
  }[];

  @Column({ name: 'employment_json', type: 'json', nullable: true })
  employment: {
    employer?: string;
    title?: string;
    start_date?: string;
    end_date?: string;
  }[];

  @Column({ name: 'career_achievements_json', type: 'json', nullable: true })
  career_achievements: {
    title?: string;
    date?: string;
  }[];

  @Column({ name: 'church_affiliation_json', type: 'json', nullable: true })
  church_affiliation: {
    church_name?: string;
    titles_held?: string;
    year_joined?: string;
  };

  @Column({ name: 'other_achievements_json', type: 'json', nullable: true })
  other_achievements: {
    text?: string;
  }[];

  @Column({ name: 'club_memberships_json', type: 'json', nullable: true })
  club_memberships: {
    text?: string;
  }[];

  @Column({ name: 'other_group_affiliations_json', type: 'json', nullable: true })
  other_group_affiliations: {
    text?: string;
  }[];

  @Column({ name: 'greatest_friendships_json', type: 'json', nullable: true })
  greatest_friendships: {
    text?: string;
  }[];

  @Column({ type: 'text', nullable: true })
  special_instructions: string;

  @Column({ type: 'text', nullable: true })
  education: string;

  @Column({ type: 'text', nullable: true })
  career: string;

  @Column({ type: 'text', nullable: true })
  hobbies: string;

  @Column({ type: 'text', nullable: true })
  achievements: string;

  @Column({ type: 'text', nullable: true })
  funeral_details: string;

  @CreateDateColumn({ type: 'datetime' })
  created_on: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by: string;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updated_on: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updated_by: string;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deleted_on: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deleted_by: string;
}
