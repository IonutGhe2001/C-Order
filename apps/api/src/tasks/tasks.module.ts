
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';
import { MailService } from '../mail.service';

@Module({
  providers: [TasksService, AuditLogService, PrismaService, MailService],
  controllers: [TasksController],
})
export class TasksModule {}
