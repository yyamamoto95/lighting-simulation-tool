import { describe, expect, it } from "vitest";
import { Light, validateNewLight } from "./Light.js";

const validParams = {
  id: "test-id",
  type: "spotlight" as const,
  color: 0xff0000,
  intensity: 2.0,
  position: { x: 0, y: 10, z: 0 },
  targetPosition: { x: 0, y: 0, z: 0 },
  order: 0,
};

describe("Light.create", () => {
  it("有効な値でエンティティを作成できる", () => {
    const light = Light.create(validParams);
    expect(light.id).toBe("test-id");
    expect(light.color).toBe(0xff0000);
    expect(light.intensity).toBe(2.0);
    expect(light.position).toEqual({ x: 0, y: 10, z: 0 });
  });

  it("カラー値の下限（0x000000）を受け付ける", () => {
    const light = Light.create({ ...validParams, color: 0 });
    expect(light.color).toBe(0);
  });

  it("カラー値の上限（0xffffff）を受け付ける", () => {
    const light = Light.create({ ...validParams, color: 0xffffff });
    expect(light.color).toBe(0xffffff);
  });

  it("カラー値が負の場合はエラー", () => {
    expect(() => Light.create({ ...validParams, color: -1 })).toThrow("不正なカラー値");
  });

  it("カラー値が 0xffffff 超の場合はエラー", () => {
    expect(() => Light.create({ ...validParams, color: 0x1000000 })).toThrow("不正なカラー値");
  });

  it("カラー値が小数の場合はエラー", () => {
    expect(() => Light.create({ ...validParams, color: 0.5 })).toThrow("不正なカラー値");
  });

  it("強度の下限（0）を受け付ける", () => {
    const light = Light.create({ ...validParams, intensity: 0 });
    expect(light.intensity).toBe(0);
  });

  it("強度の上限（5）を受け付ける", () => {
    const light = Light.create({ ...validParams, intensity: 5 });
    expect(light.intensity).toBe(5);
  });

  it("強度が 0 未満の場合はエラー", () => {
    expect(() => Light.create({ ...validParams, intensity: -0.1 })).toThrow("強度は 0〜5");
  });

  it("強度が 5 超の場合はエラー", () => {
    expect(() => Light.create({ ...validParams, intensity: 5.1 })).toThrow("強度は 0〜5");
  });

  it("各 LightType を受け付ける", () => {
    const types = ["spotlight", "cone", "cylinder-a", "cylinder-b"] as const;
    for (const type of types) {
      const light = Light.create({ ...validParams, type });
      expect(light.type).toBe(type);
    }
  });
});

describe("validateNewLight", () => {
  it("有効なデータはエラーなし", () => {
    expect(() =>
      validateNewLight({
        type: "cone",
        color: 0x00ff00,
        intensity: 1.5,
        position: { x: 1, y: 2, z: 3 },
        targetPosition: { x: 0, y: 0, z: 0 },
      }),
    ).not.toThrow();
  });

  it("不正なカラー値はエラー", () => {
    expect(() =>
      validateNewLight({
        type: "cone",
        color: -1,
        intensity: 1,
        position: { x: 0, y: 0, z: 0 },
        targetPosition: { x: 0, y: 0, z: 0 },
      }),
    ).toThrow("不正なカラー値");
  });
});
