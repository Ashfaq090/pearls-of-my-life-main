import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { UsersService } from '../users/users.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paypalService: PayPalService,
    private readonly usersService: UsersService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Headers() headers, @Body() body) {
    // In a real app, verify signature here using paypalService.verifyWebhookSignature
    const eventType = body.event_type;
    const resource = body.resource;

    this.logger.log(`Received PayPal Webhook: ${eventType}`);

    try {
      switch (eventType) {
        case 'BILLING.SUBSCRIPTION.CANCELLED':
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
        case 'BILLING.SUBSCRIPTION.EXPIRED':
          // Find user by subscription ID and deactivate/downgrade
          // Assuming user entity has subscription_id
          // await this.usersService.handleSubscriptionCancellation(resource.id);
          break;

        case 'PAYMENT.SALE.COMPLETED':
          // Handle successful payment
          break;

        case 'PAYMENT.SALE.DENIED':
          // Handle failed payment
          break;
      }
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      throw new BadRequestException('Failed to process webhook');
    }

    return { status: 'success' };
  }
}
