import { Module } from '@nestjs/common';
import { ImageUploadService } from './image-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageDetails } from '../../entities/image-details.entity';
import { ImageCategories } from '../../entities/image-categories.entity';
import { ImageFolder } from '../../entities/image-folder.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageDetails, ImageCategories, ImageFolder]),
  ],
  providers: [
    ImageUploadService
  ],
  exports: [
    ImageUploadService
  ]
})
export class ImageUploadModule {}
