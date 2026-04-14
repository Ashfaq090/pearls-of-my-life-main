import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum EmailType {
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_TERMINATION = 'account_termination',
  SUBSCRIPTION = 'subscription',
  PAYMENT = 'payment',
  GENERAL = 'general',
}

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  recipient_email: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({
    type: 'enum',
    enum: EmailType,
    default: EmailType.GENERAL,
  })
  email_type: EmailType;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'boolean', default: false })
  sent: boolean;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}

