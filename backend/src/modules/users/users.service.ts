import { Inject, Injectable, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserSubscription, SubscriptionStatus } from '../../entities/user-subscription.entity';
import { LoginDto } from '../auth/dtos/login.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { generateRandom4Digit } from 'src/common/constants';
import { EmailService } from '../email/email.service';
import { SubscriptionService } from '../payment/subsription.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async validateUserCredentials(loginDto: LoginDto): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        email: loginDto.email,
      },
    });
    
    if (!user) {
      return null;
    }

    // Compare password (assuming hashed_password in DTO is actually plain password for comparison)
    // In production, you should hash the incoming password and compare with stored hash
    const isPasswordValid = await bcrypt.compare(loginDto.hashed_password, user.hashed_password);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async create(input: any): Promise<User> {
    const rndmNo = generateRandom4Digit();
    const hashedPassword = await bcrypt.hash(input.hashed_password, 10);
    const newUser = this.usersRepository.create({
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      username: `${input.first_name}_${rndmNo}`,
      hashed_password: hashedPassword,
      phone_number: input?.phone_number || null,
      email_marketing_opt_in:
        typeof input?.email_marketing_opt_in === 'boolean'
          ? input.email_marketing_opt_in
          : true,
      sms_consent_opt_in:
        typeof input?.sms_consent_opt_in === 'boolean'
          ? input.sms_consent_opt_in
          : true,
      subscription_email_sent: false,
      date_of_birth: input?.date_of_birth || null,
    });
    return await this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }

  async findOneByResetToken(token: string): Promise<User | null> {
    console.log('Searching for user with reset token:', token);
    const user = await this.usersRepository.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: MoreThan(new Date()), // Token not expired
      },
    });
    console.log('Query result:', user ? 'User found' : 'No user found');
    if (user) {
      console.log('Token expiry:', user.reset_token_expiry);
    }
    return user;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(
      { id: userId },
      {
        hashed_password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      },
    );
  }

  async validatePassword(
    password: string,
    storedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, storedPassword);
  }

  async update(
    input: UpdateUserDto,
    id: string,
    updated_by: string = null,
  ): Promise<User | null> {
    await this.usersRepository.update(
      { id },
      {
        ...input,
        updated_by: updated_by || id,
      },
    );
    return this.findOne(id);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async getPersonalInfo(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }

  async findPlanByUser(userId: string): Promise<UserSubscription | null> {
    // First try to find active subscription
    let subscription = await this.userSubscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      relations: ['plan'],
    });

    // IMPORTANT:
    // /users/plan is used as the "current entitlement plan" across the UI.
    // If there is no ACTIVE subscription, we must return null so the controller
    // can return the default Free plan structure.
    return subscription || null;
  }

  async updateResetToken(
    userId: string,
    resetToken: string,
    resetTokenExpiry: Date,
  ): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry,
      },
    );
  }

  async findAllUsers(page: number = 1, limit: number = 10) {
    const [users, total] = await this.usersRepository.findAndCount({
      where: {
        role: 'user' as any,
        deleted_on: null as any,
      },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { rows: users, count: total };
  }

  async updateUserRole(userId: string, role: 'user' | 'admin' | 'keyholder' | 'super_admin') {
    await this.usersRepository.update(
      { id: userId },
      { role: role as any },
    );
    return this.findOne(userId);
  }

  async deleteUser(userId: string, deletedBy: string) {
    await this.usersRepository.update(
      { id: userId },
      {
        deleted_on: new Date(),
        deleted_by: deletedBy,
      },
    );
  }

  async blockUser(userId: string) {
    await this.usersRepository.update(
      { id: userId },
      { is_active: false },
    );
    return this.findOne(userId);
  }

  async unblockUser(userId: string) {
    await this.usersRepository.update(
      { id: userId },
      { is_active: true },
    );
    return this.findOne(userId);
  }


  async terminateAccount(userId: string): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    this.logger.log(`Terminating account for user: ${userId}`);

    // 1. Cancel PayPal Subscription if exists
    try {
      const subscription = await this.subscriptionService.getUserSubscription(userId);
      if (subscription && subscription.paypalSubscriptionId) {
        try {
          await this.subscriptionService.cancelSubscription(subscription.id, userId);
          this.logger.log(`PayPal subscription cancelled for user: ${userId}`);
        } catch (error) {
          this.logger.error('Failed to cancel PayPal subscription during termination', error);
          // Continue with termination even if PayPal fails
        }
      }
    } catch (error) {
      this.logger.warn('Error checking subscription during termination', error);
    }

    // 2. Mark account as terminated and deactivated
    await this.usersRepository.update(
      { id: userId },
      {
        is_terminated: true,
        is_active: false,
        terminated_at: new Date(),
        deleted_on: new Date(),
        deleted_by: userId,
      },
    );

    // 3. Send email notifications
    try {
      // Email to user
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Account Termination Confirmation - Pearls of Life',
        html: `
          <h2>Account Termination Confirmation</h2>
          <p>Dear ${user.first_name} ${user.last_name},</p>
          <p>Your account has been successfully terminated as requested.</p>
          <p>All active subscriptions have been cancelled and you will no longer be billed.</p>
          <p>If you have any questions or concerns, please contact our support team.</p>
          <p>Thank you for being part of Pearls of Life.</p>
          <p>Best regards,<br>The Pearls of Life Team</p>
        `,
      });

      // Email to company (admin notification)
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@pearlsoflife.com';
      await this.emailService.sendEmail({
        to: adminEmail,
        subject: `Account Termination - ${user.email}`,
        html: `
          <h2>Account Termination Notification</h2>
          <p>A user account has been terminated:</p>
          <ul>
            <li><strong>User:</strong> ${user.first_name} ${user.last_name}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>User ID:</strong> ${userId}</li>
            <li><strong>Terminated At:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>All subscriptions have been cancelled.</p>
        `,
      });

      this.logger.log(`Termination emails sent for user: ${userId}`);
    } catch (error) {
      this.logger.error('Failed to send termination emails', error);
      // Don't fail termination if email fails
    }

    this.logger.log(`Account termination completed for user: ${userId}`);
  }
}
