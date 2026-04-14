import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DeepPartial } from 'typeorm';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { CreateObituaryInfoDto } from './dtos/create-obituary-info.dto';
import { FilterObituaryInfoDto } from './dtos/filter-obituary-info.dto';
import { ObituaryInfo } from '../../entities/obituary-info.entity';

@Injectable()
export class ObituaryInfoService {
  constructor(
    @InjectRepository(ObituaryInfo)
    private readonly obituaryInfoRepository: Repository<ObituaryInfo>,
  ) {}

  private pickEntityColumns(input: any): any {
    if (!input || typeof input !== 'object') return {};
    const allowed = new Set(
      this.obituaryInfoRepository.metadata.columns.map((c) => c.propertyName),
    );
    const out: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (allowed.has(key)) out[key] = value;
    }
    return out;
  }

  async findAll(
    pageOptions: FilterObituaryInfoDto,
    user_id: string,
  ): Promise<PaginateDto<ObituaryInfo>> {
    const page = pageOptions.page || 1;
    const pageSize = pageOptions.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {
      user_id,
      deleted_on: null,
    };

    if (pageOptions?.year) {
        const startDate = new Date(`${+pageOptions.year}-01-01`);
        const endDate = new Date(`${+pageOptions.year + 1}-01-01`);
        where.date_of_birth = Between(startDate, endDate);
    }

    const [data, total] = await this.obituaryInfoRepository.findAndCount({
      where,
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

  async findOne(id: string): Promise<ObituaryInfo> {
    return await this.obituaryInfoRepository.findOne({
      where: {
        id,
        deleted_on: null,
      },
    });
  }

  async create(
    input: CreateObituaryInfoDto,
    created_by: string,
  ): Promise<ObituaryInfo> {
    const derivedFields = this.buildDerivedFields(input);
    const cleanInput = this.pickEntityColumns(input);
    // DEBUG_OBITUARY_BIRTH_DATE_START
    console.warn('[DEBUG_OBITUARY] create() runtime file:', __filename);
    console.warn('[DEBUG_OBITUARY] create() input keys:', Object.keys(input as any));
    console.warn('[DEBUG_OBITUARY] create() cleanInput keys:', Object.keys(cleanInput as any));
    console.warn('[DEBUG_OBITUARY] create() input has birth_date:', (input as any)?.birth_date !== undefined);
    console.warn('[DEBUG_OBITUARY] create() cleanInput has birth_date:', (cleanInput as any)?.birth_date !== undefined);
    // DEBUG_OBITUARY_BIRTH_DATE_END

    const createPayload: DeepPartial<ObituaryInfo> = {
      ...cleanInput,
      ...derivedFields,
      created_by,
    };

    // hard guard (even if something reintroduces it)
    if ('birth_date' in createPayload) {
      delete createPayload.birth_date;
    }

    // DEBUG_OBITUARY_BIRTH_DATE_START
    console.warn('[DEBUG_OBITUARY] create() final payload keys:', Object.keys(createPayload));
    console.warn('[DEBUG_OBITUARY] create() final payload has birth_date:', (createPayload as any).birth_date !== undefined);
    // DEBUG_OBITUARY_BIRTH_DATE_END

    const obituaryInfo = this.obituaryInfoRepository.create(createPayload);
    return await this.obituaryInfoRepository.save(obituaryInfo);
  }

  async update(
    id: string,
    input: Partial<CreateObituaryInfoDto>,
    updated_by: string,
  ): Promise<ObituaryInfo> {
    const derivedFields = this.buildDerivedFields(input);
    const cleanInput = this.pickEntityColumns(input);
    // DEBUG_OBITUARY_BIRTH_DATE_START
    console.warn('[DEBUG_OBITUARY] update() runtime file:', __filename);
    console.warn('[DEBUG_OBITUARY] update() input keys:', Object.keys(input as any));
    console.warn('[DEBUG_OBITUARY] update() cleanInput keys:', Object.keys(cleanInput as any));
    console.warn('[DEBUG_OBITUARY] update() input has birth_date:', (input as any)?.birth_date !== undefined);
    console.warn('[DEBUG_OBITUARY] update() cleanInput has birth_date:', (cleanInput as any)?.birth_date !== undefined);
    // DEBUG_OBITUARY_BIRTH_DATE_END

    const updatePayload: any = {
      ...cleanInput,
      ...derivedFields,
      updated_by,
      updated_on: new Date(),
    };

    // hard guard (even if something reintroduces it)
    if ('birth_date' in updatePayload) {
      delete updatePayload.birth_date;
    }

    // DEBUG_OBITUARY_BIRTH_DATE_START
    console.warn('[DEBUG_OBITUARY] update() final payload keys:', Object.keys(updatePayload));
    console.warn('[DEBUG_OBITUARY] update() final payload has birth_date:', (updatePayload as any).birth_date !== undefined);
    // DEBUG_OBITUARY_BIRTH_DATE_END

    await this.obituaryInfoRepository.update(id, updatePayload);
    return await this.findOne(id);
  }

  async delete(id: string, user_id: string): Promise<void> {
    await this.obituaryInfoRepository.update(id, {
        deleted_on: new Date(),
        deleted_by: user_id,
    });
  }

  private toDate(value: any): Date {
    if (!value) return null;
    const dateValue = value instanceof Date ? value : new Date(value);
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  // Example mapping input (from frontend):
  // {
  //   birth_name: 'hanzla',
  //   married_name: 'wife',
  //   current_name: 'Namra Babar',
  //   birth_date: '2009-12-31',
  //   birth_city: 'Sargodha',
  //   birth_state: 'Punjab',
  //   biological_mother_first: 'Babar',
  //   biological_mother_middle: 'Ahmad',
  //   biological_mother_last: 'Sohail',
  //   biological_father_first: 'Babar',
  //   biological_father_middle: 'Ahmad',
  //   biological_father_last: 'Sohail'
  // }
  private buildDerivedFields(
    input: Partial<CreateObituaryInfoDto>,
  ): Partial<ObituaryInfo> {
    const date_of_birth = this.toDate(
      (input as any).birth_date ?? input.date_of_birth,
    );

    const place_of_birth = [input.birth_city, input.birth_state]
      .filter(Boolean)
      .join(', ');

    const father_name = [
      input.biological_father_first,
      input.biological_father_middle,
      input.biological_father_last,
    ]
      .filter(Boolean)
      .join(' ');

    const mother_name = [
      input.biological_mother_first,
      input.biological_mother_middle,
      input.biological_mother_last,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      full_name: input.birth_name ?? input.full_name ?? null,
      birth_name: input.birth_name ?? null,
      married_name: input.married_name ?? null,
      current_name: input.current_name ?? null,
      date_of_birth,
      place_of_birth: place_of_birth || null,
      father_name: father_name || null,
      mother_name: mother_name || null,
    };
  }
}
