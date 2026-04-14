import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserOnlyGuard } from 'src/common/guards/user-only.guard';
import { LegacyService } from './legacy.service';
import { CreateLegacyVideoDto } from './dto/create-legacy-video.dto';
import { CreateLegacyImageDto } from './dto/create-legacy-image.dto';
import { CreateLegacyNoteDto } from './dto/create-legacy-note.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Legacy')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('legacy')
export class LegacyController {
  constructor(private readonly legacyService: LegacyService) {}

  @Post('video')
  @UseGuards(UserOnlyGuard)
  async createVideo(
    @Request() req,
    @Body() createLegacyVideoDto: CreateLegacyVideoDto,
  ) {
    // Ensure source_type is set to 'video' if not provided
    if (!createLegacyVideoDto.source_type) {
      createLegacyVideoDto.source_type = 'video';
    }
    return this.legacyService.createVideo(
      req.user.user_id,
      createLegacyVideoDto,
    );
  }

  @Post('video/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/legacy/videos',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        duration: { type: 'number' },
        stage_label: { type: 'string' },
      },
    },
  })
  async uploadVideo(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body,
  ) {
    // Convert file path to URL (remove './' prefix and replace backslashes with forward slashes)
    const fileUrl = file.path.replace(/^\.\//, '').replace(/\\/g, '/');

    const dto: CreateLegacyVideoDto = {
      title: body.title,
      description: body.description,
      url: `/${fileUrl}`, // Prepend / to make it a URL path
      duration: body.duration ? parseInt(body.duration) : 0,
      source_type: 'video', // Changed from 'upload' to 'video' so it shows in videos list
      stage_label: body.stage_label,
    };
    return this.legacyService.createVideo(req.user.user_id, dto);
  }

  @Post('image')
  @UseGuards(UserOnlyGuard)
  async createImage(
    @Request() req,
    @Body() createLegacyImageDto: CreateLegacyImageDto,
  ) {
    return this.legacyService.createImage(
      req.user.user_id,
      createLegacyImageDto,
    );
  }

  @Post('image/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/legacy/images',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  async uploadImage(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body,
  ) {
    const dto: CreateLegacyImageDto = {
      title: body.title,
      description: body.description,
      url: file.path,
      size: file.size,
    };
    return this.legacyService.createImage(req.user.user_id, dto);
  }

  @Post('note')
  @UseGuards(UserOnlyGuard)
  async createNote(
    @Request() req,
    @Body() createLegacyNoteDto: CreateLegacyNoteDto,
  ) {
    return this.legacyService.createNote(req.user.user_id, createLegacyNoteDto);
  }

  @Post('audio/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/legacy/audio',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        duration: { type: 'number' },
      },
    },
  })
  async uploadAudio(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body,
  ) {
    // Convert file path to URL (remove './' prefix and replace backslashes with forward slashes)
    const fileUrl = file.path.replace(/^\.\//, '').replace(/\\/g, '/');

    const dto: CreateLegacyVideoDto = {
      title: body.title,
      description: body.description,
      url: `/${fileUrl}`, // Prepend / to make it a URL path
      duration: body.duration ? parseInt(body.duration) : 0,
      source_type: 'audio', // Ensure it's set to 'audio' for audio uploads
    };
    return this.legacyService.createAudio(req.user.user_id, dto);
  }

  @Get('videos')
  @UseGuards(UserOnlyGuard)
  async getVideos(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
    @Query('stage') stage?: string,
  ) {
    return this.legacyService.getVideosPaginated(
      req.user.user_id,
      page,
      limit,
      stage,
    );
  }

  @Get('audios')
  @UseGuards(UserOnlyGuard)
  async getAudios(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ) {
    return this.legacyService.getAudiosPaginated(req.user.user_id, page, limit);
  }

  @Delete('video/:id')
  @UseGuards(UserOnlyGuard)
  async deleteVideo(@Request() req, @Param('id') id: string) {
    return this.legacyService.deleteVideo(req.user.user_id, id);
  }

  @Delete('audio/:id')
  @UseGuards(UserOnlyGuard)
  async deleteAudio(@Request() req, @Param('id') id: string) {
    return this.legacyService.deleteAudio(req.user.user_id, id);
  }

  @Delete('image/:id')
  @UseGuards(UserOnlyGuard)
  async deleteImage(@Request() req, @Param('id') id: string) {
    return this.legacyService.deleteImage(req.user.user_id, id);
  }

  @Get('content')
  async findAll(@Request() req) {
    const videos = await this.legacyService.findAllVideos(req.user.user_id);
    const images = await this.legacyService.findAllImages(req.user.user_id);
    const notes = await this.legacyService.findAllNotes(req.user.user_id);
    // Get audios (stored as videos with source_type='audio')
    const allContent = await this.legacyService.findAllVideos(req.user.user_id);
    const audios = allContent.filter((c) => c.source_type === 'audio');
    const videoList = allContent.filter(
      (c) => c.source_type === 'video' || !c.source_type,
    );
    return { videos: videoList, audios, images, notes };
  }
}
