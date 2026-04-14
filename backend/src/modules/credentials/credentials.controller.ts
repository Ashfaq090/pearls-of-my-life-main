import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CredentialsService } from './credentials.service';
import { FilterCredentialsDto } from './dtos/filter-credentials.dto';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { CreateCredentialsDto } from './dtos/create-credentials.dto';
import { ResponseMessageOutput } from 'src/common/interface/output-response.interface';
import { MESSAGE } from 'src/common/constants';
import { SuccessMessageResponse } from 'src/common/utils/app.utils';
import { UpdateCredentialsDto } from './dtos/update-credentials.dto';
import { AuthGraud } from 'src/common/guards/auth.guard';
import { KeyHolderGuard } from 'src/common/guards/keyholder.guard';

@UseGuards(AuthGraud)
@Controller('credentials')
export class CredentialsController {
    constructor(private readonly credentialsService: CredentialsService){}

    @Get()
    findAll(
        @Query() filterCredentialsDto: FilterCredentialsDto,        
        @CurrentUser() user: any
    ) {
        return this.credentialsService.findAll(filterCredentialsDto, user.user_id);
    }

    @Get('user/:user_id')
    findAllByUserId(
        @Query() filterCredentialsDto: FilterCredentialsDto,
        @Param('user_id') user_id: string
    ) {
        return this.credentialsService.findAll(filterCredentialsDto, user_id);
    }

    @Post()
    @UseGuards(KeyHolderGuard)
    async create(
        @Body() input: CreateCredentialsDto,
        @CurrentUser() user: any
    ) : Promise<ResponseMessageOutput> {
        if(!input?.user_id){
            input['user_id'] = user.user_id;
        }
        const creds = await this.credentialsService.create(input, user.user_id);
        return SuccessMessageResponse(MESSAGE.RECORD_CREATED_SUCCESSFULLY, creds);
    }

    @Put(':id')
    @UseGuards(KeyHolderGuard)
    async update(
        @Param('id') id: string,
        @Body() input: UpdateCredentialsDto,
        @CurrentUser() user: any
    ) : Promise<ResponseMessageOutput> {
        const isRecordExists = await this.credentialsService.findOne(id);
        if(!isRecordExists) {
            throw new NotFoundException('Credential record not found');
        }
        const creds = await this.credentialsService.update(input, id, user.user_id);
        return SuccessMessageResponse(MESSAGE.RECORD_UPDATED_SUCCESSFULLY, creds);
    }

    @Delete(':id')
    @UseGuards(KeyHolderGuard)
    async delete(
        @Param('id') id: string,
        @CurrentUser() user: any
    ): Promise<ResponseMessageOutput> {
        const isRecordExists = await this.credentialsService.findOne(id);
        if(!isRecordExists) {
            throw new NotFoundException('Credential record not found');
        }
        await this.credentialsService.delete(id, user.user_id);
        return SuccessMessageResponse(MESSAGE.RECORD_DELETED_SUCCESSFULLY, null);
    }

}
