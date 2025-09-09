import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, cb) =>
      !origin || /^https?:\/\/localhost(:\d+)?$/.test(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS')),
    credentials: true,
  });

  // <repo>/apps/api/src -> .. -> <repo>/apps/api/uploads
  const UPLOAD_DIR = join(__dirname, '..', 'uploads');
  app.use('/uploads', express.static(UPLOAD_DIR, {
    setHeaders: (res) => res.setHeader('Cache-Control', 'no-store, max-age=0'),
  }));

  await app.listen(3001);
}
bootstrap();
