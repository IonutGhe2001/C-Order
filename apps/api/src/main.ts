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
    origin: (o, cb) => (!o || /^https?:\/\/localhost(:\d+)?$/.test(o) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
    credentials: true,
  });

  // folosește calea absolută către apps/api/uploads indiferent de src/dist
  const UPLOAD_DIR = join(__dirname, '..', 'uploads'); // <repo>/apps/api/uploads
  app.use('/uploads', express.static(UPLOAD_DIR, {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-store, max-age=0'),
  }));

  await app.listen(3001);
}
bootstrap();
