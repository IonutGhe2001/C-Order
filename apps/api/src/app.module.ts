import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaService } from './prisma/prisma.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [AuthModule, UsersModule, TasksModule],
  providers: [PrismaService],
  controllers: [AnalyticsController],
})
export class AppModule {}
