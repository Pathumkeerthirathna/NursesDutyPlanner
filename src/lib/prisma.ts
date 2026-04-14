import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

type GlobalForPrisma = typeof globalThis & {
  prisma?: PrismaClient;
  moneyDbPool?: Pool;
};

const globalForPrisma = globalThis as GlobalForPrisma;

function getConnectionString() {
  const connectionString =
    process.env.DATABASE_URL ??
    process.env.MONEY_DATABASE_DIRECT_URL ??
    process.env.MONEY_DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in the environment.");
  }

  return connectionString;
}

function createPrismaClient() {
  const pool =
    globalForPrisma.moneyDbPool ??
    new Pool({
      connectionString: getConnectionString(),
    });

  const client =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaPg(pool),
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.moneyDbPool = pool;
    globalForPrisma.prisma = client;
  }

  return client;
}

export function getPrismaClient() {
  return globalForPrisma.prisma ?? createPrismaClient();
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
