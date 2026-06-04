import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { User } from '../../entities/user.entity';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendRegistrationEmail(user: any) {
    try {
      const result = await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to the Pearls of Lyfe!',
        text: `Hello, ${user.first_name} ${user.last_name}! This is a welcome email from Pearls of Lyfe. `,
      });
      console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
      return nodemailer.getTestMessageUrl(result);
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
      throw error;
    }

    // console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
    // return {
    //   message: 'Email sent successfully',
    //   previewUrl: nodemailer.getTestMessageUrl(result),
    // };
  }

  async sendSubscriptionConfirmationEmail(
    toEmail: string,
    toName?: string,
  ): Promise<void> {
    const greeting = toName ? `Hi ${toName},` : 'Hi there,';
    const text = `${greeting}
Thanks for signing up for a Pearls of My Lyfe Account. You are now set to leave the best of yourself for your loved ones to treasure. Please remember to view the suggested list of moments to share if you need help jarring your memory.
You're just one step away from creating a legacy filled with the highlights of your life the way you live it.

Welcome aboard,
Pearls Of My Lyfe Staff
https:/pearlsofmylyfe.com`;

    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'Confirm your subscription to Pearls of My Lyfe',
      text,
    });
  }

  // async sendKeyHolderRegistrationEmail(keyHolder: any, userName: string) {
  //   try {
  //     console.log(keyHolder);
  //     const result = await this.mailerService.sendMail({
  //       to: keyHolder.email,
  //       subject: 'Welcome to the Pearls of Lyfe!',
  //       text: `Hello, ${keyHolder.first_name} ${keyHolder.last_name}!
  //                   You have been registered as key holder by ${userName},
  //                   please click here to login '${process.env.BASEURL}/auth/keyholder/${keyHolder.token_url}'
  //                   Your login PIN will be ${keyHolder.pin}
  //                   NOTE! Please do not share these credentials`,
  //     });
  //     console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
  //     return nodemailer.getTestMessageUrl(result);
  //   } catch (error) {
  //     console.error(`Failed to send email: ${error.message}`);
  //     throw error;
  //   }
  // }
  async sendKeyHolderRegistrationEmail(keyHolder: any, userName: string) {
    try {
      const baseUrl = process.env.BASEURL || 'http://localhost:4200';
      const acceptInvitationUrl = `${baseUrl}/auth/keyholder/accept/${keyHolder.token_url}`;
      const loginUrl = `${baseUrl}/auth/keyholder/${keyHolder.token_url}`;

      const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              .content { margin: 20px 0; }
              .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #14c44d;
                  color: white !important;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 10px 0;
                  font-weight: bold;
              }
              .footer { font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; margin-top: 20px; }
              .credentials { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #14c44d; }
              .warning { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>Pearls of Life</h2>
              </div>
              <div class="content">
                  <p>Hello, <strong>${keyHolder.first_name} ${keyHolder.last_name}</strong>,</p>
                  <p>You have been registered as a key holder by <strong>${userName}</strong>.</p>
                  
                  <div class="credentials">
                      <p><strong>Your login credentials:</strong></p>
                      <p><strong>Token URL:</strong> ${keyHolder.token_url}</p>
                      <p><strong>PIN:</strong> ${keyHolder.pin}</p>
                  </div>

                  <div class="warning">
                      <p><strong>Important:</strong> As a key holder, you have view-only access. You can view and download content but cannot edit, delete, or modify account information.</p>
                  </div>
                  
                  <p><strong>Step 1:</strong> Accept the invitation and set your password:</p>
                  <p style="text-align: center;">
                      <a href="${acceptInvitationUrl}" class="button">Accept Invitation & Set Password</a>
                  </p>
                  
                  <p><strong>Step 2:</strong> After setting your password, you can login:</p>
                  <p style="text-align: center;">
                      <a href="${loginUrl}" class="button" style="background-color: #3498db;">Login to Your Account</a>
                  </p>
                  
                  <p>If the buttons don't work, copy and paste these links into your browser:</p>
                  <p><strong>Accept Invitation:</strong><br>${acceptInvitationUrl}</p>
                  <p><strong>Login:</strong><br>${loginUrl}</p>
              </div>
              <div class="footer">
                  <p><strong>NOTE:</strong> Please do not share these credentials with anyone.</p>
                  <p>© ${new Date().getFullYear()} Pearls of Life. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;

      const result = await this.mailerService.sendMail({
        to: keyHolder.email,
        subject: 'Welcome to Pearls of Life - Key Holder Registration',
        html: emailTemplate,
      });

      console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
      return nodemailer.getTestMessageUrl(result);
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }
  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const resetLink = `${process.env.BASEURL}/auth/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Reset Your Password - Pearls of Lyfe',
      html: `
                <h1>Password Reset Request</h1>
                <p>Hello ${user.first_name},</p>
                <p>We received a request to reset your password. Click the link below to set a new password:</p>
                <p><a href="${resetLink}">Reset Password</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>Best regards,<br>Pearls of Lyfe Team</p>
            `,
    };

    try {
      await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
  async sendEmail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    template?: string;
    context?: Record<string, any>;
  }): Promise<void> {
    try {
      console.error(process.env.MAIL_PORT, process.env.MAIL_SECURE, process.env.MAIL_USER, process.env.MAIL_PASS);
      const result = await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        template: options.template,
        context: options.context,
      });
      console.error(`result:`, result);

      const previewUrl = nodemailer.getTestMessageUrl(result);
      if (previewUrl) {
        console.log('Preview URL:', previewUrl);
      }
    } catch (error) {
      console.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendSubscriptionExpiryEmail(
    user: User,
    subscription: any,
  ): Promise<void> {
    try {
      const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              .content { margin: 20px 0; }
              .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
              .footer { font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>Pearls of Life - Subscription Expiry Notice</h2>
              </div>
              <div class="content">
                  <p>Hello, <strong>${user.first_name} ${user.last_name}</strong>,</p>
                  <div class="warning">
                      <p><strong>Your subscription has expired!</strong></p>
                      <p>Your ${subscription.plan?.name || 'subscription'} expired on ${new Date(subscription.endDate).toLocaleDateString()}.</p>
                  </div>
                  <p>Your account has been downgraded to the free plan. To continue enjoying premium features, please renew your subscription.</p>
                  <p>If you have any questions, please contact our support team.</p>
              </div>
              <div class="footer">
                  <p>© ${new Date().getFullYear()} Pearls of Life. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Subscription Expired - Pearls of Life',
        html: emailTemplate,
      });
    } catch (error) {
      console.error(
        `Failed to send subscription expiry email: ${error.message}`,
      );
      throw error;
    }
  }

  async sendPaymentFailedEmail(
    user: User,
    subscription: any,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              .content { margin: 20px 0; }
              .error { background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545; }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #3498db;
                  color: white !important;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 10px 0;
              }
              .footer { font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>Pearls of Life - Payment Failed</h2>
              </div>
              <div class="content">
                  <p>Hello, <strong>${user.first_name} ${user.last_name}</strong>,</p>
                  <div class="error">
                      <p><strong>Payment Failed</strong></p>
                      <p>We were unable to process your payment for your ${subscription.plan?.name || 'subscription'}.</p>
                      ${errorMessage ? `<p>Reason: ${errorMessage}</p>` : ''}
                  </div>
                  <p>Please update your payment method to continue your subscription. Your account will be downgraded to the free plan if payment is not updated within 7 days.</p>
                  <a href="${process.env.BASEURL}/subscription" class="button">Update Payment Method</a>
                  <p>If you have any questions, please contact our support team.</p>
              </div>
              <div class="footer">
                  <p>© ${new Date().getFullYear()} Pearls of Life. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Payment Failed - Pearls of Life',
        html: emailTemplate,
      });
    } catch (error) {
      console.error(`Failed to send payment failed email: ${error.message}`);
      throw error;
    }
  }

  async sendReferralEmail(
    referrer: User,
    referredEmail: string,
    referralLink: string,
  ): Promise<void> {
    try {
      const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              .content { margin: 20px 0; }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #3498db;
                  color: white !important;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 10px 0;
              }
              .footer { font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>Pearls of Life - Referral Invitation</h2>
              </div>
              <div class="content">
                  <p>Hello,</p>
                  <p><strong>${referrer.first_name} ${referrer.last_name}</strong> has invited you to join Pearls of Life!</p>
                  <p>Pearls of Life helps you preserve and share your life's most important memories with your loved ones.</p>
                  <a href="${referralLink}" class="button">Join Pearls of Life</a>
                  <p>Or copy and paste this link: ${referralLink}</p>
                  <p>Thank you for considering Pearls of Life!</p>
              </div>
              <div class="footer">
                  <p>© ${new Date().getFullYear()} Pearls of Life. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;

      await this.mailerService.sendMail({
        to: referredEmail,
        subject: `${referrer.first_name} invited you to join Pearls of Life`,
        html: emailTemplate,
      });
    } catch (error) {
      console.error(`Failed to send referral email: ${error.message}`);
      throw error;
    }
  }
}
