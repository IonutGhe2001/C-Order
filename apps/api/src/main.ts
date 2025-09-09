import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { join, sep } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

function resolveUploadsDir() {
  // rulează din src la dev și din dist la prod → mapăm către src/uploads
  const base = __dirname.includes(`${sep}dist${sep}`)
    ? __dirname.replace(`${sep}dist${sep}`, `${sep}src${sep}`)
    : __dirname;
  return join(base, 'uploads');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, cb) => (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
    credentials: true,
  });

  const UPLOAD_DIR = resolveUploadsDir();
  app.use('/uploads', express.static(UPLOAD_DIR, {
    setHeaders: (res) => res.setHeader('Cache-Control', 'no-store, max-age=0'),
  }));

  await app.listen(3001);
}
bootstrap();
