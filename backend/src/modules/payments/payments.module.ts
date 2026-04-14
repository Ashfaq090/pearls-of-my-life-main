import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PayPalService } from './paypal.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule)
  ],
  controllers: [PaymentsController],
  providers: [PayPalService],
  exports: [PayPalService]
})
export class PaymentsModule {}
