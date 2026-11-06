import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // افزایش محدودیت حجم body برای پشتیبانی از آپلود base64 تصاویر
  // 5MB برای تصاویر پروفایل و سایر آپلودهای کوچک
  app.use(
    require('express').json({ limit: '5mb' }),
  );
  app.use(
    require('express').urlencoded({ limit: '5mb', extended: true }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS - تنظیم کامل برای Admin Panel
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
  console.log(`✅ CORS enabled for: http://localhost:3001`);
}

bootstrap();
