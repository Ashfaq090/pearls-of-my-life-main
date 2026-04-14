import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from './subsription.service';

@Injectable()
export class SubscriptionSchedulerService {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Run daily at 2 AM to check for expired subscriptions
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleExpiredSubscriptions() {
    this.logger.log('Checking for expired subscriptions...');
    try {
      await this.subscriptionService.checkAndHandleExpiredSubscriptions();
      this.logger.log('Expired subscription check completed');
    } catch (error) {
      this.logger.error('Error checking expired subscriptions:', error);
    }
  }

  // Run every hour to check for subscriptions expiring soon (within 7 days)
  @Cron(CronExpression.EVERY_HOUR)
  async checkUpcomingExpirations() {
    this.logger.log('Checking for upcoming subscription expirations...');
    // This can be extended to send reminder emails
    try {
      // Future: Add logic to send reminder emails for subscriptions expiring soon
    } catch (error) {
      this.logger.error('Error checking upcoming expirations:', error);
    }
  }
}

