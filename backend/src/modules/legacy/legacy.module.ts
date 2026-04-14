import { Module, forwardRef } from '@nestjs/common';
import { LegacyService } from './legacy.service';
import { LegacyController } from './legacy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegacyVideo } from '../../entities/legacy-video.entity';
import { LegacyImage } from '../../entities/legacy-image.entity';
import { LegacyNote } from '../../entities/legacy-note.entity';
import { PaymentsModule } from '../payment/payment.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([LegacyVideo, LegacyImage, LegacyNote]),
    forwardRef(() => PaymentsModule),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false, // Disable index.html fallback
      },
    }),
  ],
  controllers: [LegacyController],
  providers: [LegacyService],
  exports: [LegacyService],
})
export class LegacyModule {}
