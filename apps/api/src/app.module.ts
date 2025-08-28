import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, UsersModule, TasksModule, SuppliersModule],
  providers: [PrismaService],
})
export class AppModule {}
