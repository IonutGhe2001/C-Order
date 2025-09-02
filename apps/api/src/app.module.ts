import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaService } from './prisma/prisma.service';
import { AnalyticsController } from './analytics.controller';
import { OnlyOfficeService } from './onlyoffice/onlyoffice.service';
import { OnlyOfficeController } from './onlyoffice/onlyoffice.controller';

@Module({
  imports: [AuthModule, UsersModule, TasksModule],
  providers: [PrismaService, OnlyOfficeService],
  controllers: [AnalyticsController, OnlyOfficeController],
})
export class AppModule {}
