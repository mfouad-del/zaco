import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Ensure a single canonical Zawaya company and update its display name/logo
  const existing = await prisma.company.findMany({ where: { nameEn: 'Zawaya Albina' }, orderBy: { createdAt: 'asc' } });
  let company;
  if (existing.length === 0) {
    company = await prisma.company.create({
      data: {
        nameAr: 'شركة زوايا البناء للإستشارات الهندسيه',
        nameEn: 'Zawaya Albina',
        logoUrl: 'https://www.zaco.sa/logo2.png',
      },
    });
  } else {
    // Keep first, delete duplicates
    company = existing[0];
    if (existing.length > 1) {
      const idsToRemove = existing.slice(1).map(c => c.id);
      await prisma.company.deleteMany({ where: { id: { in: idsToRemove } } });
    }
    // Update name/logo to canonical values
    await prisma.company.update({ where: { id: company.id }, data: { nameAr: 'شركة زوايا البناء للإستشارات الهندسيه', logoUrl: 'https://www.zaco.sa/logo2.png' } });
  }

  // Ensure the second company exists (Tahalof) and set logo to canonical
  await prisma.company.upsert({
    where: { nameEn: 'Tahalof Al-Jazeerah' },
    update: { logoUrl: 'https://www.zaco.sa/logo2.png' },
    create: {
      nameAr: 'تحالفات الجزيره',
      nameEn: 'Tahalof Al-Jazeerah',
      logoUrl: 'https://www.zaco.sa/logo2.png',
    },
  });

  // Do not create any users from seed in production; keep DB companies only
  console.log('Seed completed: ensured companies');

  console.log({ company });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
