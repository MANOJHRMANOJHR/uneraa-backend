import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const globalForPrsima = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== 'production') globalForPrsima.prisma = prisma;

export default prisma;
