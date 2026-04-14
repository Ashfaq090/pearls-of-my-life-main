import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { AuthGraud } from 'src/common/guards/auth.guard';
import { KeyHolderGuard } from 'src/common/guards/keyholder.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import {
  FILE_CATEGORIES,
  MESSAGE,
  PROFILE_PIC_BASE_PATH,
} from 'src/common/constants';
import { ImageUploadService } from '../image-upload/image-upload.service';
import { ResponseMessageOutput } from 'src/common/interface/output-response.interface';
import { SuccessMessageResponse } from 'src/common/utils/app.utils';
import { Response } from 'express';
import { UpdateUserDto } from '../users/dtos/update-user.dto';

@UseGuards(AuthGraud)
@Controller('personal-info')
export class PersonalInfoController {
  constructor(
    private readonly usersService: UsersService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  @Get('')
  async getPersonalInfo(@CurrentUser() user: any) {
    const userDetails = await this.usersService.getPersonalInfo(user.user_id);
    return userDetails;
  }

  @Put()
  @UseGuards(KeyHolderGuard)
  async updatePerosnalInfo(
    @Body() updatePersonalInfo: UpdateUserDto,
    @CurrentUser() user: any,
  ): Promise<ResponseMessageOutput> {
    const userDetails = await this.usersService.update(
      updatePersonalInfo,
      user.user_id,
      user.user_id,
    );
    return SuccessMessageResponse(
      MESSAGE.RECORD_UPDATED_SUCCESSFULLY,
      userDetails,
    );
  }

  @Post('/upload-profile-pic')
  @UseGuards(KeyHolderGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const user: any = req?.user; // Extract userId from request params
          const userFolder = `${PROFILE_PIC_BASE_PATH}/${user?.user_id}`;
          // Ensure the folder exists
          if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true }); // Create folder and parents if needed
          }
          callback(null, userFolder); // Set destination folder
        },
        filename: (req, file, callback) => {
          callback(null, file.originalname);
        },
      }),
    }),
  )
  async uploadProfilePic(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('File upload failed');
    }
    await this.imageUploadService.removeImageDetails(
      user.user_id,
      FILE_CATEGORIES.PROFILE_PIC,
    );
    const imagepath = `${PROFILE_PIC_BASE_PATH}/${user.user_id}/${file.originalname}`;
    const imageDetails = await this.imageUploadService.addImageDetails(
      file,
      user.user_id,
      FILE_CATEGORIES.PROFILE_PIC,
      imagepath,
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.originalname}"`,
    );
    res.setHeader('Content-Type', 'application/octet-stream');
    return res.sendFile(imageDetails.image_path, { root: './' });
    // return SuccessMessageResponse(MESSAGE.RECORD_CREATED_SUCCESSFULLY)
  }

  @Get('/profile-pic')
  async getProfilePic(@CurrentUser() user: any, @Res() res: Response) {
    const imageDetails = await this.imageUploadService.getImageDetails(
      user.user_id,
      FILE_CATEGORIES.PROFILE_PIC,
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${imageDetails && imageDetails.image_file_name && 'default-user-image.png'}"`,
    );
    res.setHeader('Content-Type', 'application/octet-stream');
    return res.sendFile(
      imageDetails?.image_path ?? './uploads/default/default-user-image.png',
      { root: './' },
    );
  }
}
