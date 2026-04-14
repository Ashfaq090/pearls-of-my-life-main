import { Module } from '@nestjs/common';
import { MulterModule as NestMulterModule } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';

@Module({
    imports: [
        NestMulterModule.register(multerConfig)
    ],
    exports: [NestMulterModule]
})
export class MulterModule {}
