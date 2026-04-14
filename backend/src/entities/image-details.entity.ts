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
import { ImageCategories } from './image-categories.entity';

@Entity('image_details')
export class ImageDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  image_category_id: string;

  @ManyToOne(() => ImageCategories)
  @JoinColumn({ name: 'image_category_id' })
  category: ImageCategories;

  @Column({ type: 'varchar', length: 500 })
  image_path: string;

  @Column({ type: 'varchar', length: 255 })
  image_file_name: string;

  @Column({ type: 'varchar', length: 50 })
  image_ext: string;

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
