import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGraud } from 'src/common/guards/auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { MESSAGE } from 'src/common/constants';

@UseGuards(AuthGraud)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('/plan')
  async findPlanByUser(@CurrentUser() user: any) {
    const user_plan = await this.usersService.findPlanByUser(user.user_id);
    // Return null or default plan instead of throwing error if no subscription exists
    if (!user_plan) {
      // Return a default free plan structure if no subscription exists
      return {
        plan: {
          id: null,
          name: 'Free',
          price: 0,
          description: 'Free plan',
          features: 'Basic features',
          isActive: true,
          max_video_length: 0,
          max_images: 0,
          max_uploads: 0,
          billing_period: 'monthly',
        },
        status: 'none',
        message: 'No active subscription found',
      };
    }
    return user_plan;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Put(':id')
  async updatePersonalInfo(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    const userDetails = await this.usersService.update(updateUserDto, user.id);
    return userDetails;
  }

  @Delete('me')
  async terminateAccount(@CurrentUser() user: any) {
    await this.usersService.terminateAccount(user.user_id);
    return { message: 'Account terminated successfully' };
  }

  @UseGuards(AdminGuard)
  @Get('manage/list')
  async findAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return await this.usersService.findAllUsers(page, limit);
  }

  @UseGuards(AdminGuard)
  @Put(':userId/role')
  async updateUserRole(
    @Param('userId') userId: string,
    @Body('role') role: 'user' | 'admin' | 'super_admin',
    @CurrentUser() admin: any,
  ) {
    // Only super_admin can create other admins
    if (
      (role === 'admin' || role === 'super_admin') &&
      admin.role !== 'super_admin'
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Only super admin can assign admin roles',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedUser = await this.usersService.updateUserRole(userId, role);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  //   @UseGuards(AdminGuard)
  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string, @CurrentUser() admin: any) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only super_admin can delete admins
    if (user.role === 'admin' && admin.role !== 'super_admin') {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Only super admin can delete admin users',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.usersService.deleteUser(userId, admin.id);
    return { message: MESSAGE.RECORD_DELETED_SUCCESSFULLY };
  }

  //   @UseGuards(AdminGuard)
  @Put(':userId/block')
  async blockUser(@Param('userId') userId: string, @CurrentUser() admin: any) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only super_admin can block admins
    if (user.role === 'admin' && admin.role !== 'super_admin') {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Only super admin can block admin users',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const blockedUser = await this.usersService.blockUser(userId);
    return blockedUser;
  }

  //   @UseGuards(AdminGuard)
  @Put(':userId/unblock')
  async unblockUser(
    @Param('userId') userId: string,
    @CurrentUser() admin: any,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only super_admin can unblock admins
    if (user.role === 'admin' && admin.role !== 'super_admin') {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Only super admin can unblock admin users',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const unblockedUser = await this.usersService.unblockUser(userId);
    return unblockedUser;
  }
}
