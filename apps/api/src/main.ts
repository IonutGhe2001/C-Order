import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { resolve } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { existsSync } from 'fs';

function resolveUploadDir() {
  // 1) dacă rulezi din apps/api → ./uploads
  const p1 = resolve(process.cwd(), 'uploads');
  if (existsSync(p1)) return p1;
  // 2) dacă rulezi din rădăcina repo-ului → ./apps/api/uploads
  const p2 = resolve(process.cwd(), 'apps', 'api', 'uploads');
  return p2; // îl creăm la nevoie
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: (o, cb) => (!o || /^https?:\/\/localhost(:\d+)?$/.test(o) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
    credentials: true,
  });

  const UPLOAD_DIR = resolveUploadDir();
  console.log('UPLOAD_DIR =', UPLOAD_DIR);

  app.use('/uploads', (req, _res, next) => {
    const rel = decodeURIComponent(req.path.replace(/^\//, ''));
    const p = resolve(UPLOAD_DIR, rel);
    console.log('TRY:', p, 'exists:', existsSync(p));
    next();
  });

  app.use('/uploads', express.static(UPLOAD_DIR, {
    fallthrough: false,
    setHeaders: (res) => res.setHeader('Cache-Control', 'no-store, max-age=0'),
  }));

  await app.listen(3001, '0.0.0.0');
}
bootstrap();
