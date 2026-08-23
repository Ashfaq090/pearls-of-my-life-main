import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './modules/users/users.module';
import { NotesModule } from './modules/notes/notes.module';
import { AuthModule } from './modules/auth/auth.module';
import { CredentialsModule } from './modules/credentials/credentials.module';
import { PersonalInfoModule } from './modules/personal-info/personal-info.module';
import { ImageUploadModule } from './modules/image-upload/image-upload.module';
import { KeyHoldersModule } from './modules/key-holders/key-holders.module';
import { MemoriesModule } from './modules/memories/memories.module';
import { ObituaryInfoModule } from './modules/obituary-info/obituary-info.module';
import { PaymentsModule as PaymentModuleFromPayment } from './modules/payment/payment.module';
import { LegacyModule } from './modules/legacy/legacy.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';
import { User } from './entities/user.entity';
import { KeyHolder } from './entities/keyholder.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { Payment } from './entities/payment.entity';
import { UploadedContent } from './entities/uploaded-content.entity';
import { EmailLog } from './entities/email-log.entity';
import { ImageCategories } from './entities/image-categories.entity';
import { ImageDetails } from './entities/image-details.entity';
import { ImageFolder } from './entities/image-folder.entity';
import { ObituaryInfo } from './entities/obituary-info.entity';
import { Notes } from './entities/notes.entity';
import { Memories } from './entities/memories.entity';
import { MemoryFolders } from './entities/memory-folders.entity';
import { Credentials } from './entities/credentials.entity';
import { LegacyVideo } from './entities/legacy-video.entity';
import { LegacyImage } from './entities/legacy-image.entity';
import { LegacyNote } from './entities/legacy-note.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: false,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASS', 'password'),
        database: configService.get('DB_NAME', 'pearloflife'),
        entities: [
          User,
          KeyHolder,
          SubscriptionPlan,
          UserSubscription,
          Payment,
          UploadedContent,
          EmailLog,
          ImageCategories,
          ImageDetails,
          ImageFolder,
          ObituaryInfo,
          Notes,
          Memories,
          MemoryFolders,
          Credentials,
          LegacyVideo,
          LegacyImage,
          LegacyNote,
        ],
        synchronize: false, // Disabled - tables created manually via SQL script
        logging: configService.get('NODE_ENV') === 'development',
        charset: 'utf8mb4',
        // timezone: '+00:00',
        timezone: 'Z',
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => PaymentsModule),
    forwardRef(() => PaymentModuleFromPayment),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => NotesModule),
    forwardRef(() => PersonalInfoModule),
    forwardRef(() => CredentialsModule),
    forwardRef(() => ImageUploadModule),
    forwardRef(() => KeyHoldersModule),
    forwardRef(() => MemoriesModule),
    forwardRef(() => ObituaryInfoModule),
    forwardRef(() => LegacyModule),
    forwardRef(() => AdminModule),
  ],
})
export class AppModule {}

// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(ProxyMiddleware).forRoutes('*'); // Apply to all routes
//   }
// }
