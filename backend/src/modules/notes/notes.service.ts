import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Notes } from '../../entities/notes.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update.note.dto';
import { FilterNotesDto } from './dto/filter-notes.dto';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Notes)
    private readonly notesRepository: Repository<Notes>,
  ) {}

  async findAll(
    pageOptions: FilterNotesDto,
    user_id: string,
  ): Promise<PaginateDto<Notes>> {
    const page = pageOptions.page || 1;
    const pageSize = pageOptions.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {
      user_id,
      deleted_on: null,
    };

    if (pageOptions?.heading) {
      where.title = Like(`%${pageOptions.heading}%`);
    }

    if (pageOptions?.year) {
      const startDate = new Date(`${+pageOptions.year}-01-01`);
      const endDate = new Date(`${+pageOptions.year + 1}-01-01`);
      where.note_date = Between(startDate, endDate);
    }

    const [data, total] = await this.notesRepository.findAndCount({
      where,
      order: {
        [pageOptions.order_key || 'note_date']: pageOptions.order || 'DESC',
      },
      take: pageSize,
      skip: skip,
    });

    // Map database field names to frontend field names
    const mappedData = data.map((note) => ({
      ...note,
      heading: note.title, // Map title -> heading for frontend
      description: note.content, // Map content -> description for frontend
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

  async findOne(id: string): Promise<Notes> {
    const note = await this.notesRepository.findOne({
      where: {
        deleted_on: null,
        id,
      },
    });

    // Map database field names to frontend field names
    if (note) {
      return {
        ...note,
        heading: note.title, // Map title -> heading for frontend
        description: note.content, // Map content -> description for frontend
      } as any;
    }
    return note;
  }

  async create(input: CreateNoteDto, created_by: string): Promise<Notes> {
    // Map frontend field names to database field names
    const note = this.notesRepository.create({
      title: input.heading, // Map heading -> title
      content: input.description, // Map description -> content
      note_date: input.note_date ? new Date(input.note_date) : new Date(),
      category: input.category,
      is_pinned: input.is_pinned || false,
      user_id: input.user_id,
      created_by: created_by,
    });
    return await this.notesRepository.save(note);
  }

  async update(
    input: UpdateNoteDto,
    id: string,
    user_id: string,
  ): Promise<Notes> {
    // Map frontend field names to database field names
    const updateData: any = {
      updated_on: new Date(),
      updated_by: user_id,
    };

    if (input.heading !== undefined) {
      updateData.title = input.heading; // Map heading -> title
    }
    if (input.description !== undefined) {
      updateData.content = input.description; // Map description -> content
    }
    if (input.note_date !== undefined) {
      updateData.note_date = new Date(input.note_date);
    }
    if (input.category !== undefined) {
      updateData.category = input.category;
    }
    if (input.is_pinned !== undefined) {
      updateData.is_pinned = input.is_pinned;
    }

    await this.notesRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async delete(id: string, user_id) {
    await this.notesRepository.update(id, {
      deleted_on: new Date(),
      deleted_by: user_id,
    });
  }
}
