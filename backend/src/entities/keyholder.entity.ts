import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('key_holders')
export class KeyHolder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.keyHolders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zip: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  relation: string;

  @Column({ type: 'varchar', length: 20, default: 'PERSON' })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  funeral_home_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_person: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_path: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  token_url: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  pin: string;

  @CreateDateColumn({ type: 'datetime' })
  created_on: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @UpdateDateColumn({ type: 'datetime' })
  updated_on: Date;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deleted_on: Date;

  @Column({ type: 'uuid', nullable: true })
  deleted_by: string;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  expired_on: Date;
}

