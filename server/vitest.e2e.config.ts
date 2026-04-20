import { defineConfig } from "vitest/config";

// API e2e テスト用設定
// test.db を使用し、テスト実行前にマイグレーションを適用する
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      // 開発用 dev.db を汚染しないよう、テスト専用 DB を使用する
      DATABASE_URL: "file:./prisma/test.db",
    },
    globalSetup: ["./tests/globalSetup.ts"],
    include: ["tests/**/*.test.ts"],
    // DB を使うため並列実行を無効化
    pool: "forks",
    singleFork: true,
  },
});
