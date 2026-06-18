import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { KeyHolder } from './keyholder.entity';
import { UserSubscription } from './user-subscription.entity';
import { Payment } from './payment.entity';
import { UploadedContent } from './uploaded-content.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  KEYHOLDER = 'keyholder',
  SUPER_ADMIN = 'super_admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  hashed_password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reset_token: string;

  @Column({ type: 'datetime', nullable: true })
  reset_token_expiry: Date;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone_number: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  permanent_address: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'boolean', default: false })
  is_phone_verified: boolean;

  @Column({ type: 'boolean', default: true })
  email_marketing_opt_in: boolean;

  @Column({ type: 'boolean', default: true })
  sms_consent_opt_in: boolean;

  @Column({ type: 'boolean', default: false })
  subscription_email_sent: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_terminated: boolean;

  @Column({ type: 'datetime', nullable: true })
  terminated_at: Date;

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

  // Relations
  @OneToMany(() => KeyHolder, (keyHolder) => keyHolder.user)
  keyHolders: KeyHolder[];

  @OneToMany(() => UserSubscription, (subscription) => subscription.user)
  subscriptions: UserSubscription[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => UploadedContent, (content) => content.user)
  uploadedContent: UploadedContent[];

  @Column({ type: 'varchar', length: 4, nullable: true })
  ssn: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  promo_code: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  promo_plan_id: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_promo_availed: boolean;

  @Column({ type: 'datetime', nullable: true })
  date_of_death: Date;

}

