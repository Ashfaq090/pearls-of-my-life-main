import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserSubscription } from './user-subscription.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  features: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  // Plan limits
  @Column({ name: 'video_recording_allowed', type: 'boolean', default: false })
  videoRecordingAllowed: boolean;

  @Column({ name: 'max_video_length_in_seconds', type: 'int', default: 0 })
  maxVideoLengthInSeconds: number; // in seconds

  @Column({ name: 'max_video_uploads', type: 'int', default: 0 })
  maxVideoUploads: number;

  @Column({ name: 'audio_recording_allowed', type: 'boolean', default: false })
  audioRecordingAllowed: boolean;

  @Column({ name: 'max_audio_length_in_seconds', type: 'int', default: 0 })
  maxAudioLengthInSeconds: number; // in seconds

  @Column({ name: 'max_audio_uploads', type: 'int', default: 0 })
  maxAudioUploads: number;

  @Column({ type: 'int', default: 0 })
  max_images: number;

  @Column({ name: 'max_notes', type: 'int', default: 0 })
  maxNotes: number;

  // Legacy fields for backward compatibility
  @Column({ type: 'int', default: 0 })
  max_video_length: number; // in seconds (deprecated, use maxVideoLengthInSeconds)

  @Column({ type: 'int', default: 0 })
  max_uploads: number; // deprecated, use specific limits

  @Column({ type: 'varchar', length: 20, default: 'monthly' })
  billing_period: string; // monthly, annual

  @OneToMany(() => UserSubscription, (subscription) => subscription.plan)
  subscriptions: UserSubscription[];
}
