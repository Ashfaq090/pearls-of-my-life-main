import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { KeyHolder } from '../../entities/keyholder.entity';
import {
  UserSubscription,
  SubscriptionStatus,
} from '../../entities/user-subscription.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import {
  UploadedContent,
  ContentType,
} from '../../entities/uploaded-content.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { EmailLog, EmailType } from '../../entities/email-log.entity';
import { LegacyVideo } from '../../entities/legacy-video.entity';
import { LegacyImage } from '../../entities/legacy-image.entity';
import { LegacyNote } from '../../entities/legacy-note.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { FilterUsersDto, UserStatusFilter } from './dto/filter-users.dto';
import { FilterUploadsDto } from './dto/filter-uploads.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(KeyHolder)
    private keyHolderRepository: Repository<KeyHolder>,
    @InjectRepository(UserSubscription)
    private subscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(UploadedContent)
    private uploadRepository: Repository<UploadedContent>,
    @InjectRepository(LegacyVideo)
    private legacyVideoRepository: Repository<LegacyVideo>,
    @InjectRepository(LegacyImage)
    private legacyImageRepository: Repository<LegacyImage>,
    @InjectRepository(LegacyNote)
    private legacyNoteRepository: Repository<LegacyNote>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(EmailLog)
    private emailLogRepository: Repository<EmailLog>,
    private emailService: EmailService,
  ) {}

  // Dashboard Stats
  async getStats() {
    const [
      totalUsers,
      totalKeyHolders,
      activeSubscriptions,
      totalPayments,
      payments,
      recentPayments,
      recentUploads,
    ] = await Promise.all([
      this.userRepository.count({ where: { role: UserRole.USER } }),
      this.keyHolderRepository.count(),
      this.subscriptionRepository.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.paymentRepository.count(),
      this.paymentRepository.find(),
      this.paymentRepository.find({
        take: 10,
        order: { created_on: 'DESC' },
        relations: ['user'],
      }),
      this.uploadRepository.find({
        take: 10,
        order: { created_on: 'DESC' },
        relations: ['user'],
      }),
    ]);

    const totalRevenue = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalUsers,
      totalKeyHolders,
      activeSubscriptions,
      totalPayments,
      totalRevenue,
      recentPayments,
      recentUploads,
    };
  }

  // User Management
  async getUsers(filterDto: FilterUsersDto) {
    const { page = 1, limit = 10, search, status } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        '(user.first_name LIKE :search OR user.last_name LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status === UserStatusFilter.ACTIVE) {
      queryBuilder.andWhere('user.is_active = :isActive', { isActive: true });
      queryBuilder.andWhere('user.is_terminated = :isTerminated', {
        isTerminated: false,
      });
    } else if (status === UserStatusFilter.INACTIVE) {
      queryBuilder.andWhere('user.is_active = :isActive', { isActive: false });
    } else if (status === UserStatusFilter.TERMINATED) {
      queryBuilder.andWhere('user.is_terminated = :isTerminated', {
        isTerminated: true,
      });
    }

    queryBuilder.skip(skip).take(limit).orderBy('user.created_on', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'subscriptions',
        'subscriptions.plan',
        'payments',
        'uploadedContent',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async activateUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = true;
    return await this.userRepository.save(user);
  }

  async deactivateUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = false;
    return await this.userRepository.save(user);
  }

  async terminateUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cancel subscriptions
    const subscriptions = await this.subscriptionRepository.find({
      where: { userId: id, status: SubscriptionStatus.ACTIVE },
    });

    for (const sub of subscriptions) {
      sub.status = SubscriptionStatus.CANCELLED;
      await this.subscriptionRepository.save(sub);
    }

    user.is_terminated = true;
    user.is_active = false;
    user.terminated_at = new Date();

    return await this.userRepository.save(user);
  }

  // KeyHolder Management
  async getKeyHolders(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [keyHolders, total] = await this.keyHolderRepository.findAndCount({
      skip,
      take: limit,
      relations: ['user'],
      order: { created_on: 'DESC' },
    });

    return {
      keyHolders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getKeyHolderById(id: string) {
    const keyHolder = await this.keyHolderRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!keyHolder) {
      throw new NotFoundException('KeyHolder not found');
    }

    return keyHolder;
  }

  async deleteKeyHolder(id: string) {
    const keyHolder = await this.keyHolderRepository.findOne({ where: { id } });
    if (!keyHolder) {
      throw new NotFoundException('KeyHolder not found');
    }

    await this.keyHolderRepository.remove(keyHolder);
    return { message: 'KeyHolder deleted successfully' };
  }

  // Upload Management
  async getUploads(filterDto: FilterUploadsDto) {
    const {
      page = 1,
      limit = 10,
      userId,
      contentType,
      startDate,
      endDate,
    } = filterDto;
    const skip = (page - 1) * limit;

    // Build base query conditions
    const whereConditions: any = {};
    if (userId) {
      whereConditions.user_id = userId;
    }
    if (startDate && endDate) {
      whereConditions.created_on = Between(
        new Date(startDate),
        new Date(endDate),
      );
    }

    // Fetch from all legacy tables
    const videoWhere = {
      ...whereConditions,
      source_type: 'video',
      deleted_on: null,
    };
    const audioWhere = {
      ...whereConditions,
      source_type: 'audio',
      deleted_on: null,
    };
    const imageWhere = {
      ...whereConditions,
      deleted_on: null,
    };
    const noteWhere = {
      ...whereConditions,
      deleted_on: null,
    };

    const [videos, audios, images, notes] = await Promise.all([
      // Videos (source_type = 'video')
      contentType && contentType !== 'video'
        ? []
        : this.legacyVideoRepository.find({
            where: videoWhere,
            relations: ['user'],
            order: { created_on: 'DESC' },
          }),
      // Audios (source_type = 'audio')
      contentType && contentType !== 'audio'
        ? []
        : this.legacyVideoRepository.find({
            where: audioWhere,
            relations: ['user'],
            order: { created_on: 'DESC' },
          }),
      // Images
      contentType && contentType !== 'image'
        ? []
        : this.legacyImageRepository.find({
            where: imageWhere,
            relations: ['user'],
            order: { created_on: 'DESC' },
          }),
      // Notes
      contentType && contentType !== 'note'
        ? []
        : this.legacyNoteRepository.find({
            where: noteWhere,
            relations: ['user'],
            order: { created_on: 'DESC' },
          }),
    ]);

    // Combine and map to unified format
    const allUploads: any[] = [
      ...videos.map((v) => ({
        id: v.id,
        user_id: v.user_id,
        user: v.user,
        content_type: 'video',
        title: v.title,
        description: v.description,
        url: v.url,
        source_type: v.source_type,
        duration: v.duration,
        size: null,
        created_on: v.created_on,
        table: 'legacy_videos',
      })),
      ...audios.map((a) => ({
        id: a.id,
        user_id: a.user_id,
        user: a.user,
        content_type: 'audio',
        title: a.title,
        description: a.description,
        url: a.url,
        source_type: a.source_type,
        duration: a.duration,
        size: null,
        created_on: a.created_on,
        table: 'legacy_videos',
      })),
      ...images.map((i) => ({
        id: i.id,
        user_id: i.user_id,
        user: i.user,
        content_type: 'image',
        title: i.title,
        description: i.description,
        url: i.image_url || i.image_path,
        source_type: 'upload',
        duration: null,
        size: null, // size column doesn't exist in legacy_images table
        created_on: i.created_on,
        table: 'legacy_images',
      })),
      ...notes.map((n) => ({
        id: n.id,
        user_id: n.user_id,
        user: n.user,
        content_type: 'note',
        title: n.title,
        description: n.content,
        url: null,
        source_type: 'upload',
        duration: null,
        size: null,
        created_on: n.created_on,
        table: 'legacy_notes',
      })),
    ];

    // Filter by contentType if specified (already filtered in queries, but keep for safety)
    let filteredUploads = allUploads;
    if (contentType) {
      filteredUploads = allUploads.filter(
        (u) => u.content_type === contentType,
      );
    }

    // Sort by created_on descending
    filteredUploads.sort(
      (a, b) =>
        new Date(b.created_on).getTime() - new Date(a.created_on).getTime(),
    );

    // Paginate
    const total = filteredUploads.length;
    const paginatedUploads = filteredUploads.slice(skip, skip + limit);

    return {
      uploads: paginatedUploads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteUpload(id: string, table?: string) {
    // Determine which repository to use based on table or try all
    let deleted = false;

    if (table === 'legacy_videos' || !table) {
      const video = await this.legacyVideoRepository.findOne({
        where: { id, deleted_on: null },
      });
      if (video) {
        await this.legacyVideoRepository.softDelete(id);
        deleted = true;
      }
    }

    if (table === 'legacy_images' || (!table && !deleted)) {
      const image = await this.legacyImageRepository.findOne({
        where: { id, deleted_on: null },
      });
      if (image) {
        await this.legacyImageRepository.softDelete(id);
        deleted = true;
      }
    }

    if (table === 'legacy_notes' || (!table && !deleted)) {
      const note = await this.legacyNoteRepository.findOne({
        where: { id, deleted_on: null },
      });
      if (note) {
        await this.legacyNoteRepository.softDelete(id);
        deleted = true;
      }
    }

    // Fallback to uploaded_content if still not found
    if (!deleted) {
      const upload = await this.uploadRepository.findOne({ where: { id } });
      if (upload) {
        await this.uploadRepository.softDelete(id);
        deleted = true;
      }
    }

    if (!deleted) {
      throw new NotFoundException('Upload not found');
    }

    return { message: 'Upload deleted successfully' };
  }

  // Plan Management
  async getPlans() {
    return await this.planRepository.find({ order: { price: 'ASC' } });
  }

  async createPlan(createPlanDto: CreatePlanDto) {
    // Map camelCase DTO to camelCase entity (TypeORM will convert to snake_case in DB)
    const planData: any = {
      name: createPlanDto.name,
      price: createPlanDto.price,
      description: createPlanDto.description,
      features: createPlanDto.features,
      isActive: createPlanDto.isActive ?? true,
      billing_period: createPlanDto.billing_period || 'monthly',
      // Video limits
      videoRecordingAllowed: createPlanDto.videoRecordingAllowed ?? false,
      maxVideoLengthInSeconds: createPlanDto.maxVideoLengthInSeconds ?? 0,
      maxVideoUploads: createPlanDto.maxVideoUploads ?? 0,
      // Audio limits
      audioRecordingAllowed: createPlanDto.audioRecordingAllowed ?? false,
      maxAudioLengthInSeconds: createPlanDto.maxAudioLengthInSeconds ?? 0,
      maxAudioUploads: createPlanDto.maxAudioUploads ?? 0,
      // Other limits
      max_images: createPlanDto.max_images ?? 0,
      maxNotes: createPlanDto.maxNotes ?? 0,
      // Legacy fields
      max_video_length: createPlanDto.max_video_length ?? 0,
      max_uploads: createPlanDto.max_uploads ?? 0,
    };
    const plan = this.planRepository.create(planData);
    return await this.planRepository.save(plan);
  }

  async updatePlan(id: string, updatePlanDto: UpdatePlanDto) {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Map camelCase DTO to camelCase entity (TypeORM will convert to snake_case in DB)
    if (updatePlanDto.name !== undefined) plan.name = updatePlanDto.name;
    if (updatePlanDto.price !== undefined) plan.price = updatePlanDto.price;
    if (updatePlanDto.description !== undefined)
      plan.description = updatePlanDto.description;
    if (updatePlanDto.features !== undefined)
      plan.features = updatePlanDto.features;
    if (updatePlanDto.isActive !== undefined)
      plan.isActive = updatePlanDto.isActive;
    if (updatePlanDto.billing_period !== undefined)
      plan.billing_period = updatePlanDto.billing_period;

    // Video limits
    if (updatePlanDto.videoRecordingAllowed !== undefined)
      plan.videoRecordingAllowed = updatePlanDto.videoRecordingAllowed;
    if (updatePlanDto.maxVideoLengthInSeconds !== undefined)
      plan.maxVideoLengthInSeconds = updatePlanDto.maxVideoLengthInSeconds;
    if (updatePlanDto.maxVideoUploads !== undefined)
      plan.maxVideoUploads = updatePlanDto.maxVideoUploads;

    // Audio limits
    if (updatePlanDto.audioRecordingAllowed !== undefined)
      plan.audioRecordingAllowed = updatePlanDto.audioRecordingAllowed;
    if (updatePlanDto.maxAudioLengthInSeconds !== undefined)
      plan.maxAudioLengthInSeconds = updatePlanDto.maxAudioLengthInSeconds;
    if (updatePlanDto.maxAudioUploads !== undefined)
      plan.maxAudioUploads = updatePlanDto.maxAudioUploads;

    // Other limits
    if (updatePlanDto.max_images !== undefined)
      plan.max_images = updatePlanDto.max_images;
    if (updatePlanDto.maxNotes !== undefined)
      plan.maxNotes = updatePlanDto.maxNotes;

    // Legacy fields
    if (updatePlanDto.max_video_length !== undefined)
      plan.max_video_length = updatePlanDto.max_video_length;
    if (updatePlanDto.max_uploads !== undefined)
      plan.max_uploads = updatePlanDto.max_uploads;

    return await this.planRepository.save(plan);
  }

  async deletePlan(id: string) {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { planId: id, status: SubscriptionStatus.ACTIVE },
    });

    if (activeSubscriptions > 0) {
      throw new Error('Cannot delete plan with active subscriptions');
    }

    await this.planRepository.remove(plan);
    return { message: 'Plan deleted successfully' };
  }

  // Subscription Management
  async getSubscriptions(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [subscriptions, total] =
      await this.subscriptionRepository.findAndCount({
        skip,
        take: limit,
        relations: ['user', 'plan'],
        order: { created_on: 'DESC' },
      });

    return {
      subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async cancelSubscription(id: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    return await this.subscriptionRepository.save(subscription);
  }

  async changePlan(subscriptionId: string, newPlanId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const newPlan = await this.planRepository.findOne({
      where: { id: newPlanId },
    });
    if (!newPlan) {
      throw new NotFoundException('Plan not found');
    }

    subscription.planId = newPlanId;
    return await this.subscriptionRepository.save(subscription);
  }

  // Payment Management
  async getPayments(
    page: number = 1,
    limit: number = 10,
    userId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    if (userId) {
      queryBuilder.andWhere('payment.user_id = :userId', { userId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'payment.created_on BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    queryBuilder.skip(skip).take(limit).orderBy('payment.created_on', 'DESC');
    queryBuilder.leftJoinAndSelect('payment.user', 'user');

    const [payments, total] = await queryBuilder.getManyAndCount();

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Email Logs
  async getEmailLogs(
    page: number = 1,
    limit: number = 10,
    userId?: string,
    emailType?: EmailType,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.emailLogRepository.createQueryBuilder('emailLog');

    if (userId) {
      queryBuilder.andWhere('emailLog.user_id = :userId', { userId });
    }

    if (emailType) {
      queryBuilder.andWhere('emailLog.email_type = :emailType', { emailType });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'emailLog.created_at BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    queryBuilder.skip(skip).take(limit).orderBy('emailLog.created_at', 'DESC');
    queryBuilder.leftJoinAndSelect('emailLog.user', 'user');

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Log email (helper method for email service)
  async logEmail(
    userId: string | null,
    recipientEmail: string,
    subject: string,
    emailType: EmailType,
    content: string,
    sent: boolean,
    errorMessage?: string,
  ) {
    const emailLog = this.emailLogRepository.create({
      user_id: userId,
      recipient_email: recipientEmail,
      subject,
      email_type: emailType,
      content,
      sent,
      error_message: errorMessage,
    });

    return await this.emailLogRepository.save(emailLog);
  }
}
