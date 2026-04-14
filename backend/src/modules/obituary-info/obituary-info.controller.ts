import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MESSAGE } from 'src/common/constants';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGraud } from 'src/common/guards/auth.guard';
import { KeyHolderGuard } from 'src/common/guards/keyholder.guard';
import { ResponseMessageOutput } from 'src/common/interface/output-response.interface';
import { SuccessMessageResponse } from 'src/common/utils/app.utils';
import { CreateObituaryInfoDto } from './dtos/create-obituary-info.dto';
import { FilterObituaryInfoDto } from './dtos/filter-obituary-info.dto';
import { ObituaryInfoService } from './obituary-info.service';

@UseGuards(AuthGraud)
@Controller(['obituary-info', 'orbituary-info'])
export class ObituaryInfoController {
  constructor(private readonly obituaryInfoService: ObituaryInfoService) {}

  @Get()
  findAll(
    @Query() filterObituaryInfoDto: FilterObituaryInfoDto,
    @CurrentUser() user: any,
  ) {
    return this.obituaryInfoService.findAll(
      filterObituaryInfoDto,
      user.user_id,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const obituaryInfo = await this.obituaryInfoService.findOne(id);
    if (!obituaryInfo) {
      throw new NotFoundException('Obituary information not found');
    }
    return obituaryInfo;
  }

  @Post()
  @UseGuards(KeyHolderGuard)
  async create(
    @Body() createObituaryInfoDto: CreateObituaryInfoDto,
    @CurrentUser() user: any,
  ) {
    const obituaryInfo = await this.obituaryInfoService.create(
      { ...createObituaryInfoDto, user_id: user.user_id },
      user.user_id,
    );
    return SuccessMessageResponse(
      MESSAGE.RECORD_CREATED_SUCCESSFULLY,
      obituaryInfo,
    );
  }

  @Put(':id')
  @UseGuards(KeyHolderGuard)
  async update(
    @Param('id') id: string,
    @Body() updateObituaryInfoDto: Partial<CreateObituaryInfoDto>,
    @CurrentUser() user: any,
  ): Promise<ResponseMessageOutput> {
    const isExists = await this.obituaryInfoService.findOne(id);
    if (!isExists) {
      throw new NotFoundException('Obituary information not found');
    }
    const updatedObituaryInfo = await this.obituaryInfoService.update(
      id,
      updateObituaryInfoDto,
      user.user_id,
    );
    return SuccessMessageResponse(
      MESSAGE.RECORD_UPDATED_SUCCESSFULLY,
      updatedObituaryInfo,
    );
  }

  @Delete(':id')
  @UseGuards(KeyHolderGuard)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ResponseMessageOutput> {
    const isExists = await this.obituaryInfoService.findOne(id);
    if (!isExists) {
      throw new NotFoundException('Obituary information not found');
    }
    await this.obituaryInfoService.delete(id, user.user_id);
    return SuccessMessageResponse(MESSAGE.RECORD_DELETED_SUCCESSFULLY);
  }
}
