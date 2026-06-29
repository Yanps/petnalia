import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

export interface TestDatabase {
  prisma: PrismaClient;
  url: string;
  clear: () => Promise<void>;
  teardown: () => Promise<void>;
}

export async function setupTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('postgis/postgis:16-3.4')
    .withDatabase('petnalia_test')
    .withUsername('petnalia')
    .withPassword('petnalia')
    .start();

  const url = container.getConnectionUri();

  execSync('pnpm prisma migrate deploy', {
    cwd: resolve(process.cwd()),
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
    stdio: 'pipe',
  });

  const prisma = new PrismaClient({ datasourceUrl: url });
  await prisma.$connect();

  return {
    prisma,
    url,
    clear: async () => {
      await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;
    },
    teardown: async () => {
      await prisma.$disconnect();
      await container.stop();
    },
  };
}
