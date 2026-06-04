import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGraud } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { FilterUploadsDto } from './dto/filter-uploads.dto';
import { EmailType } from '../../entities/email-log.entity';

@Controller('admin')
@UseGuards(AuthGraud, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard Stats
  @Get('stats')
  async getStats() {
    return await this.adminService.getStats();
  }

  // User Management
  @Get('users')
  async getUsers(@Query() filterDto: FilterUsersDto) {
    return await this.adminService.getUsers(filterDto);
  }

  @Get('users/:id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.getUserById(id);
  }

  @Patch('users/:id/activate')
  async activateUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.activateUser(id);
  }

  @Patch('users/:id/deactivate')
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.deactivateUser(id);
  }

  @Patch('users/:id/terminate')
  async terminateUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.terminateUser(id);
  }

  @Patch('users/:id/promo')
  async addupdateUserPromo(@Param('id', ParseUUIDPipe) id: string, @Body() reqObj: any) {
    return await this.adminService.addupdateUserPromo(id, reqObj.promoCode);
  }

  // KeyHolder Management
  @Get('keyholders')
  async getKeyHolders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.adminService.getKeyHolders(page, limit);
  }

  @Get('keyholders/:id')
  async getKeyHolderById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.getKeyHolderById(id);
  }

  @Delete('keyholders/:id')
  async deleteKeyHolder(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.deleteKeyHolder(id);
  }

  // Upload Management
  @Get('uploads')
  async getUploads(@Query() filterDto: FilterUploadsDto) {
    return await this.adminService.getUploads(filterDto);
  }

  @Delete('uploads/:id')
  async deleteUpload(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('table') table?: string,
  ) {
    return await this.adminService.deleteUpload(id, table);
  }

  // Plan Management
  @Get('plans')
  async getPlans() {
    return await this.adminService.getPlans();
  }

  @Post('plans')
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    return await this.adminService.createPlan(createPlanDto);
  }

  @Patch('plans/:id')
  async updatePlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return await this.adminService.updatePlan(id, updatePlanDto);
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.deletePlan(id);
  }

  // Subscription Management
  @Get('subscriptions')
  async getSubscriptions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.adminService.getSubscriptions(page, limit);
  }

  @Patch('subscriptions/:id/cancel')
  async cancelSubscription(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.cancelSubscription(id);
  }

  @Patch('subscriptions/:id/change-plan')
  async changePlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('planId') planId: string,
  ) {
    return await this.adminService.changePlan(id, planId);
  }

  // Payment Management
  @Get('payments')
  async getPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.adminService.getPayments(page, limit, userId, startDate, endDate);
  }

  // Email Logs
  @Get('email-logs')
  async getEmailLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: string,
    @Query('emailType') emailType?: EmailType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.adminService.getEmailLogs(page, limit, userId, emailType, startDate, endDate);
  }
}

