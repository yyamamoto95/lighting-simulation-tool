import { defineConfig } from "vitest/config";

// 単体テスト用設定（domain / application 層）
// DB への接続は行わない
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
