import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: process.env["CI"] ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // テスト実行前にフロントエンドとバックエンドを自動起動する
  webServer: [
    {
      command: "pnpm --filter server dev",
      url: "http://localhost:3000/api/health",
      reuseExistingServer: !process.env["CI"],
      env: {
        // e2e テスト専用 DB（dev.db を汚染しない）
        DATABASE_URL: "file:./prisma/test.db",
      },
    },
    {
      command: "pnpm --filter client dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env["CI"],
    },
  ],
});
