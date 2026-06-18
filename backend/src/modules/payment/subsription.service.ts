import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionStatus,
} from '../../entities';
import { PaymentsService } from './payment.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SubscriptionService {
  private readonly NEW_FEATURE_BULLETS: string[] = [];
  private readonly REMOVED_FEATURE_BULLETS = [
    'more detailed life information such as achievements, diplomas, friends, employment, etc.',
    'Schools (Dates & Degrees)',
    'Employment (Titles & Dates)',
    'Career Achievements (Titles & Dates)',
    'Church Affiliation /Titles held/ year joined',
    'Other Achievements',
    'Club Memberships',
    'Other Group Affiliations etc',
    'Greatest Friendships',
    'Special Instructions',
  ];

  private mergeAndDedupeFeatures(existing: string[]): string[] {
    const seen = new Set<string>();
    const merged: string[] = [];
    const add = (item: string) => {
      const key = item.trim();
      if (
        this.REMOVED_FEATURE_BULLETS.some(
          (removed) => removed.toLowerCase() === key.toLowerCase(),
        )
      ) {
        return;
      }
      if (!key || seen.has(key)) return;
      seen.add(key);
      merged.push(key);
    };

    existing.forEach(add);
    this.NEW_FEATURE_BULLETS.forEach(add);
    return merged;
  }

  private normalizeFeatures(features: any): string[] {
    if (!features) return [];
    if (Array.isArray(features)) return features.map((f) => String(f));
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) return parsed.map((f) => String(f));
      } catch {
        return features.split(',').map((f) => f.trim());
      }
    }
    return [];
  }

  private getYearlyPrice(plan: SubscriptionPlan): number {
    const monthly = Number(plan?.price ?? 0);
    if (plan?.billing_period === 'annual') {
      return monthly;
    }
    return monthly * 12;
  }

  private sanitizeDescription(description?: string): string {
    if (!description) return description;
    let result = description;
    this.REMOVED_FEATURE_BULLETS.forEach((phrase) => {
      result = result.replace(phrase, '');
    });
    return result.replace(/\s+/g, ' ').trim();
  }

  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private userSubscriptionRepository: Repository<UserSubscription>,
    private paymentService: PaymentsService,
    @Inject(forwardRef(() => EmailService))
    private emailService: EmailService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async getAllPlans() {
    try {
      const plans = await this.subscriptionPlanRepository.find({
        where: { isActive: true },
      });
      return plans
        .filter((plan) => plan.name !== 'Ultimate Legacy Creation Plan')
        .map((plan) => {
        const existing = this.normalizeFeatures(plan.features);
        const merged = this.mergeAndDedupeFeatures(existing);
        return {
          ...plan,
          features: JSON.stringify(merged),
          description: this.sanitizeDescription(plan.description),
        };
      });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw new Error('Failed to fetch subscription plans');
    }
  }

  async getPlanById(planId: string) {
    try {
      return await this.subscriptionPlanRepository.findOne({
        where: { id: planId },
      });
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
      throw new Error('Failed to fetch subscription plan');
    }
  }

  async getUserSubscription(userId: string) {
    try {
      return await this.userSubscriptionRepository.findOne({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
        },
        relations: ['plan'],
      });
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw new Error('Failed to fetch user subscription');
    }
  }

  async computeEffectiveYearlyCharge(
    userId: string,
    targetPlan: SubscriptionPlan,
  ): Promise<number> {
    const targetYearly = this.getYearlyPrice(targetPlan);
    const current = await this.getUserSubscription(userId).catch(() => null);
    const currentPlan = current?.plan as SubscriptionPlan | undefined;
    const currentYearly = currentPlan ? this.getYearlyPrice(currentPlan) : 0;

    if (targetYearly === 84 && currentYearly === 36) {
      return 48;
    }
    return targetYearly;
  }

  async createSubscription(
    userId: string,
    planId: string,
    paypalOrderId: string,
  ) {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Calculate subscription end date based on effective yearly charge
    const startDate = new Date();
    const endDate = new Date();
    const effectiveYearly = await this.computeEffectiveYearlyCharge(
      userId,
      plan,
    );
    const shouldBeAnnual =
      plan.billing_period === 'annual' || effectiveYearly > plan.price;

    if (shouldBeAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = this.userSubscriptionRepository.create({
      userId,
      planId,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
      paypalOrderId,
    });

    return await this.userSubscriptionRepository.save(subscription);
  }

  async cancelSubscription(subscriptionId: string, userId: string) {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Cancel PayPal subscription if exists
    if (subscription.paypalSubscriptionId) {
      try {
        await this.paymentService.cancelPayPalSubscription(
          subscription.paypalSubscriptionId,
        );
      } catch (error) {
        console.error('Failed to cancel PayPal subscription:', error);
      }
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    return await this.userSubscriptionRepository.save(subscription);
  }

  async checkAndHandleExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    const expiredSubscriptions = await this.userSubscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(now),
      },
      relations: ['plan', 'user'],
    });

    for (const subscription of expiredSubscriptions) {
      // Update subscription status
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.userSubscriptionRepository.save(subscription);

      // Send email notification
      if (subscription.user) {
        try {
          await this.emailService.sendSubscriptionExpiryEmail(
            subscription.user,
            subscription,
          );
        } catch (error) {
          console.error(
            `Failed to send expiry email for subscription ${subscription.id}:`,
            error,
          );
        }
      }
    }
  }

  async handlePaymentFailure(
    subscriptionId: string,
    errorMessage?: string,
  ): Promise<void> {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ['plan', 'user'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Mark subscription as suspended
    subscription.status = SubscriptionStatus.SUSPENDED;
    await this.userSubscriptionRepository.save(subscription);

    // Send email notification
    if (subscription.user) {
      try {
        await this.emailService.sendPaymentFailedEmail(
          subscription.user,
          subscription,
          errorMessage,
        );
      } catch (error) {
        console.error(`Failed to send payment failure email:`, error);
      }
    }
  }

  async getUserSubscriptionByPayPalId(
    paypalSubscriptionId: string,
  ): Promise<UserSubscription | null> {
    return await this.userSubscriptionRepository.findOne({
      where: { paypalSubscriptionId },
      relations: ['plan', 'user'],
    });
  }

  async subscribeViaPromo(userId: string, planId: string, promoCode: string) {

    const isPromoUserExists = await this.usersService.findOneByPromo(userId, planId, promoCode); 

    if(!isPromoUserExists) {
      throw new NotFoundException('Promo not found');
    } 

    const userSubs = await this.getUserSubscription(userId);
    if(userSubs){
      userSubs.status = SubscriptionStatus.CANCELLED;
      await this.userSubscriptionRepository.save(userSubs);
    }


    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await this.userSubscriptionRepository.create({
      userId,
      planId,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE
    });

    return await this.userSubscriptionRepository.save(subscription);
  }

}
