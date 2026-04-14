import { forwardRef, Module } from '@nestjs/common';
import { MemoriesController } from './memories.controller';
import { MemoriesService } from './memories.service';
import { ImageUploadModule } from '../image-upload/image-upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memories } from '../../entities/memories.entity';
import { MemoryFolders } from '../../entities/memory-folders.entity';

@Module({
  controllers: [MemoriesController],
  providers: [MemoriesService],
  imports: [
    forwardRef(() => ImageUploadModule),
    TypeOrmModule.forFeature([Memories, MemoryFolders])
  ]
})
export class MemoriesModule { }
