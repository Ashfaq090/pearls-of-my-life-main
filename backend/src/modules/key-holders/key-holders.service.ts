import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  generateRandomAlphanumeric,
  TOKEN_PIN_LENGTH,
  TOKEN_URL_LENGTH,
} from 'src/common/constants';
import { KeyHolder } from '../../entities/keyholder.entity';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { FilterKeyHoldersDto } from './dtos/filter-key-holders.dto';
import { CreateKeyHolderDto } from './dtos/create-key-holder.dto';
import { KeyHolderLoginDto } from '../auth/dtos/keyholder-login.dto';

@Injectable()
export class KeyHoldersService {
  constructor(
    @InjectRepository(KeyHolder)
    private readonly keyHoldersRepository: Repository<KeyHolder>,
  ) {}

  async findAll(
    pageOptions: FilterKeyHoldersDto,
    user_id: string,
  ): Promise<PaginateDto<KeyHolder>> {
    const page = pageOptions.page || 1;
    const pageSize = pageOptions.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [data, total] = await this.keyHoldersRepository.findAndCount({
      where: {
        user_id,
        deleted_on: null,
      },
      order: {
        [pageOptions.order_key || 'updated_on']: pageOptions.order || 'DESC',
      },
      take: pageSize,
      skip: skip,
    });

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  }

  async countActiveByUser(user_id: string): Promise<number> {
    return this.keyHoldersRepository.count({
      where: {
        user_id,
        deleted_on: null,
        type: 'PERSON',
      },
    });
  }

  async countByUserAndType(user_id: string, type: string): Promise<number> {
    return this.keyHoldersRepository.count({
      where: {
        user_id,
        deleted_on: null,
        type,
      },
    });
  }

  async create(
    input: CreateKeyHolderDto,
    created_by: string,
  ): Promise<KeyHolder> {
    const userId = created_by;
    if (input.email) {
      const existingByEmail = await this.keyHoldersRepository.findOne({
        where: {
          user_id: userId,
          email: input.email,
          deleted_on: null,
        },
      });
      if (existingByEmail) {
        throw new BadRequestException('Keyholder already exists');
      }
    } else if (input.phone_number) {
      const existingByPhone = await this.keyHoldersRepository.findOne({
        where: {
          user_id: userId,
          phone_number: input.phone_number,
          deleted_on: null,
        },
      });
      if (existingByPhone) {
        throw new BadRequestException('Keyholder already exists');
      }
    }
    const token_url = generateRandomAlphanumeric(TOKEN_URL_LENGTH);
    const pin = generateRandomAlphanumeric(TOKEN_PIN_LENGTH);
    const keyHolder = this.keyHoldersRepository.create({
      ...input,
      created_by,
      token_url,
      pin,
    });
    return await this.keyHoldersRepository.save(keyHolder);
  }

  async updateKeyHolderImage(id, image_path, updated_by) {
    await this.keyHoldersRepository.update(id, {
      image_path: image_path,
      updated_on: new Date(),
      updated_by: updated_by,
    });
    return await this.findOne(id);
  }

  async findOne(id: string): Promise<KeyHolder> {
    return await this.keyHoldersRepository.findOne({
      where: {
        id,
        deleted_on: null,
      },
    });
  }

  async findOneByIdAndUser(id: string, user_id: string): Promise<KeyHolder> {
    return await this.keyHoldersRepository.findOne({
      where: {
        id,
        user_id,
        deleted_on: null,
      },
    });
  }

  async findOneByTokenURL(token_url: string): Promise<KeyHolder> {
    return await this.keyHoldersRepository.findOne({
      where: {
        token_url,
        deleted_on: null,
      },
    });
  }

  async findOneByTokenAndPin(creds: KeyHolderLoginDto): Promise<KeyHolder> {
    return await this.keyHoldersRepository.findOne({
      where: {
        token_url: creds.token_url,
        pin: creds.pin,
        deleted_on: null,
      },
    });
  }

  async delete(id: string, user_id) {
    await this.keyHoldersRepository.update(id, {
      deleted_on: new Date(),
      deleted_by: user_id,
    });
  }

  async acceptInvitation(
    token_url: string,
    pin: string,
    password: string,
  ): Promise<KeyHolder> {
    const keyHolder = await this.findOneByTokenAndPin({ token_url, pin });
    if (!keyHolder) {
      throw new Error('Invalid token or PIN');
    }
    // Key holder invitation accepted - password will be set during user creation
    // This method validates the invitation, actual user creation happens in auth controller
    return keyHolder;
  }

  async update(id: string, updateData: Partial<KeyHolder>) {
    await this.keyHoldersRepository.update(id, {
      ...updateData,
      updated_on: new Date(),
    });
    return this.findOne(id);
  }
}
