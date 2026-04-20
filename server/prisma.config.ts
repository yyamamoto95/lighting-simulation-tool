import path from "node:path";
import { defineConfig } from "prisma/config";

const DB_URL = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

// Prisma 7 の設定ファイル
// DB接続URLはここで管理し、schema.prisma には記述しない
export default defineConfig({
  schema: path.join(import.meta.dirname, "prisma/schema.prisma"),
  datasource: {
    url: DB_URL,
  },
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import("@prisma/adapter-libsql");
      const { createClient } = await import("@libsql/client");
      const client = createClient({ url: DB_URL });
      return new PrismaLibSql(client);
    },
  },
});
