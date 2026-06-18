import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan, UserSubscription, Payment } from '../../entities';
import { PaymentsController } from './payment.controller';
import { PaymentsService } from './payment.service';
import { SubscriptionService } from './subsription.service';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([SubscriptionPlan, UserSubscription, Payment]),
    forwardRef(() => EmailModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AdminModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, SubscriptionService, SubscriptionSchedulerService],
  exports: [PaymentsService, SubscriptionService],
})
export class PaymentsModule {}
