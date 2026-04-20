import { execSync } from "node:child_process";
import { resolve } from "node:path";

const serverDir = resolve(import.meta.dirname, "..");

// テスト実行前に test.db へ最新マイグレーションを適用する（一度だけ実行）
export function setup() {
  execSync("pnpm prisma migrate deploy", {
    cwd: serverDir,
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
    stdio: "pipe",
  });
}
