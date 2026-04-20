import { defineConfig } from "vitest/config";

// デフォルト環境は node（MSW が Node.js fetch を正しくインターセプト）
// DOM が必要なファイルは @vitest-environment jsdom で個別指定する
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.ts"],
  },
});
