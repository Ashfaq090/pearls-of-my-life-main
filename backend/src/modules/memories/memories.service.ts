import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterMemoryFoldersDto } from './dtos/filter-memory-folders.dto';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { MemoryFolders } from '../../entities/memory-folders.entity';
import { CreateMemoryFoldersDto } from './dtos/create-memory-folder.dto';
import { Memories } from '../../entities/memories.entity';
import { CreateMemoryDto } from './dtos/create-memory.dto';
import { FilterMemoriesDto } from './dtos/filter-memories.dto';

@Injectable()
export class MemoriesService {
  constructor(
    @InjectRepository(MemoryFolders)
    private readonly memoryFoldersRepository: Repository<MemoryFolders>,
    @InjectRepository(Memories)
    private readonly memoriesRepository: Repository<Memories>,
  ) {}

  async findAllFolders(
    pageOptions: FilterMemoryFoldersDto,
    user_id: string,
  ): Promise<PaginateDto<MemoryFolders>> {
    const page = pageOptions.page || 1;
    const pageSize = pageOptions.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {
      user_id,
      deleted_on: null,
    };

    const [data, total] = await this.memoryFoldersRepository.findAndCount({
      where,
      order: {
        [pageOptions.order_key || 'updated_on']: pageOptions.order || 'DESC',
      },
      take: pageSize,
      skip: skip,
    });

    // Map database field names to frontend field names
    const mappedData = data.map((folder) => ({
      ...folder,
      folder_name: folder.name, // Map name -> folder_name for frontend
    }));

    return {
      data: mappedData,
      meta: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  }

  async findFolderByName(
    folder_name: string,
    user_id: string,
  ): Promise<MemoryFolders> {
    return await this.memoryFoldersRepository.findOne({
      where: {
        deleted_on: null,
        name: folder_name, // Map folder_name -> name
        user_id,
      },
    });
  }

  async createFolder(
    input: CreateMemoryFoldersDto,
    created_by: string,
  ): Promise<MemoryFolders> {
    // Map frontend field name (folder_name) to database field name (name)
    const memoryFolder = this.memoryFoldersRepository.create({
      name: input.folder_name, // Map folder_name -> name
      description: input.description,
      user_id: input.user_id,
      created_by: created_by,
    });
    const saved = await this.memoryFoldersRepository.save(memoryFolder);
    // Map back to frontend format
    return {
      ...saved,
      folder_name: saved.name, // Map name -> folder_name for frontend
    } as any;
  }

  async createMemory(
    input: CreateMemoryDto,
    created_by: string,
  ): Promise<Memories> {
    // Map frontend field names to database field names
    const memory = this.memoriesRepository.create({
      memory_folder_id: input.folder_id, // Map folder_id -> memory_folder_id
      image_detail_id: input.image_details_id, // Map image_details_id -> image_detail_id
      title: input.title || 'Untitled Memory', // Provide default title if not provided
      description: input.description,
      memory_date: input.memory_date ? new Date(input.memory_date) : null,
      location: input.location,
      tags: input.tags,
      user_id: input.user_id,
      created_by: created_by,
    });
    const saved = await this.memoriesRepository.save(memory);
    // Map back to frontend format
    return {
      ...saved,
      folder_id: saved.memory_folder_id, // Map memory_folder_id -> folder_id
      image_details_id: saved.image_detail_id, // Map image_detail_id -> image_details_id
    } as any;
  }

  async findMemoriesByFolder(pageOptions: FilterMemoriesDto, user_id: string) {
    const page = pageOptions.page || 1;
    const pageSize = pageOptions.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {
      user_id,
      deleted_on: null,
    };

    if (pageOptions?.folder_id) {
      where.memory_folder_id = pageOptions.folder_id; // Map folder_id -> memory_folder_id
    }

    const [data, total] = await this.memoriesRepository.findAndCount({
      where,
      relations: ['folder', 'image_details'],
      order: {
        [pageOptions.order_key || 'updated_on']: pageOptions.order || 'DESC',
      },
      take: pageSize,
      skip: skip,
    });

    // Map database field names to frontend field names
    const mappedData = data.map((memory) => ({
      ...memory,
      folder_id: memory.memory_folder_id, // Map memory_folder_id -> folder_id
      image_details_id: memory.image_detail_id, // Map image_detail_id -> image_details_id
    }));

    return {
      data: mappedData,
      meta: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  }
}
