import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthGraud } from './common/guards/auth.guard';
import { join } from 'path';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
// import * as dotenv from 'dotenv';
// dotenv.config();
async function bootstrap() {
  process.env.TZ = 'UTC';
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve uploaded files at /uploads.
  // IMPORTANT: process.cwd() depends on where the server is started from.
  // - If started from repo root: <root>/backend/uploads
  // - If started from backend/:  <root>/backend/uploads (as <cwd>/uploads)
  const cwd = process.cwd();
  const candidates = [
    join(cwd, 'uploads'), // when started inside backend/
    join(cwd, 'backend', 'uploads'), // when started from repo root
  ];
  const uploadsDir = candidates.find((p) => fs.existsSync(p)) ?? candidates[0];

  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });
  // Helpful log so you can SEE what directory is being served
  console.log(`[static] Serving /uploads from: ${uploadsDir}`);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enables automatic transformation of input types
      whitelist: true, // Strips any properties not in the DTO
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://pearlsofmylyfe.com',
      'https://pearlsofmylyfe.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);

  try {
    const dataSource = app.get(DataSource);
    await dataSource.query('SELECT 1');
    console.log('[DB] Connection pool warmed up');
  } catch (err) {
    console.error('[DB] Warm-up query failed:', err?.message);
  }
}
bootstrap();
