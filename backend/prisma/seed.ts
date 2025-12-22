import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { nameEn: 'Zawaya Albina' },
    update: {},
    create: {
      nameAr: 'شركة زوايا البناء',
      nameEn: 'Zawaya Albina',
      logoUrl: 'https://zaco.sa/logo2.png',
    },
  });

  // Add second company if not exists
  const company2 = await prisma.company.upsert({
    where: { nameEn: 'Tahalof Al-Jazeerah' },
    update: {},
    create: {
      nameAr: 'تحالفات الجزيره',
      nameEn: 'Tahalof Al-Jazeerah',
      logoUrl: 'https://zaco.sa/logo2.png',
    },
  });

  const passwordHash = await argon2.hash('admin123');

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { companyId: company.id },
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  console.log({ company, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
