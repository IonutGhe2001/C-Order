import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // În Prisma 5 nu mai trebuie this.$on('beforeExit')
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}