
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';

@Module({
  providers: [TasksService, AuditLogService, PrismaService],
  controllers: [TasksController],
})
export class TasksModule {}
