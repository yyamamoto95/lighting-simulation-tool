import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { handlers } from "../../tests/handlers.js";
import { api } from "./client.js";

// このファイル専用の MSW サーバー（setupFiles の共有インスタンスとは分離）
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const PROJECT_ID = "test-proj";

const mockLight = {
  id: "light-1",
  order: 0,
  type: "spotlight",
  color: 0xff0000,
  intensity: 2.0,
  position: { x: 0, y: 10, z: 0 },
  targetPosition: { x: 0, y: 0, z: 0 },
};

describe("api.lights.list", () => {
  it("照明一覧を取得できる", async () => {
    server.use(
      http.get(`http://localhost:5173/api/projects/${PROJECT_ID}/lights`, () =>
        HttpResponse.json([mockLight]),
      ),
    );

    const lights = await api.lights.list(PROJECT_ID);

    expect(lights).toHaveLength(1);
    expect(lights[0].type).toBe("spotlight");
    expect(lights[0].color).toBe(0xff0000);
  });

  it("空の場合は空配列を返す", async () => {
    const lights = await api.lights.list(PROJECT_ID);
    expect(lights).toEqual([]);
  });

  it("サーバーエラー時は Error をスロー", async () => {
    server.use(
      http.get(`http://localhost:5173/api/projects/${PROJECT_ID}/lights`, () =>
        HttpResponse.json({ error: "internal error" }, { status: 500 }),
      ),
    );

    await expect(api.lights.list(PROJECT_ID)).rejects.toThrow("照明一覧の取得に失敗しました");
  });
});

describe("api.lights.save", () => {
  const input = {
    type: "spotlight" as const,
    color: 0xff0000,
    intensity: 2.0,
    position: { x: 0, y: 10, z: 0 },
    targetPosition: { x: 0, y: 0, z: 0 },
  };

  it("照明データを保存できる", async () => {
    await expect(api.lights.save(PROJECT_ID, [input])).resolves.toBeUndefined();
  });

  it("保存時にリクエストボディが正しく送信される", async () => {
    let capturedBody: unknown;
    server.use(
      http.put(`http://localhost:5173/api/projects/${PROJECT_ID}/lights`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ success: true });
      }),
    );

    await api.lights.save(PROJECT_ID, [input]);

    expect(capturedBody).toEqual([input]);
  });

  it("サーバーエラー時は Error をスロー", async () => {
    server.use(
      http.put(`http://localhost:5173/api/projects/${PROJECT_ID}/lights`, () =>
        HttpResponse.json({ error: "db error" }, { status: 500 }),
      ),
    );

    await expect(api.lights.save(PROJECT_ID, [input])).rejects.toThrow(
      "照明データの保存に失敗しました",
    );
  });
});
