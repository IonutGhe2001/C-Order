import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';
import { promises as fs } from 'fs';
import { join } from 'path';
import { MailService } from '../mail.service';
export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const statusValues = Object.values(TaskStatus);

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService, private mail: MailService) {}
  list(params: any) {
    const { q, status, orderDate, authority } = params;

    if (status && !statusValues.includes(status as TaskStatus)) {
      throw new BadRequestException('Invalid status');
    }

    const where: any = {
      ...(status ? { status: status as TaskStatus } : {}),
      ...(orderDate ? { orderDate: new Date(orderDate) } : {}),
      ...(authority
        ? { authority: { contains: authority, mode: 'insensitive' } }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.task.findMany({
      where,
      include: { supplier: true, owner: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  async summary(range?: string) {
    const grouped = await this.prisma.task.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return Object.values(TaskStatus).map((status) => {
      const found: any = grouped.find((g) => g.status === status);
      const value = found ? found._count._all : 0;
      const result: any = { title: status, value, trend: [value] };
      if (found?.delta !== undefined) result.delta = found.delta;
      if (found?.icon !== undefined) result.icon = found.icon;
      if (found?.href !== undefined) result.href = found.href;
      return result;
    });
  }
  
  get(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        comments: { include: { author: true } },
        supplier: true,
        attachments: true,
      },
    });
  }
  create(data: any, ownerId: string) {
    const {
      assignees,
      supplierId,
      orderDate,
      orderReceivedDate,
      orderNumber,
      authority,
      orderType,
      productsReceivedDate,
      deliveryDate,
      status,
      priority,
      dueDate,
      amount,
      currency,
      title,
      description,
    } = data;

    if (status && !statusValues.includes(status as TaskStatus)) {
      throw new BadRequestException('Invalid status');
    }

    let computedDelivery = deliveryDate;
    if (!computedDelivery && orderDate) {
      const d = new Date(orderDate);
      d.setDate(d.getDate() + 4);
      computedDelivery = d;
    }

    const createData: any = {
      status,
      priority,
      dueDate,
      amount,
      currency,
      title,
      description,
      orderDate,
      orderReceivedDate,
      orderNumber,
      authority,
      orderType,
      productsReceivedDate,
      deliveryDate: computedDelivery,
      ownerId,
    };
    if (assignees)
      createData.assignees = { connect: assignees.map((userId: string) => ({ id: userId })) };
    if (supplierId)
      createData.supplier = { connect: { id: supplierId } };

    return this.prisma.task.create({ data: createData, include: { supplier: true, assignees: true } });
  }

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
      orderDate,
      orderReceivedDate,
      orderNumber,
      authority,
      orderType,
      productsReceivedDate,
      deliveryDate,
    } = data;
    if (status && !statusValues.includes(status as TaskStatus)) {
      throw new BadRequestException('Invalid status');
    }
    const updateData: any = {
      status,
      priority,
      dueDate,
      amount,
      currency,
      title,
      description,
      orderDate,
      orderReceivedDate,
      orderNumber,
      authority,
      orderType,
      productsReceivedDate,
    };

    if (deliveryDate !== undefined) updateData.deliveryDate = deliveryDate;
    else if (orderDate) {
      const d = new Date(orderDate);
      d.setDate(d.getDate() + 4);
      updateData.deliveryDate = d;
    }

    if (assignees !== undefined)
      updateData.assignees = { set: assignees.map((userId: string) => ({ id: userId })) };
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

  async sendEmail(id: string, to: string[], subject: string, body: string, attachmentIds?: string[]) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { attachments: true },
    });
    if (!task) throw new BadRequestException('Task not found');
    const atts = task.attachments
      .filter((a) => !attachmentIds || attachmentIds.includes(a.id))
      .map((a) => ({
        filename: a.filename,
        path: join(process.cwd(), a.url.startsWith('/') ? a.url.slice(1) : a.url),
      }));
    await this.mail.sendMail({ to, subject, html: body, attachments: atts });
    return { sent: true };
  }

  async updateAttachment(taskId: string, attId: string, file: UploadedFile) {
    const uploadDir = join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = join(uploadDir, filename);
    await fs.writeFile(filepath, file.buffer);
    const data = {
      filename: file.originalname,
      url: `/uploads/${filename}`,
      mimeType: file.mimetype,
      size: file.size,
      taskId,
    };
    if (attId === 'new') {
      return this.prisma.attachment.create({ data });
    }
    return this.prisma.attachment.update({ where: { id: attId }, data });
  }
}
