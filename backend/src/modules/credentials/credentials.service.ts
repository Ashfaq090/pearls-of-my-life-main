import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Credentials } from '../../entities/credentials.entity';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { FilterCredentialsDto } from './dtos/filter-credentials.dto';
import { CreateCredentialsDto } from './dtos/create-credentials.dto';
import { UpdateCredentialsDto } from './dtos/update-credentials.dto';

@Injectable()
export class CredentialsService {
    constructor(
        @InjectRepository(Credentials)
        private readonly credsRepository: Repository<Credentials>
    ){}

    async findAll(
        pageOptions: FilterCredentialsDto,
        user_id: string
    ): Promise<PaginateDto<Credentials>> {
        const page = pageOptions.page || 1;
        const pageSize = pageOptions.pageSize || 10;
        const skip = (page - 1) * pageSize;

        const where: any = {
            user_id,
            deleted_on: null
        }

        if(pageOptions.domain_name){
            where.domain_name = Like(`%${pageOptions.domain_name}%`);
        }

        const [data, total] = await this.credsRepository.findAndCount({
            where,
            order: {
                [pageOptions.order_key || 'updated_on']: pageOptions.order || 'DESC'
            },
            take: pageSize,
            skip: skip
        });

        return {
            data,
            meta: {
                page,
                pageSize,
                total,
                pages: Math.ceil(total / pageSize)
            }
        };
    }
    
    async findOne(id: string): Promise<Credentials> {
        return await this.credsRepository.findOne({
            where: {
                id,
                deleted_on: null
            }
        });
    }

    async create(input: CreateCredentialsDto, created_by: string): Promise<Credentials> { 
        const creds = this.credsRepository.create({...input, created_by: created_by});
        return await this.credsRepository.save(creds);
    }

    async update(input: UpdateCredentialsDto, id: string, user_id: string): Promise<Credentials> { 
        await this.credsRepository.update(id, {
            ...input,
            updated_on: new Date(),
            updated_by: user_id
        });
        return await this.findOne(id);
    }

    async delete(id: string, user_id){
        await this.credsRepository.update(id, {
            deleted_on: new Date(),
            deleted_by: user_id
        });
    }

}