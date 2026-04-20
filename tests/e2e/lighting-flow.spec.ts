import { expect, test } from "@playwright/test";

const PROJECT_ID = "default";
const SERVER_URL = "http://localhost:3000";

// 各テスト前にDBをクリーンアップ（dev.db の汚染防止 + テスト冪等性確保）
test.beforeEach(async ({ request }) => {
  await request.put(`${SERVER_URL}/api/projects/${PROJECT_ID}/lights`, {
    data: [],
    headers: { "Content-Type": "application/json" },
  });
});

test.describe("照明の追加・保存・復元フロー", () => {
  test("スポットライトを追加して保存し、APIから確認できる", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    // アプリのロードを待つ（コントロールパネルが表示されるまで）
    await expect(page.getByRole("button", { name: "スポットライト" })).toBeVisible();

    // ライトを追加
    await page.getByRole("button", { name: "スポットライト" }).click();

    // 保存
    const [putResponse] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`/api/projects/${PROJECT_ID}/lights`) &&
          res.request().method() === "PUT",
      ),
      page.getByRole("button", { name: "保存" }).click(),
    ]);

    expect(putResponse.status()).toBe(200);

    // API から直接確認
    const getResponse = await request.get(
      `${SERVER_URL}/api/projects/${PROJECT_ID}/lights`,
    );
    const lights = await getResponse.json();

    expect(lights).toHaveLength(1);
    expect(lights[0].type).toBe("spotlight");
  });

  test("複数種類のライトを追加して保存できる", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "スポットライト" })).toBeVisible();

    // 3種類追加
    await page.getByRole("button", { name: "スポットライト" }).click();
    await page.getByRole("button", { name: "コーン型ライト" }).click();
    await page.getByRole("button", { name: "シリンダー型A" }).click();

    // 保存完了を待つ
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`/api/projects/${PROJECT_ID}/lights`) &&
          res.request().method() === "PUT",
      ),
      page.getByRole("button", { name: "保存" }).click(),
    ]);

    // API で検証
    const getResponse = await request.get(
      `${SERVER_URL}/api/projects/${PROJECT_ID}/lights`,
    );
    const lights = await getResponse.json();

    expect(lights).toHaveLength(3);
    const types = lights.map((l: { type: string }) => l.type);
    expect(types).toContain("spotlight");
    expect(types).toContain("cone");
    expect(types).toContain("cylinder-a");
  });

  test("保存済みデータがページリロード後も API に残っている", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "スポットライト" })).toBeVisible();

    // ライトを追加・保存
    await page.getByRole("button", { name: "コーン型ライト" }).click();
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`/api/projects/${PROJECT_ID}/lights`) &&
          res.request().method() === "PUT",
      ),
      page.getByRole("button", { name: "保存" }).click(),
    ]);

    // ページリロード
    await page.reload();
    await expect(page.getByRole("button", { name: "スポットライト" })).toBeVisible();

    // リロード後も API にデータが残っている
    const getResponse = await request.get(
      `${SERVER_URL}/api/projects/${PROJECT_ID}/lights`,
    );
    const lights = await getResponse.json();

    expect(lights).toHaveLength(1);
    expect(lights[0].type).toBe("cone");
  });
});

test.describe("ヘルスチェック", () => {
  test("バックエンドが正常応答する", async ({ request }) => {
    const res = await request.get(`${SERVER_URL}/api/health`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
