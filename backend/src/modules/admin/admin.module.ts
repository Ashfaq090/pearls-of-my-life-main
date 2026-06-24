import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../entities/user.entity';
import { KeyHolder } from '../../entities/keyholder.entity';
import { UserSubscription } from '../../entities/user-subscription.entity';
import { Payment } from '../../entities/payment.entity';
import { UploadedContent } from '../../entities/uploaded-content.entity';
import { LegacyVideo } from '../../entities/legacy-video.entity';
import { LegacyImage } from '../../entities/legacy-image.entity';
import { LegacyNote } from '../../entities/legacy-note.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { EmailLog } from '../../entities/email-log.entity';
import { EmailModule } from '../email/email.module';
import { KeyHoldersModule } from '../key-holders/key-holders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      KeyHolder,
      UserSubscription,
      Payment,
      UploadedContent,
      LegacyVideo,
      LegacyImage,
      LegacyNote,
      SubscriptionPlan,
      EmailLog,
    ]),
    EmailModule,
    forwardRef(() => KeyHoldersModule),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

