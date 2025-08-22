import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  findByEmail(email: string) { return this.prisma.user.findUnique({ where: { email } }); }
  findById(id: string) { return this.prisma.user.findUnique({ where: { id } }); }

  async list() {
    const users = await this.prisma.user.findMany({ select: { id: true, name: true } });
    return users.map((u) => ({ ...u, avatar: null }));
  }
}
