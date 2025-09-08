import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatusesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.status.findMany();
  }

  create(name: string) {
    return this.prisma.status.create({ data: { name } });
  }

  update(id: string, name: string) {
    return this.prisma.status.update({ where: { id }, data: { name } });
  }

  remove(id: string) {
    return this.prisma.status.delete({ where: { id } });
  }
}