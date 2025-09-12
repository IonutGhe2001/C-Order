import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Priority } from '@prisma/client';
import { promises as fs } from 'fs';
import { join } from 'path';
import { MailService } from '../mail.service';
export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const priorityValues = Object.values(Priority);

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService, private mail: MailService) {}
  list(params: any) {
    const { q, status, orderDate, authority, priority, assignees, from, to } = params;
    if (priority && !priorityValues.includes(priority as Priority)) {
      throw new BadRequestException('Invalid priority');
    }

    const where: any = {
      ...(status ? { status } : {}),
      ...(priority ? { priority: priority as Priority } : {}),
      ...(orderDate ? { orderDate: new Date(orderDate) } : {}),
      ...(authority
        ? { authority: { contains: authority, mode: 'insensitive' } }
        : {}),
        ...(assignees
        ? {
            assignees: {
              some: {
                id: {
                  in: Array.isArray(assignees) ? assignees : [assignees],
                },
              },
            },
          }
        : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
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

    return this.prisma.task
      .findMany({
        where,
        include: { supplier: true, owner: true, assignees: true, customValues: true },
        orderBy: { createdAt: 'desc' },
      })
      .then((tasks) =>
        tasks.map((t) => ({
          ...t,
          custom: Object.fromEntries(t.customValues.map((cv) => [cv.fieldId, cv.value || ''])),
        })),
      );
  }
  async summary(range?: string) {
    const grouped = await this.prisma.task.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return grouped.map((g) => ({
      title: g.status,
      value: g._count._all,
      trend: [g._count._all],
    }));
  }
  
  get(id: string) {
    return this.prisma.task
      .findUnique({
        where: { id },
        include: {
          comments: { include: { author: true } },
          supplier: true,
          attachments: true,
          customValues: true,
        },
      })
      .then((t) =>
        t
          ? {
              ...t,
              custom: Object.fromEntries(t.customValues.map((cv) => [cv.fieldId, cv.value || ''])),
            }
          : null,
      );
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
      custom,
    } = data;


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

    return this.prisma.task.create({
      data: {
        ...createData,
        customValues: custom
          ? {
              create: Object.entries(custom).map(([fieldId, value]) => ({
                fieldId,
                value,
              })),
            }
          : undefined,
      },
      include: { supplier: true, assignees: true, customValues: true },
    }).then((t) => ({
      ...t,
      custom: Object.fromEntries(t.customValues.map((cv) => [cv.fieldId, cv.value || ''])),
    }));
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
      custom,
    } = data;
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
    return this.prisma.task
      .update({
        where: { id },
        data: {
          ...updateData,
          ...(custom
            ? {
                customValues: {
                  deleteMany: { fieldId: { in: Object.keys(custom) } },
                  create: Object.entries(custom).map(([fieldId, value]) => ({
                    fieldId,
                    value,
                  })),
                },
              }
            : {}),
        },
        include: { supplier: true, assignees: true, customValues: true },
      })
      .then((t) => ({
        ...t,
        custom: Object.fromEntries(t.customValues.map((cv) => [cv.fieldId, cv.value || ''])),
      }));
  }

  async delete(id: string) {
    const attachments = await this.prisma.attachment.findMany({ where: { taskId: id } });
    await Promise.all(
      attachments.map((a) =>
        fs
          .unlink(join(process.cwd(), a.url.startsWith('/') ? a.url.slice(1) : a.url))
          .catch(() => undefined),
      ),
    );
    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { taskId: id } }),
      this.prisma.attachment.deleteMany({ where: { taskId: id } }),
      this.prisma.taskTag.deleteMany({ where: { taskId: id } }),
      this.prisma.taskCustomFieldValue.deleteMany({ where: { taskId: id } }),
      this.prisma.auditLog.deleteMany({ where: { taskId: id } }),
      this.prisma.task.delete({ where: { id } }),
    ]);
    return { deleted: true };
  }

  async archive(id: string) {
    await this.prisma.task.update({ where: { id }, data: { status: 'ARCHIVED' } });
    return { archived: true };
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
    const data: any = {
      filename: file.originalname,
      url: `/uploads/${filename}`,
      mimeType: file.mimetype,
      size: file.size,
      taskId,
    };
    if (attId === 'new') {
      return this.prisma.attachment.create({ data });
    }
    data.version = { increment: 1 };
    return this.prisma.attachment.update({ where: { id: attId }, data });
  }

  getAttachment(attId: string) {
    return this.prisma.attachment.findUniqueOrThrow({ where: { id: attId } });
  }
  
  async deleteAttachment(taskId: string, attId: string) {
    const attachment = await this.prisma.attachment.findFirst({ where: { id: attId, taskId } });
    if (!attachment) throw new BadRequestException('Attachment not found');
    const filepath = join(process.cwd(), attachment.url.startsWith('/') ? attachment.url.slice(1) : attachment.url);
    await fs.unlink(filepath).catch(() => undefined);
    await this.prisma.attachment.delete({ where: { id: attId } });
    return { deleted: true };
  }
}
