import { Module } from '@nestjs/common';
import { PersonalInfoController } from './personal-info.controller';
import { UsersModule } from '../users/users.module';
import { MulterModule } from '@nestjs/platform-express';
import { ImageUploadModule } from '../image-upload/image-upload.module';

@Module({
  imports:[
    UsersModule,
    ImageUploadModule
    // MulterModule.register({
    //   dest: './uploads'
    // })
    // MulterModule.registerAsync({
    //   useFactory: () => ({
    //     dest: './upload',
    //   })
    // })
  ],
  controllers: [PersonalInfoController]
})
export class PersonalInfoModule {}
