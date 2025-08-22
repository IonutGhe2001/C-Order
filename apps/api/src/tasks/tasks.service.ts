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
  get(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        comments: { include: { author: true } },
        supplier: true,
        attachments: true,
        audit: { include: { user: true } },
      },
    });
  }
  create(data: any, ownerId: string) { return this.prisma.task.create({ data: { ...data, ownerId } }); }
  update(id: string, data: any) {
    const {
      status,
      priority,
      assignees,
      supplierId,
      dueDate,
      amount,
      currency,
      title,
      description,
    } = data;
    const updateData: any = { status, priority, dueDate, amount, currency, title, description };
    if (assignees !== undefined) updateData.assignees = { set: assignees.map((userId: string) => ({ id: userId })) };
    if (supplierId !== undefined)
      updateData.supplier = supplierId ? { connect: { id: supplierId } } : { disconnect: true };
    return this.prisma.task.update({ where: { id }, data: updateData, include: { supplier: true, assignees: true } });
  }

  addComment(taskId: string, authorId: string, body: string) {
    return this.prisma.comment.create({
      data: { taskId, authorId, body },
      include: { author: true },
    });
  }
}
