import { PrismaClient } from '../../generated/prisma';
const prisma = new PrismaClient();
const globalForPrsima = global;
if (process.env.NODE_ENV !== 'production')
    globalForPrsima.prisma = prisma;
export default prisma;
