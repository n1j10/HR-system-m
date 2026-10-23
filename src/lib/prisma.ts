import { PrismaClient } from "@prisma/client";

// In development Next.js reloads modules often. Keeping the client on
// `globalThis` stops us from opening a new database connection every reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
