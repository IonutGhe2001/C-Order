import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomFieldsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.customField.findMany();
  }

  create(name: string, label: string) {
    return this.prisma.customField.create({ data: { name, label } });
  }

  update(id: string, label: string) {
    return this.prisma.customField.update({ where: { id }, data: { label } });
  }

  remove(id: string) {
    return this.prisma.customField.delete({ where: { id } });
  }
}