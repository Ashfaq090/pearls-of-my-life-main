import { AuthGuard } from './auth.guard';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dtos/login.dto';
import { SuccessMessageResponse } from 'src/common/utils/app.utils';
import {
  generateRandomAlphanumeric,
  MESSAGE,
  X_ACCESS_TOKEN,
} from 'src/common/constants';
import { ResponseMessageOutput } from 'src/common/interface/output-response.interface';
import { RegisterDto } from './dtos/register.dto';
import { UsersService } from '../users/users.service';
import { JwtHelper } from 'src/common/helpers/jwt-helper';
import { EmailService } from '../email/email.service';
import { KeyHoldersService } from '../key-holders/key-holders.service';
import { KeyHolderLoginDto } from './dtos/keyholder-login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtHelper: JwtHelper,
    private readonly emailService: EmailService,
    private readonly keyHolderService: KeyHoldersService,
  ) {}

  @Post('register')
  async register(@Body() input: RegisterDto, @Req() request: any): Promise<any> {
    const isUserExists = await this.usersService.findOneByEmail(input.email);
    if (isUserExists) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'User already exists with this email.',
          error: 'User already registered - Forebidden',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const user = await this.usersService.create(input);
    this.emailService.sendRegistrationEmail(user);
    // return SuccessMessageResponse(MESSAGE.ENTITLEMENTS.USER_REGISTERED, user);
    

    const token = this.jwtHelper.generateToken(user.id, false, user.role);
    request.res.setHeader(X_ACCESS_TOKEN, token.access_token);

    // Return both user and token in response body
    return {
      user,
      access_token: token.access_token,
    };
  }

  @Post('login')
  async login(@Body() input: LoginDto, @Req() request: any) {
    const user = await this.usersService.validateUserCredentials(input);
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Invalid email or password.',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if account is terminated or deactivated
    const userData = user;
    if (userData.is_terminated === true || userData.is_active === false) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message:
            'Your account has been terminated or deactivated. Please contact support.',
          error: 'Account Terminated',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const token = this.jwtHelper.generateToken(user.id, false, user.role);
    request.res.setHeader(X_ACCESS_TOKEN, token.access_token);

    // Return both user and token in response body
    return {
      user,
      access_token: token.access_token,
    };
  }

  @Get('keyholder/:token_URL')
  async findKeyHolderByTokenURL(
    @Param('token_URL') token_URL: string,
  ): Promise<ResponseMessageOutput> {
    const keyHolder = await this.keyHolderService.findOneByTokenURL(token_URL);
    if (!keyHolder)
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Link has been faulty or expired.',
          error: 'Link Broken or Expired - Forebidden',
        },
        HttpStatus.FORBIDDEN,
      );
    else
      return SuccessMessageResponse(MESSAGE.ENTITLEMENTS.KEYHOLDER_REGISTERED);
  }

  @Post('keyholder')
  async loginViaKeyHolder(
    @Body() input: KeyHolderLoginDto,
    @Req() request: any,
  ): Promise<any> {
    const keyHolder = await this.keyHolderService.findOneByTokenAndPin(input);
    if (!keyHolder) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Invalid token or PIN.',
          error: 'Invalid Credentials',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const user = await this.usersService.findOne(keyHolder?.user_id);
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'User does not exist.',
          error: 'User does not exist',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    // Generate token with keyholder flag
    const token = this.jwtHelper.generateToken(user.id, true);
    request.res.setHeader(X_ACCESS_TOKEN, token.access_token);
    return {
      ...user,
      is_keyholder: true,
      keyholder_id: keyHolder.id,
    };
  }

  @Post('keyholder/accept-invitation')
  async acceptKeyHolderInvitation(
    @Body() input: { token_url: string; pin: string; password: string },
  ): Promise<ResponseMessageOutput> {
    try {
      // Validate invitation
      const keyHolder = await this.keyHolderService.acceptInvitation(
        input.token_url,
        input.pin,
        input.password,
      );

      // Check if keyholder user account already exists
      let keyholderUser = await this.usersService.findOneByEmail(
        keyHolder.email,
      );

      if (!keyholderUser) {
        // Create keyholder user account with limited permissions
        keyholderUser = await this.usersService.create({
          first_name: keyHolder.first_name,
          last_name: keyHolder.last_name,
          email: keyHolder.email,
          phone_number: keyHolder.phone_number || null,
          hashed_password: input.password,
          role: 'keyholder' as any,
          is_email_verified: true,
          is_active: true,
        });
      } else {
        // Update password if account exists
        await this.usersService.updatePassword(
          keyholderUser.id,
          input.password,
        );
      }

      // Link key holder to the created/updated user for subsequent login
      try {
        await this.keyHolderService.update(keyHolder.id, {
          user_id: keyholderUser.id,
        });
        console.log('[KEYHOLDER] Linked user to keyholder', {
          keyHolderId: keyHolder.id,
          userId: keyholderUser.id,
        });
      } catch (linkErr) {
        console.error(
          '[KEYHOLDER] Failed to link user to keyholder',
          linkErr?.message || linkErr,
        );
      }

      return SuccessMessageResponse(
        'Key holder invitation accepted successfully. You can now login.',
        { keyholder_id: keyHolder.id },
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: error.message || 'Failed to accept invitation',
          error: 'Invitation Error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() input: ForgotPasswordDto,
  ): Promise<ResponseMessageOutput> {
    const user = await this.usersService.findOneByEmail(input.email);
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'No user found with this email address.',
          error: 'User Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Generate reset token
    const resetToken = generateRandomAlphanumeric(32);
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update user with reset token
    await this.usersService.updateResetToken(
      user.id,
      resetToken,
      resetTokenExpiry,
    );

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user, resetToken);

    return SuccessMessageResponse(
      MESSAGE.ENTITLEMENTS.PASSWORD_RESET_EMAIL_SENT,
    );
  }
  // Post('send-email')(@Body('email') email: string): Promise<ResponseMessageOutput> {
  //   return this.emailService.sendEmail(email);
  // }
  // @Post('send')
  // async sendEmail(@Body() sendEmail:any): Promise<{ message: string }> {
  //   try {
  //     await this.emailService.sendEmail(sendEmailDto.email);
  //     return { message: 'Email sent successfully' };
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: 'Failed to send email',
  //         details: error.message,
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
  @Post('send-email')
  @UseGuards(AuthGuard)
  async sendEmail(
    @Body() body: { email: string },
    @Req() request: any,
  ): Promise<ResponseMessageOutput> {
    try {
      // Validate email format
      if (!body.email || !body.email.includes('@')) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid email format',
            error: 'Validation Error',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get current user from request
      const currentUser = request.user;
      const baseUrl = process.env.BASEURL || 'http://localhost:4200';
      const referralLink = `${baseUrl}/auth/signup?ref=${currentUser?.user_id || 'friend'}`;

      await this.emailService.sendEmail({
        to: body.email,
        subject: 'Share the Pearls of Lyfe Experience!',
        text: `Hi there!

I've been enjoying my experience with Pearls of Lyfe and thought you might love it too!

Pearls of Lyfe is a secure digital legacy platform where you can:
- Store important personal information and memories
- Designate trusted key holders who can access your information
- Create heartfelt messages, videos, and notes for loved ones
- Ensure your wishes are known when you're no longer here

Join me using this special referral link: ${referralLink}

I'd love for you to join me in this wonderful community. Let me know what you think!

Warm regards,
Pearls of Lyfe Team

P.S. If you have any questions about Pearls of Lyfe, I'd be happy to help!`,

        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #14c44d; margin: 0;">Pearls of Life</h2>
          </div>
          
          <h2 style="color: #2c3e50;">Hi there!</h2>

          <p>I've been enjoying my experience with <strong>Pearls of Lyfe</strong> and thought you might love it too!</p>

          <p>I wanted to share something truly special with you - <strong>Pearls of Lyfe</strong>, a meaningful way to preserve your legacy and connect with loved ones, today and beyond.</p>

          <p><strong>Pearls of Lyfe</strong> is a secure digital legacy platform where you can:</p>
          <ul style="line-height: 1.6; padding-left: 20px;">
            <li>Store important personal information and memories</li>
            <li>Designate trusted key holders who can access your information</li>
            <li>Create heartfelt messages, videos, and notes for loved ones</li>
            <li>Ensure your wishes are known when you're no longer here</li>
          </ul>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #14c44d;">
            <p style="margin: 0;"><strong>Special Offer:</strong> When you sign up through this referral, you'll receive exclusive benefits!</p>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${referralLink}"
               style="background-color: #14c44d; color: white; padding: 14px 30px;
                      text-decoration: none; border-radius: 5px; font-weight: bold;
                      font-size: 1.1em; display: inline-block;">
              Join Pearls of Lyfe
            </a>
          </p>

          <p style="font-size: 0.9em; color: #666; text-align: center;">
            Or copy and paste this link: <br>
            <a href="${referralLink}" style="color: #14c44d; word-break: break-all;">${referralLink}</a>
          </p>

          <p>I'd love for you to join me in this wonderful community. Let me know what you think!</p>
          <p>This isn't just another website - it's a gift of peace of mind for you and your family. I'd be honored if you joined me in creating something truly meaningful.</p>

          <p>Warm regards,<br>
          <strong>Pearls of Lyfe Team</strong></p>

          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 0.9em; color: #7f8c8d;">
            <p style="margin: 0;"><em>"Preserving life's most precious memories for generations to come"</em></p>
            <p style="margin: 10px 0 0 0;">P.S. Have questions? Reply to this email - we're happy to help you get started!</p>
          </div>
        </div>`,
      });

      //     await this.emailService.sendEmail({
      //       to: body.email,
      //       subject: 'A Gift for Your Loved Ones - Join Pearls of Lyfe',
      //       html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      //   <div style="text-align: center; margin-bottom: 20px;">
      //     <img src="https://your-logo-url.com/logo.png" alt="Pearls of Lyfe" style="max-width: 200px;">
      //   </div>

      //   <h2 style="color: #2c3e50; border-bottom: 2px solid #f1c40f; padding-bottom: 10px;">Hi there!</h2>

      //   <p>I wanted to share something truly special with you - <strong>Pearls of Lyfe</strong>, a meaningful way to preserve your legacy and connect with loved ones, today and beyond.</p>

      //   <p>Pearls of Lyfe is a secure digital legacy platform where you can:</p>
      //   <ul style="line-height: 1.6;">
      //     <li>Store important personal information and memories</li>
      //     <li>Designate trusted key holders who can access your information</li>
      //     <li>Create heartfelt messages, videos, and notes for loved ones</li>
      //     <li>Ensure your wishes are known when you're no longer here</li>
      //   </ul>

      //   <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #f1c40f;">
      //     <strong>Special Offer:</strong> When you sign up through this referral, you'll receive 3 months of premium features free!
      //   </p>

      //   <p style="text-align: center; margin: 30px 0;">
      //     <a href="http://56.228.6.77/"
      //        style="background-color: #3498db; color: white; padding: 12px 30px;
      //               text-decoration: none; border-radius: 4px; font-weight: bold;
      //               font-size: 1.1em; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      //       Begin Your Legacy Journey
      //     </a>
      //   </p>

      //   <p>This isn't just another website - it's a gift of peace of mind for you and your family. I'd be honored if you joined me in creating something truly meaningful.</p>

      //   <p>With warm regards,<br>
      //   <strong>POML Wendy</strong><br>
      //   <span style="color: #7f8c8d;">Pearls of Lyfe Team</span></p>

      //   <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 0.9em; color: #7f8c8d;">
      //     <p><em>"Preserving life's most precious memories for generations to come"</em></p>
      //     <p>P.S. Have questions? Reply to this email - I'm happy to help you get started!</p>
      //   </div>
      // </div>`,
      //     });

      return SuccessMessageResponse(MESSAGE.ENTITLEMENTS.EMAIL_SENT);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to send email',
          error: 'Email Sending Error',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('reset-password')
  async resetPassword(
    @Body() input: ResetPasswordDto,
  ): Promise<ResponseMessageOutput> {
    console.log('Reset password request received with token:', input.token);

    const user = await this.usersService.findOneByResetToken(input.token);
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid or expired reset token.',
          error: 'Invalid Token',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if token is expired
    if (
      user.reset_token_expiry &&
      new Date(user.reset_token_expiry) < new Date()
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Reset token has expired.',
          error: 'Token Expired',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update password and clear reset token
    await this.usersService.updatePassword(user.id, input.password);

    return SuccessMessageResponse(MESSAGE.ENTITLEMENTS.PASSWORD_RESET_SUCCESS);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  async changePassword(
    @Body() input: ChangePasswordDto,
    @Req() request: any,
  ): Promise<ResponseMessageOutput> {
    const userId = request.user.user_id;
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found.',
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Verify old password
    const isValidPassword = await this.usersService.validatePassword(
      input.oldPassword,
      user.hashed_password,
    );

    if (!isValidPassword) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Current password is incorrect.',
          error: 'Invalid Password',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update password
    await this.usersService.updatePassword(userId, input.newPassword);

    return SuccessMessageResponse(MESSAGE.ENTITLEMENTS.PASSWORD_CHANGE_SUCCESS);
  }
}
