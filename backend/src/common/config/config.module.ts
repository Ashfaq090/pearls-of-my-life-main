import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import app from './app.config';
import database from './db.config';
// import { validate } from '@common/config/env.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      //   validate,
      load: [app, database],
    }),
  ],
  exports: [],
})
export class ConfigModule {}
