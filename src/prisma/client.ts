import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// For serverless environments (Vercel), we need to create a new instance for each request
// This prevents connection pooling issues that cause "prepared statement does not exist" errors
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

// In development, reuse the same instance
if (process.env.NODE_ENV === 'development') {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  var prisma = globalForPrisma.prisma;
} else {
  // In production, create a new instance each time
  var prisma = createPrismaClient();
  
  // Clean up connection when the function terminates
  if (typeof process !== 'undefined') {
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });
  }
}

export { prisma };

// This module is for re-using a single PrismaClient instance instead of creating new one every time
