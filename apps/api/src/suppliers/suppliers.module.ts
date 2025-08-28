import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [SuppliersService, PrismaService],
  controllers: [SuppliersController],
})
export class SuppliersModule {}