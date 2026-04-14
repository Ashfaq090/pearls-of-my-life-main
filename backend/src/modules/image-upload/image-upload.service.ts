import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageCategories } from '../../entities/image-categories.entity';
import { ImageDetails } from '../../entities/image-details.entity';
import { ImageFolder } from '../../entities/image-folder.entity';
import { extname } from 'path';

@Injectable()
export class ImageUploadService {
  constructor(
    @InjectRepository(ImageCategories)
    private readonly imageCategoryRepository: Repository<ImageCategories>,
    @InjectRepository(ImageDetails)
    private readonly imageDetailsRepository: Repository<ImageDetails>,
    @InjectRepository(ImageFolder)
    private readonly imageFoldersRepository: Repository<ImageFolder>,
  ) {}

  async getImageCategoryByName(name: string): Promise<ImageCategories> {
    let imageCategory = await this.imageCategoryRepository.findOne({
      where: {
        name: name,
      },
    });
    
    // If category doesn't exist, create it
    if (!imageCategory) {
      imageCategory = this.imageCategoryRepository.create({ name });
      imageCategory = await this.imageCategoryRepository.save(imageCategory);
    }
    
    return imageCategory;
  }

  async removeImageDetails(user_id: string, category_name: string) {
    const imageCategory = await this.getImageCategoryByName(category_name);
    if (!imageCategory) {
      return; // No category found, nothing to remove
    }
    
    await this.imageDetailsRepository.update(
      {
        user_id: user_id,
        image_category_id: imageCategory.id,
      },
      {
        updated_on: new Date(),
        updated_by: user_id,
        deleted_on: new Date(),
        deleted_by: user_id,
      }
    );
  }

  async addImageDetails(
    file: any,
    user_id: string,
    category_name: string,
    image_path: string,
  ): Promise<ImageDetails> {
    const imageCategory = await this.getImageCategoryByName(category_name);
    const payload = {
      user_id: user_id,
      image_category_id: imageCategory.id,
      image_path: image_path,
      image_file_name: file.originalname,
      image_ext: extname(file.originalname),
      created_by: user_id,
    };
    const imageDetails = this.imageDetailsRepository.create(payload as ImageDetails);
    return await this.imageDetailsRepository.save(imageDetails);
  }

  async getImageDetails(
    user_id: string,
    category_name: string,
  ): Promise<ImageDetails | null> {
    const imageCategory = await this.getImageCategoryByName(category_name);
    if (!imageCategory) {
      return null;
    }
    
    const imageDetails = await this.imageDetailsRepository.findOne({
      where: {
        user_id: user_id,
        image_category_id: imageCategory.id,
        deleted_on: null,
      },
    });
    return imageDetails;
  }
}
