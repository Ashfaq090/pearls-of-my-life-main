import { Controller, Get, HttpException, HttpStatus, Post, Query, Body, UseGuards, UseInterceptors, UploadedFile, Req, NotFoundException } from '@nestjs/common';
import { FilterMemoryFoldersDto } from './dtos/filter-memory-folders.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { MemoriesService } from './memories.service';
import { AuthGraud } from 'src/common/guards/auth.guard';
import { KeyHolderGuard } from 'src/common/guards/keyholder.guard';
import { CreateMemoryFoldersDto } from './dtos/create-memory-folder.dto';
import { SuccessMessageResponse } from 'src/common/utils/app.utils';
import { FILE_CATEGORIES, MEMORIES_BASE_PATH, MESSAGE } from 'src/common/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ResponseMessageOutput } from 'src/common/interface/output-response.interface';
import * as fs from 'fs';
import * as path from 'path';
import { ImageUploadService } from '../image-upload/image-upload.service';
import { FilterMemoriesDto } from './dtos/filter-memories.dto';

@UseGuards(AuthGraud)
@Controller('memories')
export class MemoriesController {

    constructor(
        private readonly memoriesService: MemoriesService,
        private readonly imageUploadService: ImageUploadService
    ) { }

    @Get('folders')
    findAll(
        @Query() filterMemoryFoldersDto: FilterMemoryFoldersDto,
        @CurrentUser() user: any
    ) {
        return this.memoriesService.findAllFolders(filterMemoryFoldersDto, user.user_id);
    }

    @Post('folders')
    @UseGuards(KeyHolderGuard)
    async createFolder(
        @Body() createMemoryFoldersDto: CreateMemoryFoldersDto,
        @CurrentUser() user: any
    ) {
        const isExists = await this.memoriesService.findFolderByName(createMemoryFoldersDto?.folder_name, createMemoryFoldersDto?.user_id ?? user.user_id)
        if (isExists) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: 'Folder already exists with this name.',
                error: 'Folder already exists - Forebidden'
            }, HttpStatus.FORBIDDEN)
        }
        const folderDetails: CreateMemoryFoldersDto = {
            folder_name: createMemoryFoldersDto?.folder_name,
            user_id: createMemoryFoldersDto?.user_id ?? user?.user_id
        }
        const memoryFolder = await this.memoriesService.createFolder(folderDetails, user.user_id);
        return SuccessMessageResponse(MESSAGE.RECORD_CREATED_SUCCESSFULLY, memoryFolder);
    }

    @Post('create')
    @UseGuards(KeyHolderGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const user: any = req?.user; // Extract userId from request params
                const userFolder = `${MEMORIES_BASE_PATH}/${user?.user_id}`;
                // Ensure the folder exists
                if (!fs.existsSync(userFolder)) {
                    fs.mkdirSync(userFolder, { recursive: true }); // Create folder and parents if needed
                }
                callback(null, userFolder); // Set destination folder
            },
            filename: (req, file, callback) => {
                callback(null, file.originalname);
            },
        })
    }))
    async createMemory(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: any,
        @Req() req: any,
        @Body('text') body: any
    ): Promise<ResponseMessageOutput> {
        let parsedBody = JSON.parse(body);
        parsedBody.user_id = user.user_id;
        // const memory = await this.memoriesService.createMemory(parsedBody, user.user_id);
        if (file) {
            const finalFolder = `${MEMORIES_BASE_PATH}/${user.user_id}/${parsedBody.folder_id}`;
            // Ensure folder exists
            if (!fs.existsSync(finalFolder)) {
                fs.mkdirSync(finalFolder, { recursive: true });
            }
            const targetPath = path.join(finalFolder, file.filename);
            fs.renameSync(file.path, targetPath);
            const filePath = `${MEMORIES_BASE_PATH}/${user.user_id}/${parsedBody.folder_id}/${file.originalname}`;
            const imageDetails = await this.imageUploadService.addImageDetails(file, user.user_id, FILE_CATEGORIES.MEMORIES, filePath);
            const memory = await this.memoriesService.createMemory({
                folder_id: parsedBody.folder_id,
                user_id: parsedBody.user_id || user.user_id,
                image_details_id: imageDetails.id,
                description: parsedBody.description || null,
                memory_date: parsedBody.date || null
            }, user.user_id
            )
            return SuccessMessageResponse(MESSAGE.RECORD_CREATED_SUCCESSFULLY, memory);
        } else {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: 'Invalid Request',
                error: 'Invalid Request - Forebidden'
            }, HttpStatus.FORBIDDEN)
        }

    }

    @Get('')
    async findMemoriesByFolder(
        @Query() filterMemoriesDto: FilterMemoriesDto,
        // @Param('id') id: string,
        @CurrentUser() user: any
    ) {
        const memories = await this.memoriesService.findMemoriesByFolder(filterMemoriesDto, user.user_id);
        if (!memories) {
            throw new NotFoundException('No memories found');
        }
        return memories;
    }

}
