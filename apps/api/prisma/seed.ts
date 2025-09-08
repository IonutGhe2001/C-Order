
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@corp.local' },
    update: {},
    create: { email: 'admin@corp.local', password: pass, name: 'Admin', role: Role.ADMIN },
  });
  // sample supplier and task
  const sup = await prisma.supplier.create({ data: { name: 'ACME SRL' } });
  const owner = await prisma.user.findUnique({ where: { email: 'admin@corp.local' } });
  await prisma.status.createMany({
    data: [
      { name: 'OPEN' },
      { name: 'IN_PROGRESS' },
      { name: 'LIVRAT_PARTIAL' },
      { name: 'FINALIZAT' },
    ],
    skipDuplicates: true,
  });
  await prisma.task.create({ data: { title: 'Primul task', description: 'MVP procurement', ownerId: owner!.id, supplierId: sup.id, status: 'OPEN' } });
}

main().finally(()=>prisma.$disconnect());
