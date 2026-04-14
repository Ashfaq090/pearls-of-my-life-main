import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGraud } from 'src/common/guards/auth.guard';
import { KeyHolderGuard } from 'src/common/guards/keyholder.guard';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { KeyHoldersService } from './key-holders.service';
import { FilterKeyHoldersDto } from './dtos/filter-key-holders.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { KEY_HOLDERS_BASE_PATH, MESSAGE } from 'src/common/constants';
import { CreateKeyHolderDto } from './dtos/create-key-holder.dto';
import { UpdateKeyHolderDto } from './dtos/update-key-holder.dto';
import { SuccessMessageResponse } from 'src/common/utils/app.utils';
import { ResponseMessageOutput } from 'src/common/interface/output-response.interface';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

@UseGuards(AuthGraud)
@Controller('key-holders')
export class KeyHoldersController {

    constructor(
        private readonly keyHoldersService: KeyHoldersService,
        private readonly userService: UsersService,
        private readonly emailService: EmailService
    ) { }

    @Get()
    findAll(
        @Query() filterKeyHoldersDto: FilterKeyHoldersDto,
        @CurrentUser() user: any
    ) {
        return this.keyHoldersService.findAll(filterKeyHoldersDto, user.user_id);
    }

    @Get('user/:user_id')
    findAllByUserId(
        @Query() filterKeyHoldersDto: FilterKeyHoldersDto,
        @Param('user_id') user_id: string,
        @CurrentUser() user: any
    ) {
        return this.keyHoldersService.findAll(filterKeyHoldersDto, user_id);
    }

    @Post()
    @UseGuards(KeyHolderGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            // destination: (req, file, callback) => {
            //     const user: any = req?.user;
            //     let parsedBody: any = JSON.parse(req.body?.body);
            //     // console.log(req.body)
            //     const folder = `${KEY_HOLDERS_BASE_PATH}/${user?.user_id}/${parsedBody.first_name}_${parsedBody.last_name}`;
            //     // Ensure the folder exists
            //     if (!fs.existsSync(folder)) {
            //         fs.mkdirSync(folder, { recursive: true }); // Create folder and parents if needed
            //     }
            //     callback(null, folder); // Set destination folder
            // },
            destination: './temp',
            filename: (req, file, callback) => {
                callback(null, file?.originalname);
            },

        })
    }))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: any,
        @Req() req: any,
        @Body('text') body: any
    ): Promise<ResponseMessageOutput> {
        const startTime = Date.now();

        let parsedBody = JSON.parse(body);
        parsedBody.user_id = user.user_id;
        const type = String(parsedBody?.type || 'PERSON').toUpperCase();
        parsedBody.type = type;

        let countBefore = 0;
        if (type === 'PERSON') {
            countBefore = await this.keyHoldersService.countActiveByUser(user.user_id);
            if (countBefore >= 3) {
                throw new BadRequestException('You can only add up to 3 key holders.');
            }
            if (!parsedBody.first_name || !parsedBody.last_name || !parsedBody.email || !parsedBody.relation) {
                throw new BadRequestException('Please provide all required key holder fields.');
            }
        }

        if (type === 'FUNERAL_HOME') {
            const funeralHomeCount = await this.keyHoldersService.countByUserAndType(user.user_id, 'FUNERAL_HOME');
            if (funeralHomeCount >= 1) {
                throw new BadRequestException('You can only add one funeral home.');
            }
            if (!parsedBody.funeral_home_name || !parsedBody.street || !parsedBody.city || !parsedBody.state) {
                throw new BadRequestException('Please provide all required funeral home fields.');
            }
        }

        const keyHolder = await this.keyHoldersService.create(parsedBody, user.user_id);
        const userDetails = await this.userService.findOne(user.user_id);

        const disableKeyholderEmail = String(process.env.DISABLE_KEYHOLDER_EMAIL || '').toLowerCase() === 'true';
        let emailSent = false;
        if (disableKeyholderEmail) {
            console.log('[KEYHOLDER EMAIL] disabled via DISABLE_KEYHOLDER_EMAIL');
        } else {
            emailSent = true;
            this.emailService.sendKeyHolderRegistrationEmail(
                keyHolder,
                `${userDetails?.first_name} ${userDetails?.last_name}`,
            )
            .then(() => {
                console.log(`[KEYHOLDER EMAIL] sent to ${keyHolder.email}`);
            })
            .catch((error) => {
                console.error('Key holder created, but email failed:', error?.message || error);
            });
        }

        if (file) {
            const finalFolder = `${KEY_HOLDERS_BASE_PATH}/${user?.user_id}/${keyHolder.id}`;
            await fsPromises.mkdir(finalFolder, { recursive: true });
            const targetPath = path.join(finalFolder, file.filename);
            await fsPromises.rename(file.path, targetPath);
            const filePath = `${KEY_HOLDERS_BASE_PATH}/${user.user_id}/${keyHolder.id}/${file.originalname}`;
            await this.keyHoldersService.updateKeyHolderImage(keyHolder.id, filePath, user.user_id);
            keyHolder['image_path'] = filePath;
        }

        keyHolder['email_sent'] = emailSent;

        const disableSubscriptionEmail = String(process.env.DISABLE_SUBSCRIPTION_EMAIL || '').toLowerCase() === 'true';
        if (
            type === 'PERSON'
            && countBefore === 0
            && userDetails?.subscription_email_sent === false
            && !disableSubscriptionEmail
        ) {
            this.emailService.sendSubscriptionConfirmationEmail(
                userDetails.email,
                `${userDetails.first_name} ${userDetails.last_name}`.trim()
            )
            .then(() => {
                return this.userService.update(
                    { subscription_email_sent: true },
                    user.user_id,
                    user.user_id,
                );
            })
            .then(() => {
                console.log(`[SUBSCRIPTION EMAIL] sent to ${userDetails.email}`);
            })
            .catch((error) => {
                console.error('Subscription confirmation email failed:', error?.message || error);
            });
        }

        const elapsed = Date.now() - startTime;
        console.log(`[KEY-HOLDER CREATE] completed in ${elapsed}ms (type=${type}, emailSent=${emailSent})`);

        return SuccessMessageResponse(MESSAGE.RECORD_CREATED_SUCCESSFULLY, keyHolder);
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ) {
        const keyHolder = await this.keyHoldersService.findOne(id);
        if (!keyHolder) {
            throw new NotFoundException('Key holder not found');
        }
        return keyHolder;
    }

    @Put(':id')
    @UseGuards(KeyHolderGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './temp',
            filename: (req, file, callback) => {
                callback(null, file?.originalname);
            },
        })
    }))
    async update(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: any,
        @Body('text') body: any
    ): Promise<ResponseMessageOutput> {
        const existingKeyHolder = await this.keyHoldersService.findOneByIdAndUser(id, user.user_id);
        if (!existingKeyHolder) {
            throw new NotFoundException('Key holder not found');
        }

        let parsedBody: UpdateKeyHolderDto = {};
        if (body) {
            parsedBody = JSON.parse(body);
        }
        const updateData = {
            ...parsedBody,
            updated_by: user.user_id,
        };
        delete updateData['user_id'];
        delete updateData['id'];

        const updatedKeyHolder = await this.keyHoldersService.update(id, updateData);

        if (file) {
            const finalFolder = `${KEY_HOLDERS_BASE_PATH}/${user?.user_id}/${id}`;
            await fsPromises.mkdir(finalFolder, { recursive: true });
            const targetPath = path.join(finalFolder, file.filename);
            await fsPromises.rename(file.path, targetPath);
            const filePath = `${KEY_HOLDERS_BASE_PATH}/${user.user_id}/${id}/${file.originalname}`;
            await this.keyHoldersService.updateKeyHolderImage(id, filePath, user.user_id);
            updatedKeyHolder['image_path'] = filePath;
        }

        return SuccessMessageResponse(MESSAGE.RECORD_UPDATED_SUCCESSFULLY, updatedKeyHolder);
    }

    @Delete(':id')
    @UseGuards(KeyHolderGuard)
    async delete(
        @Param('id') id: string,
        @CurrentUser() user: any
    ): Promise<ResponseMessageOutput> {
        const isExists = await this.keyHoldersService.findOne(id);
        if (!isExists) {
            throw new NotFoundException('Key holder not found');
        }
        this.keyHoldersService.delete(id, user.user_id);
        return SuccessMessageResponse(MESSAGE.RECORD_DELETED_SUCCESSFULLY);
    }

}
