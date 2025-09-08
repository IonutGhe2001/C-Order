import { Module } from '@nestjs/common';
import { StatusesController } from './statuses.controller';
import { StatusesService } from './statuses.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [StatusesController],
  providers: [StatusesService, PrismaService],
})
export class StatusesModule {}