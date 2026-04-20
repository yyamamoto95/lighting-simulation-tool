import { describe, expect, it, vi } from "vitest";
import { Light } from "../../domain/models/Light.js";
import type { ILightRepository } from "../../domain/repositories/ILightRepository.js";
import { GetLightingUseCase, UpdateLightingUseCase } from "./LightingUseCases.js";

// ILightRepository のモック
const makeMockRepo = (overrides?: Partial<ILightRepository>): ILightRepository => ({
  findAllByProjectId: vi.fn().mockResolvedValue([]),
  replaceAll: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const sampleLight = Light.create({
  id: "light-1",
  type: "spotlight",
  color: 0xff0000,
  intensity: 2.0,
  position: { x: 0, y: 10, z: 0 },
  targetPosition: { x: 0, y: 0, z: 0 },
  order: 0,
});

const sampleInput = {
  type: "spotlight" as const,
  color: 0xff0000,
  intensity: 2.0,
  position: { x: 0, y: 10, z: 0 },
  targetPosition: { x: 0, y: 0, z: 0 },
};

describe("GetLightingUseCase", () => {
  it("リポジトリの findAllByProjectId を呼び出す", async () => {
    const repo = makeMockRepo({
      findAllByProjectId: vi.fn().mockResolvedValue([sampleLight]),
    });
    const useCase = new GetLightingUseCase(repo);

    const result = await useCase.execute("proj-1");

    expect(repo.findAllByProjectId).toHaveBeenCalledWith("proj-1");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("spotlight");
  });

  it("空のプロジェクトでは空配列を返す", async () => {
    const repo = makeMockRepo();
    const useCase = new GetLightingUseCase(repo);

    const result = await useCase.execute("empty-proj");
    expect(result).toEqual([]);
  });
});

describe("UpdateLightingUseCase", () => {
  it("有効な入力で replaceAll を呼び出す", async () => {
    const repo = makeMockRepo();
    const useCase = new UpdateLightingUseCase(repo);

    await useCase.execute("proj-1", [sampleInput]);

    expect(repo.replaceAll).toHaveBeenCalledWith("proj-1", [sampleInput]);
  });

  it("空の配列でも replaceAll を呼び出す（全削除）", async () => {
    const repo = makeMockRepo();
    const useCase = new UpdateLightingUseCase(repo);

    await useCase.execute("proj-1", []);

    expect(repo.replaceAll).toHaveBeenCalledWith("proj-1", []);
  });

  it("不正なカラー値があれば replaceAll を呼ばずにエラー", async () => {
    const repo = makeMockRepo();
    const useCase = new UpdateLightingUseCase(repo);

    await expect(useCase.execute("proj-1", [{ ...sampleInput, color: -1 }])).rejects.toThrow(
      "不正なカラー値",
    );

    expect(repo.replaceAll).not.toHaveBeenCalled();
  });

  it("不正な強度があれば replaceAll を呼ばずにエラー", async () => {
    const repo = makeMockRepo();
    const useCase = new UpdateLightingUseCase(repo);

    await expect(useCase.execute("proj-1", [{ ...sampleInput, intensity: 99 }])).rejects.toThrow(
      "強度は 0〜5",
    );

    expect(repo.replaceAll).not.toHaveBeenCalled();
  });

  it("複数件のうち 1 件でも不正であれば全件保存しない", async () => {
    const repo = makeMockRepo();
    const useCase = new UpdateLightingUseCase(repo);
    const inputs = [
      sampleInput,
      { ...sampleInput, color: 0x1000000 }, // 不正
    ];

    await expect(useCase.execute("proj-1", inputs)).rejects.toThrow();
    expect(repo.replaceAll).not.toHaveBeenCalled();
  });
});
