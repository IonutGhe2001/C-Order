import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaService } from './prisma/prisma.service';
import { AnalyticsController } from './analytics.controller';
import { OnlyOfficeService } from './onlyoffice/onlyoffice.service';
import { OnlyOfficeController } from './onlyoffice/onlyoffice.controller';
import { StatusesModule } from './statuses/statuses.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';

@Module({
  imports: [AuthModule, UsersModule, TasksModule, StatusesModule, CustomFieldsModule],
  providers: [PrismaService, OnlyOfficeService],
  controllers: [AnalyticsController, OnlyOfficeController],
})
export class AppModule {}
