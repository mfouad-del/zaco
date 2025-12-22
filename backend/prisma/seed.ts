import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.create({
    data: {
      nameAr: 'شركة زوايا البناء',
      nameEn: 'Zawaya Albina',
      logoUrl: 'https://via.placeholder.com/150',
    },
  });

  const passwordHash = await argon2.hash('admin123');

  const user = await prisma.user.create({
    data: {
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
