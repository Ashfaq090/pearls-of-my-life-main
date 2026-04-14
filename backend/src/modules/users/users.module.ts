import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';
import { UserSubscription } from '../../entities/user-subscription.entity';
import { PaymentsModule } from '../payments/payments.module';
import { EmailModule } from '../email/email.module';
import { PaymentsModule as PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSubscription]),
    forwardRef(() => PaymentsModule),
    forwardRef(() => EmailModule),
    forwardRef(() => PaymentModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
