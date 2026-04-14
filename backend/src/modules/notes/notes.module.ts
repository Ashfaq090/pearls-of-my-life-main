import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notes } from '../../entities/notes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notes])
  ],
  controllers: [NotesController],
  providers: [
    NotesService
  ]
})
export class NotesModule {}
