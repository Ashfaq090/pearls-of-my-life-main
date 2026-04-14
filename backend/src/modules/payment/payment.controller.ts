import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
  Logger,
  Query,
} from '@nestjs/common';
import { AuthGraud } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payment.service';
import { SubscriptionService } from './subsription.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get('subscription-plans')
  async getSubscriptionPlans() {
    return this.subscriptionService.getAllPlans();
  }

  @Get('my-subscription')
  @UseGuards(AuthGraud)
  async getCurrentSubscription(@CurrentUser() user: any) {
    const subscription = await this.subscriptionService.getUserSubscription(
      user.user_id || user.id,
    );
    // Return subscription with plan details or null if no subscription
    return subscription || { status: 'inactive', plan: null };
  }

  @Get('payment-history')
  @UseGuards(AuthGraud)
  async getPaymentHistory(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    console.log(`Fetching payment history for user ${user.user_id || user.id}, page ${page}, limit ${limit}`);
    const skip = (page - 1) * limit;
    const payments = await this.paymentsService.getUserPayments(
      user.user_id || user.id,
      skip,
      limit,
    );
    return payments;
  }

  @Post('create-order')
  @UseGuards(AuthGraud)
  async createOrder(
    @Body('amount') amount: number,
    @Body('planId') planId: string,
    @CurrentUser() user: any,
  ) {
    let finalAmount = amount;

    if (planId) {
      const plan = await this.subscriptionService.getPlanById(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }
      finalAmount = await this.subscriptionService.computeEffectiveYearlyCharge(
        user.user_id || user.id,
        plan,
      );
    }

    if (!finalAmount || finalAmount <= 0) {
      throw new Error('Invalid amount');
    }
    const orderId = await this.paymentsService.createOrder(finalAmount);
    return { orderId };
  }

  @Post('capture-order')
  @UseGuards(AuthGraud)
  async captureOrder(
    @Body('orderId') orderId: string,
    @Body('planId') planId: string,
    @CurrentUser() user: any,
  ) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    // Check if this is a dev mode fake order
    const isDevMode =
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV !== 'production';
    const isFakeOrder = orderId.startsWith('dev-order-');

    let payment;
    if (isDevMode && isFakeOrder) {
      // Create fake payment response for dev mode
      this.logger.log(`[DEV MODE] Processing fake order: ${orderId}`);
      payment = {
        id: orderId,
        status: 'COMPLETED',
        payer: {
          name: {
            given_name: 'Dev',
            surname: 'User',
          },
          email_address: user.email || 'dev@example.com',
        },
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: '0.00',
            },
          },
        ],
      };
    } else {
      // Real PayPal payment
      payment = await this.paymentsService.capturePayment(orderId);
    }

    // Create subscription after successful payment
    if (payment.status === 'COMPLETED') {
      const subscription = await this.subscriptionService.createSubscription(
        user.user_id || user.id,
        planId,
        orderId,
      );

      // Save payment record to database
      const plan = await this.subscriptionService.getPlanById(planId);
      if (plan) {
        const effectiveAmount =
          await this.subscriptionService.computeEffectiveYearlyCharge(
            user.user_id || user.id,
            plan,
          );
        await this.paymentsService.savePayment({
          userId: user.user_id || user.id,
          amount: effectiveAmount,
          currency: 'USD',
          status: 'completed',
          paypalOrderId: orderId,
          transactionData: JSON.stringify(payment),
          subscriptionId: subscription?.id,
        });
      }
    }

    return payment;
  }

  @Post('cancel-subscription')
  @UseGuards(AuthGraud)
  async cancelSubscription(
    @Body('subscriptionId') subscriptionId: string,
    @CurrentUser() user: any,
  ) {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }
    return this.subscriptionService.cancelSubscription(
      subscriptionId,
      user.user_id || user.id,
    );
  }

  @Post('webhook')
  async handleWebhook(@Headers() headers, @Body() body) {
    const eventType = body.event_type;
    const resource = body.resource;

    this.logger.log(`Received PayPal Webhook: ${eventType}`);

    try {
      switch (eventType) {
        case 'BILLING.SUBSCRIPTION.CANCELLED':
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
        case 'BILLING.SUBSCRIPTION.EXPIRED':
          // Find subscription by PayPal subscription ID
          const subscription =
            await this.subscriptionService.getUserSubscriptionByPayPalId(
              resource.id,
            );
          if (subscription) {
            await this.subscriptionService.cancelSubscription(
              subscription.id,
              subscription.userId,
            );
            this.logger.log(
              `Subscription ${subscription.id} cancelled via PayPal webhook`,
            );
          }
          break;

        case 'PAYMENT.SALE.COMPLETED':
          // Handle successful payment
          this.logger.log('Payment completed successfully');
          break;

        case 'PAYMENT.SALE.DENIED':
        case 'PAYMENT.SALE.REFUNDED':
          // Handle failed/refunded payment
          const failedSubscription =
            await this.subscriptionService.getUserSubscriptionByPayPalId(
              resource.billing_agreement_id,
            );
          if (failedSubscription) {
            await this.subscriptionService.handlePaymentFailure(
              failedSubscription.id,
              'Payment was denied or refunded',
            );
          }
          break;
      }
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      // Don't throw error to PayPal - return success to acknowledge receipt
    }

    return { status: 'success' };
  }
}
