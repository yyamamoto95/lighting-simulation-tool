// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AnimationManager } from "../animation/AnimationManager.js";
import type { LightManager, ManagedLight } from "../lights/LightManager.js";
import { ControlPanel } from "./ControlPanel.js";

// api モジュールを vi.mock でモック（HTTP 通信をテストから切り離す）
vi.mock("../api/client.js", () => ({
  api: {
    lights: {
      save: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([]),
    },
    projects: { list: vi.fn().mockResolvedValue([]) },
  },
}));

// LightManager の最小モック（Three.js 依存なし）
const makeMockLightManager = (): LightManager => {
  const mock = {
    add: vi.fn().mockReturnValue({} as ManagedLight),
    remove: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
    get: vi.fn(),
    setDebugVisible: vi.fn(),
    updateHelpers: vi.fn(),
  };
  return mock as unknown as LightManager;
};

// AnimationManager の最小モック
const makeMockAnimationManager = (): AnimationManager => {
  const mock = {
    play: vi.fn(),
    stop: vi.fn(),
    update: vi.fn(),
    addKeyframe: vi.fn(),
    clearKeyframes: vi.fn(),
    setDuration: vi.fn(),
    playing: false,
  };
  return mock as unknown as AnimationManager;
};

describe("ControlPanel — ボタンのレンダリング", () => {
  let panel: ControlPanel;

  beforeEach(() => {
    panel = new ControlPanel(makeMockLightManager(), makeMockAnimationManager());
    document.body.appendChild(panel.element);
  });

  afterEach(() => {
    panel.element.remove();
  });

  it("照明追加ボタンが 4 種類表示される", () => {
    const buttons = panel.element.querySelectorAll("button");
    const labels = Array.from(buttons).map((b) => b.textContent);

    expect(labels).toContain("スポットライト");
    expect(labels).toContain("コーン型ライト");
    expect(labels).toContain("シリンダー型A");
    expect(labels).toContain("シリンダー型B");
  });

  it("保存・読み込みボタンが表示される", () => {
    const buttons = panel.element.querySelectorAll("button");
    const labels = Array.from(buttons).map((b) => b.textContent);

    expect(labels).toContain("保存");
    expect(labels).toContain("読み込み");
  });

  it("再生・停止ボタンが表示される", () => {
    const buttons = panel.element.querySelectorAll("button");
    const labels = Array.from(buttons).map((b) => b.textContent);

    expect(labels).toContain("再生");
    expect(labels).toContain("停止");
  });

  it("デバッグモードのトグルが表示される", () => {
    const checkbox = panel.element.querySelector('input[type="checkbox"]');
    expect(checkbox).not.toBeNull();
  });
});

describe("ControlPanel — ボタンのクリック", () => {
  let lightManager: LightManager;
  let animationManager: AnimationManager;
  let panel: ControlPanel;

  beforeEach(() => {
    lightManager = makeMockLightManager();
    animationManager = makeMockAnimationManager();
    panel = new ControlPanel(lightManager, animationManager);
    document.body.appendChild(panel.element);
  });

  afterEach(() => {
    panel.element.remove();
  });

  const clickButton = (label: string) => {
    const buttons = panel.element.querySelectorAll("button");
    const btn = Array.from(buttons).find((b) => b.textContent === label);
    if (!btn) throw new Error(`ボタン "${label}" が見つかりません`);
    btn.click();
  };

  it("「スポットライト」クリックで lightManager.add('spotlight') が呼ばれる", () => {
    clickButton("スポットライト");
    expect(lightManager.add).toHaveBeenCalledWith("spotlight");
  });

  it("「コーン型ライト」クリックで lightManager.add('cone') が呼ばれる", () => {
    clickButton("コーン型ライト");
    expect(lightManager.add).toHaveBeenCalledWith("cone");
  });

  it("「シリンダー型A」クリックで lightManager.add('cylinder-a') が呼ばれる", () => {
    clickButton("シリンダー型A");
    expect(lightManager.add).toHaveBeenCalledWith("cylinder-a");
  });

  it("「シリンダー型B」クリックで lightManager.add('cylinder-b') が呼ばれる", () => {
    clickButton("シリンダー型B");
    expect(lightManager.add).toHaveBeenCalledWith("cylinder-b");
  });

  it("「再生」クリックで animationManager.play() が呼ばれる", () => {
    clickButton("再生");
    expect(animationManager.play).toHaveBeenCalled();
  });

  it("「停止」クリックで animationManager.stop() が呼ばれる", () => {
    clickButton("停止");
    expect(animationManager.stop).toHaveBeenCalled();
  });

  it("デバッグトグル ON で lightManager.setDebugVisible(true) が呼ばれる", () => {
    const checkbox = panel.element.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change"));

    expect(lightManager.setDebugVisible).toHaveBeenCalledWith(true);
  });

  it("デバッグトグル OFF で lightManager.setDebugVisible(false) が呼ばれる", () => {
    const checkbox = panel.element.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change"));

    expect(lightManager.setDebugVisible).toHaveBeenCalledWith(false);
  });
});

describe("ControlPanel — 保存", () => {
  it("「保存」クリックで api.lights.save が呼ばれる", async () => {
    // vi.mock で差し替えた api をインポート
    const { api } = await import("../api/client.js");

    const lightManager = makeMockLightManager();
    const panel = new ControlPanel(lightManager, makeMockAnimationManager());
    document.body.appendChild(panel.element);

    const saveBtn = Array.from(panel.element.querySelectorAll("button")).find(
      (b) => b.textContent === "保存",
    );
    if (!saveBtn) throw new Error("「保存」ボタンが見つかりません");
    saveBtn.click();

    // 非同期処理を待つ
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(api.lights.save).toHaveBeenCalledWith("default", []);
    panel.element.remove();
  });

  it("spotLight を持つライトの色・強度・座標が save に渡される", async () => {
    const { api } = await import("../api/client.js");

    const mockManagedLight: ManagedLight = {
      id: "light-1",
      type: "spotlight",
      spotLight: {
        color: { getHex: () => 0xff0000 },
        intensity: 2.5,
      } as unknown as import("three").SpotLight,
      target: {
        position: { x: 1, y: 0, z: 2 },
      } as unknown as import("three").Mesh,
      mesh: {
        position: { x: 0, y: 10, z: -3 },
      } as unknown as import("three").Object3D,
      helper: null,
    };

    const lightManager = makeMockLightManager();
    vi.mocked(lightManager.getAll).mockReturnValue([mockManagedLight]);

    const panel = new ControlPanel(lightManager, makeMockAnimationManager());
    document.body.appendChild(panel.element);

    const saveBtn = Array.from(panel.element.querySelectorAll("button")).find(
      (b) => b.textContent === "保存",
    );
    if (!saveBtn) throw new Error("「保存」ボタンが見つかりません");
    saveBtn.click();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(api.lights.save).toHaveBeenCalledWith("default", [
      {
        type: "spotlight",
        color: 0xff0000,
        intensity: 2.5,
        position: { x: 0, y: 10, z: -3 },
        targetPosition: { x: 1, y: 0, z: 2 },
      },
    ]);

    panel.element.remove();
  });
});
