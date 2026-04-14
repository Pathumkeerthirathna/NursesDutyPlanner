import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  process.env.MONEY_DATABASE_DIRECT_URL ??
  process.env.MONEY_DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment.");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  moneyDbPool?: Pool;
};

const pool =
  globalForPrisma.moneyDbPool ??
  new Pool({
    connectionString,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.moneyDbPool = pool;
  globalForPrisma.prisma = prisma;
}

export default prisma;
