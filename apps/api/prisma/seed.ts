import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // TODO: seed specialties
  // TODO: seed admin user
  // TODO: seed demo veterinarians with São Paulo coordinates
  console.log('Seed completed');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
