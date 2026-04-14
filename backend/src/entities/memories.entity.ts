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
import { MemoryFolders } from './memory-folders.entity';
import { ImageDetails } from './image-details.entity';
import { User } from './user.entity';

@Entity('memories')
export class Memories {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  memory_folder_id: string;

  @ManyToOne(() => MemoryFolders)
  @JoinColumn({ name: 'memory_folder_id' })
  folder: MemoryFolders;

  @Column({ type: 'uuid', nullable: true })
  image_detail_id: string;

  @ManyToOne(() => ImageDetails)
  @JoinColumn({ name: 'image_detail_id' })
  image_details: ImageDetails;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'Untitled Memory',
  })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  memory_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'json', nullable: true })
  tags: any;

  @CreateDateColumn({ type: 'datetime' })
  created_on: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updated_on: Date;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deleted_on: Date;

  @Column({ type: 'uuid', nullable: true })
  deleted_by: string;
}
