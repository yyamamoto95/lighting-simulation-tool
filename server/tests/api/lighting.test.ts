// DATABASE_URL は vitest.e2e.config.ts の env で test.db に設定される
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/infrastructure/db/client.js";

const PROJECT_ID = "e2e-test-proj";

const sampleLight = {
  type: "spotlight",
  color: 0xff0000,
  intensity: 2.0,
  position: { x: 0, y: 10, z: 0 },
  targetPosition: { x: 0, y: 0, z: 0 },
};

// 各テスト前にテスト用データをクリーンアップ
beforeEach(async () => {
  await prisma.light.deleteMany({ where: { projectId: PROJECT_ID } });
  await prisma.project.deleteMany({ where: { id: PROJECT_ID } });
});

describe("GET /api/projects/:projectId/lights", () => {
  it("存在しないプロジェクトでも 200 と空配列を返す", async () => {
    const res = await app.request(`/api/projects/${PROJECT_ID}/lights`);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("保存済みの照明を order 順に返す", async () => {
    // 事前データを直接挿入
    await prisma.project.create({ data: { id: PROJECT_ID, name: PROJECT_ID } });
    await prisma.light.createMany({
      data: [
        {
          projectId: PROJECT_ID,
          type: "cone",
          color: 0x0000ff,
          intensity: 1.0,
          positionX: 0,
          positionY: 5,
          positionZ: 0,
          targetPositionX: 0,
          targetPositionY: 0,
          targetPositionZ: 0,
          order: 0,
        },
        {
          projectId: PROJECT_ID,
          type: "spotlight",
          color: 0xff0000,
          intensity: 2.0,
          positionX: 1,
          positionY: 10,
          positionZ: 0,
          targetPositionX: 1,
          targetPositionY: 0,
          targetPositionZ: 0,
          order: 1,
        },
      ],
    });

    const res = await app.request(`/api/projects/${PROJECT_ID}/lights`);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].type).toBe("cone");
    expect(data[1].type).toBe("spotlight");
  });
});

describe("PUT /api/projects/:projectId/lights", () => {
  it("照明を保存して 200 を返す", async () => {
    const res = await app.request(`/api/projects/${PROJECT_ID}/lights`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([sampleLight]),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it("空配列を PUT すると既存の照明が全削除される", async () => {
    // 初回保存
    await app.request(`/api/projects/${PROJECT_ID}/lights`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([sampleLight]),
    });

    // 空配列で上書き
    const clearRes = await app.request(`/api/projects/${PROJECT_ID}/lights`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
    });
    expect(clearRes.status).toBe(200);

    const getRes = await app.request(`/api/projects/${PROJECT_ID}/lights`);
    expect(await getRes.json()).toEqual([]);
  });

  it("不正なカラー値は 400 を返す", async () => {
    const res = await app.request(`/api/projects/${PROJECT_ID}/lights`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ ...sampleLight, color: -1 }]),
    });

    expect(res.status).toBe(400);
  });
});

describe("PUT → GET 一貫性検証", () => {
  it("保存したデータを GET で正確に復元できる", async () => {
    const lights = [
      {
        type: "spotlight",
        color: 0xff0000,
        intensity: 2.5,
        position: { x: 1, y: 10, z: -3 },
        targetPosition: { x: 0, y: 0, z: 0 },
      },
      {
        type: "cone",
        color: 0x00ff00,
        intensity: 1.0,
        position: { x: -5, y: 8, z: 2 },
        targetPosition: { x: -2, y: 0, z: 1 },
      },
    ];

    await app.request(`/api/projects/${PROJECT_ID}/lights`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lights),
    });

    const res = await app.request(`/api/projects/${PROJECT_ID}/lights`);
    const data = await res.json();

    expect(data).toHaveLength(2);

    expect(data[0].type).toBe("spotlight");
    expect(data[0].color).toBe(0xff0000);
    expect(data[0].intensity).toBe(2.5);
    expect(data[0].position).toEqual({ x: 1, y: 10, z: -3 });
    expect(data[0].targetPosition).toEqual({ x: 0, y: 0, z: 0 });
    expect(data[0].order).toBe(0);

    expect(data[1].type).toBe("cone");
    expect(data[1].color).toBe(0x00ff00);
    expect(data[1].order).toBe(1);
  });

  it("PUT を複数回実行しても最後の内容のみ残る（全件置き換え）", async () => {
    await app.request(`/api/projects/${PROJECT_ID}/lights`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([sampleLight, sampleLight]),
    });

    await app.request(`/api/projects/${PROJECT_ID}/lights`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ ...sampleLight, type: "cone" }]),
    });

    const res = await app.request(`/api/projects/${PROJECT_ID}/lights`);
    const data = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].type).toBe("cone");
  });
});

describe("GET /api/health", () => {
  it("ヘルスチェックが 200 を返す", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
