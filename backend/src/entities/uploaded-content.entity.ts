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

export enum ContentType {
  VIDEO = 'video',
  IMAGE = 'image',
  AUDIO = 'audio',
  NOTE = 'note',
}

export enum VideoSourceType {
  UPLOAD = 'upload',
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  RECORDED = 'recorded',
}

@Entity('uploaded_content')
export class UploadedContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.uploadedContent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ContentType,
  })
  content_type: ContentType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 1000 })
  url: string; // File path or external URL

  @Column({
    type: 'enum',
    enum: VideoSourceType,
    nullable: true,
  })
  source_type: VideoSourceType; // For videos: upload, youtube, vimeo, recorded

  @Column({ type: 'int', nullable: true })
  duration: number; // For video/audio in seconds

  @Column({ type: 'bigint', nullable: true })
  size: number; // File size in bytes

  @Column({ type: 'text', nullable: true })
  content: string; // For notes

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
}

