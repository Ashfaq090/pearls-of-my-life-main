import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as fs from 'fs';
import { join, normalize } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLegacyVideoDto } from './dto/create-legacy-video.dto';
import { CreateLegacyImageDto } from './dto/create-legacy-image.dto';
import { CreateLegacyNoteDto } from './dto/create-legacy-note.dto';
import { LegacyVideo } from '../../entities/legacy-video.entity';
import { LegacyImage } from '../../entities/legacy-image.entity';
import { LegacyNote } from '../../entities/legacy-note.entity';
import { SubscriptionService } from '../payment/subsription.service';
import {
  UserSubscription,
  SubscriptionStatus,
} from '../../entities/user-subscription.entity';

@Injectable()
export class LegacyService {
  constructor(
    @InjectRepository(LegacyVideo)
    private readonly legacyVideoRepository: Repository<LegacyVideo>,
    @InjectRepository(LegacyImage)
    private readonly legacyImageRepository: Repository<LegacyImage>,
    @InjectRepository(LegacyNote)
    private readonly legacyNoteRepository: Repository<LegacyNote>,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
  ) {}

  private resolveUploadsDir(): string {
    const cwd = process.cwd();
    const candidates = [
      join(cwd, 'uploads'), // when started inside backend/
      join(cwd, 'backend', 'uploads'), // when started from repo root
    ];
    return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
  }

  private tryDeleteUploadByUrl(urlOrPath?: string | null): void {
    if (!urlOrPath || typeof urlOrPath !== 'string') return;

    // Expected stored value is usually: "/uploads/legacy/videos/<file>.webm"
    // Convert to a relative path inside uploads root.
    const relative = urlOrPath.startsWith('/uploads/')
      ? urlOrPath.replace(/^\/uploads\//, '')
      : urlOrPath;

    const uploadsRoot = this.resolveUploadsDir();
    const candidate = normalize(join(uploadsRoot, relative));

    // Prevent path traversal: only allow deletes within uploadsRoot
    if (!candidate.startsWith(uploadsRoot)) return;

    if (fs.existsSync(candidate)) {
      fs.unlinkSync(candidate);
    }
  }

  private async checkPlanLimits(
    userId: string,
    type: 'video' | 'audio' | 'image' | 'note',
  ): Promise<void> {
    const subscription =
      await this.subscriptionService.getUserSubscription(userId);

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        'Active subscription required to upload content',
      );
    }

    const plan = subscription.plan;

    if (type === 'video') {
      // Check if video recording/upload is allowed
      if (plan.videoRecordingAllowed === false) {
        throw new BadRequestException(
          'Video recording and uploads are not allowed in your current plan',
        );
      }

      // Check video count limit
      const videoCount = await this.legacyVideoRepository.count({
        where: { user_id: userId },
      });

      const maxVideoUploads =
        plan.maxVideoUploads || plan.max_video_length || 0;
      if (maxVideoUploads > 0 && videoCount >= maxVideoUploads) {
        throw new BadRequestException(
          `Video upload limit reached. Maximum allowed: ${maxVideoUploads} videos`,
        );
      }

      // Check video length limit
      const userVideos = await this.legacyVideoRepository.find({
        where: { user_id: userId },
      });
      const totalVideoLength = userVideos.reduce(
        (sum, v) => sum + (v.duration || 0),
        0,
      );
      const maxLength =
        plan.maxVideoLengthInSeconds || plan.max_video_length || 0;

      if (maxLength > 0 && totalVideoLength >= maxLength) {
        throw new BadRequestException(
          `Video length limit reached. Maximum allowed: ${maxLength} seconds total`,
        );
      }
    } else if (type === 'audio') {
      // Check if audio recording/upload is allowed
      if (plan.audioRecordingAllowed === false) {
        throw new BadRequestException(
          'Audio recording and uploads are not allowed in your current plan',
        );
      }

      // Check audio count limit (using legacy video repository for now, should have separate audio entity)
      const audioCount = await this.legacyVideoRepository.count({
        where: { user_id: userId, source_type: 'audio' },
      });

      const maxAudioUploads = plan.maxAudioUploads || 0;
      if (maxAudioUploads > 0 && audioCount >= maxAudioUploads) {
        throw new BadRequestException(
          `Audio upload limit reached. Maximum allowed: ${maxAudioUploads} audio files`,
        );
      }

      // Check audio length limit
      const userAudios = await this.legacyVideoRepository.find({
        where: { user_id: userId, source_type: 'audio' },
      });
      const totalAudioLength = userAudios.reduce(
        (sum, a) => sum + (a.duration || 0),
        0,
      );
      const maxAudioLength = plan.maxAudioLengthInSeconds || 0;

      if (maxAudioLength > 0 && totalAudioLength >= maxAudioLength) {
        throw new BadRequestException(
          `Audio length limit reached. Maximum allowed: ${maxAudioLength} seconds total`,
        );
      }
    } else if (type === 'image') {
      // Check image count limit
      const imageCount = await this.legacyImageRepository.count({
        where: { user_id: userId },
      });

      const maxImages = plan.max_images || 0;
      if (maxImages > 0 && imageCount >= maxImages) {
        throw new BadRequestException(
          `Image upload limit reached. Maximum allowed: ${maxImages} images`,
        );
      }
    } else if (type === 'note') {
      // Check note count limit
      const noteCount = await this.legacyNoteRepository.count({
        where: { user_id: userId },
      });

      const maxNotes = plan.maxNotes || 0;
      if (maxNotes > 0 && noteCount >= maxNotes) {
        throw new BadRequestException(
          `Note limit reached. Maximum allowed: ${maxNotes} notes`,
        );
      }
    }
  }

  async createVideo(
    userId: string,
    createLegacyVideoDto: CreateLegacyVideoDto,
  ): Promise<LegacyVideo> {
    // Check subscription limits
    // await this.checkPlanLimits(userId, 'video');

    // Check video length if provided
    if (createLegacyVideoDto.duration) {
      const subscription =
        await this.subscriptionService.getUserSubscription(userId);
      if (subscription) {
        const maxLength =
          subscription.plan.maxVideoLengthInSeconds ||
          subscription.plan.max_video_length ||
          0;
        if (maxLength > 0) {
          const existingVideos = await this.legacyVideoRepository.find({
            where: { user_id: userId, source_type: 'video' },
          });
          const totalLength = existingVideos.reduce(
            (sum, v) => sum + (v.duration || 0),
            0,
          );

          if (totalLength + createLegacyVideoDto.duration > maxLength) {
            throw new BadRequestException(
              `Video length exceeds plan limit. Maximum allowed: ${maxLength} seconds total. Current usage: ${totalLength} seconds.`,
            );
          }
        }
      }
    }

    const video = this.legacyVideoRepository.create({
      ...createLegacyVideoDto,
      user_id: userId,
      source_type: createLegacyVideoDto.source_type || 'video',
      created_by: userId,
      updated_by: userId,
    });
    return await this.legacyVideoRepository.save(video);
  }

  async createAudio(
    userId: string,
    createLegacyVideoDto: CreateLegacyVideoDto,
  ): Promise<LegacyVideo> {
    // Check subscription limits
    await this.checkPlanLimits(userId, 'audio');

    // Check audio length if provided
    if (createLegacyVideoDto.duration) {
      const subscription =
        await this.subscriptionService.getUserSubscription(userId);
      if (subscription) {
        const maxLength = subscription.plan.maxAudioLengthInSeconds || 0;
        if (maxLength > 0) {
          const existingAudios = await this.legacyVideoRepository.find({
            where: { user_id: userId, source_type: 'audio' },
          });
          const totalLength = existingAudios.reduce(
            (sum, a) => sum + (a.duration || 0),
            0,
          );

          if (totalLength + createLegacyVideoDto.duration > maxLength) {
            throw new BadRequestException(
              `Audio length exceeds plan limit. Maximum allowed: ${maxLength} seconds total. Current usage: ${totalLength} seconds.`,
            );
          }
        }
      }
    }

    const audio = this.legacyVideoRepository.create({
      ...createLegacyVideoDto,
      user_id: userId,
      source_type: 'audio',
      created_by: userId,
      updated_by: userId,
    });
    return await this.legacyVideoRepository.save(audio);
  }

  async createImage(
    userId: string,
    createLegacyImageDto: CreateLegacyImageDto,
  ): Promise<LegacyImage> {
    // Check subscription limits
    await this.checkPlanLimits(userId, 'image');

    const image = this.legacyImageRepository.create({
      title: createLegacyImageDto.title,
      description: createLegacyImageDto.description,
      image_path: createLegacyImageDto.url, // Map url to image_path
      image_url: null, // Can be set later if needed
      user_id: userId,
      created_by: userId,
      updated_by: userId,
    });
    return await this.legacyImageRepository.save(image);
  }

  async createNote(
    userId: string,
    createLegacyNoteDto: CreateLegacyNoteDto,
  ): Promise<LegacyNote> {
    // Check subscription limits
    await this.checkPlanLimits(userId, 'note');

    const note = this.legacyNoteRepository.create({
      ...createLegacyNoteDto,
      user_id: userId,
      created_by: userId,
      updated_by: userId,
    });
    return await this.legacyNoteRepository.save(note);
  }

  async findAllVideos(userId: string): Promise<LegacyVideo[]> {
    return await this.legacyVideoRepository.find({
      where: { user_id: userId, deleted_on: null },
    });
  }

  async getVideosPaginated(
    userId: string,
    page: number = 1,
    limit: number = 12,
    stage?: string,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.legacyVideoRepository
      .createQueryBuilder('video')
      .where('video.user_id = :userId', { userId })
      .andWhere('video.deleted_on IS NULL')
      .andWhere(
        '(video.source_type = :videoType OR video.source_type = :uploadType)',
        {
          videoType: 'video',
          uploadType: 'upload',
        },
      )
      .orderBy('video.created_on', 'DESC')
      .skip(skip)
      .take(limit);

    if (stage) {
      queryBuilder.andWhere('video.stage_label = :stage', { stage });
    }

    const [videos, total] = await queryBuilder.getManyAndCount();

    return {
      data: videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAudiosPaginated(
    userId: string,
    page: number = 1,
    limit: number = 12,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const [audios, total] = await this.legacyVideoRepository.findAndCount({
      where: {
        user_id: userId,
        deleted_on: null,
        source_type: 'audio',
      },
      order: { created_on: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: audios,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteVideo(userId: string, videoId: string): Promise<void> {
    const video = await this.legacyVideoRepository.findOne({
      where: {
        id: videoId,
        user_id: userId,
        source_type: 'video',
        deleted_on: null,
      },
    });

    if (!video) {
      throw new BadRequestException('Video not found');
    }

    await this.legacyVideoRepository.update(videoId, {
      deleted_on: new Date(),
    });

    // Best-effort physical delete (keep soft-delete as source of truth)
    try {
      this.tryDeleteUploadByUrl(video.url);
    } catch {
      // ignore file delete errors
    }
  }

  async deleteAudio(userId: string, audioId: string): Promise<void> {
    const audio = await this.legacyVideoRepository.findOne({
      where: {
        id: audioId,
        user_id: userId,
        source_type: 'audio',
        deleted_on: null,
      },
    });

    if (!audio) {
      throw new BadRequestException('Audio not found');
    }

    await this.legacyVideoRepository.update(audioId, {
      deleted_on: new Date(),
    });
  }

  async deleteImage(userId: string, imageId: string): Promise<void> {
    const image = await this.legacyImageRepository.findOne({
      where: {
        id: imageId,
        user_id: userId,
        deleted_on: null,
      },
    });

    if (!image) {
      throw new BadRequestException('Image not found');
    }

    await this.legacyImageRepository.update(imageId, {
      deleted_on: new Date(),
    });
  }

  async findAllImages(userId: string): Promise<LegacyImage[]> {
    return await this.legacyImageRepository.find({
      where: { user_id: userId, deleted_on: null },
    });
  }

  async findAllNotes(userId: string): Promise<LegacyNote[]> {
    return await this.legacyNoteRepository.find({
      where: { user_id: userId, deleted_on: null },
    });
  }
}
