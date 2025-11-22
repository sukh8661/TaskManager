import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = globalForPrisma.prisma;
}

// Test connection on startup (non-blocking)
setTimeout(() => {
  prisma.$connect()
    .then(() => {
      console.log('✅ Prisma connected to MongoDB successfully');
    })
    .catch((error: any) => {
      console.error('❌ Prisma connection error:', error.message);
      console.error('Please check your DATABASE_URL in .env file');
      console.error('Run: npx prisma generate && npx prisma db push');
    });
}, 1000);

export default prisma;

