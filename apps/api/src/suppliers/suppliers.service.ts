import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  list(params: any) {
    const { q } = params;
    const where = q ? { name: { contains: q, mode: 'insensitive' as const } } : {};
    return this.prisma.supplier.findMany({ where, orderBy: { name: 'asc' } });
  }

  get(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: { tasks: { include: { attachments: true } } },
    });
  }

  create(data: any) {
    return this.prisma.supplier.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.supplier.update({ where: { id }, data });
  }
}