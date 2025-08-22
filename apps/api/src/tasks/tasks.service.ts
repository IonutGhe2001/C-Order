
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}
  list(params: any) {
    const { status, q } = params;
    return this.prisma.task.findMany({
      where: {
        status: status as TaskStatus | undefined,
        OR: q ? [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] : undefined,
      },
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  get(id: string) { return this.prisma.task.findUnique({ where: { id }, include: { comments: { include: { author: true } }, supplier: true } }); }
  create(data: any, ownerId: string) { return this.prisma.task.create({ data: { ...data, ownerId } }); }
}
