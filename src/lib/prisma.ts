import { PrismaClient } from '@prisma/client';

const DEFAULT_MONGO_URL =
  'mongodb+srv://gk1204kr:GbxiGEitN2W2p1U3@cluster0.yxtklsn.mongodb.net/kalipujaparora?retryWrites=true&w=majority';

const dbUrl = process.env.DATABASE_URL || process.env.MONGO_URL || DEFAULT_MONGO_URL;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}
if (!process.env.MONGO_URL) {
  process.env.MONGO_URL = dbUrl;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

