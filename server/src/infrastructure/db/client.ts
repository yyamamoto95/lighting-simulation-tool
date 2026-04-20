import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

// Prisma 7 では Config を直接 PrismaLibSql に渡す（createClient 不要）
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

export const prisma = new PrismaClient({ adapter });
