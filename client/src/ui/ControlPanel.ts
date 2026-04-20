import type { AnimationManager } from "../animation/AnimationManager";
import { api } from "../api/client";
import type { LightManager, LightType } from "../lights/LightManager";

// 画面上のコントロールパネル（dat.GUI の代替カスタムUI）
// MVP では最低限の操作ができる簡素なパネルとして実装する
export class ControlPanel {
  readonly element: HTMLElement;
  private lightManager: LightManager;
  private animationManager: AnimationManager;
  private debugMode = false;

  constructor(lightManager: LightManager, animationManager: AnimationManager) {
    this.lightManager = lightManager;
    this.animationManager = animationManager;
    this.element = this.createPanel();
  }

  // レンダリングループから毎フレーム呼ばれる
  update(): void {
    if (this.debugMode) {
      this.lightManager.updateHelpers();
    }
  }

  private createPanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      background: rgba(0,0,0,0.75);
      color: #fff;
      padding: 16px;
      border-radius: 8px;
      font-size: 13px;
      min-width: 200px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 100;
    `;

    panel.appendChild(
      this.createSection("照明を追加", [
        this.createButton("スポットライト", () => this.lightManager.add("spotlight")),
        this.createButton("コーン型ライト", () => this.lightManager.add("cone")),
        this.createButton("シリンダー型A", () => this.lightManager.add("cylinder-a")),
        this.createButton("シリンダー型B", () => this.lightManager.add("cylinder-b")),
      ]),
    );

    panel.appendChild(
      this.createSection("表示設定", [
        this.createToggle("デバッグモード", (v) => {
          this.debugMode = v;
          this.lightManager.setDebugVisible(v);
        }),
      ]),
    );

    panel.appendChild(
      this.createSection("アニメーション", [
        this.createButton("再生", () => this.animationManager.play()),
        this.createButton("停止", () => this.animationManager.stop()),
      ]),
    );

    panel.appendChild(
      this.createSection("データ", [
        this.createButton("保存", () => this.save()),
        this.createButton("読み込み", () => this.load()),
      ]),
    );

    return panel;
  }

  private createSection(title: string, children: HTMLElement[]): HTMLElement {
    const section = document.createElement("div");
    const label = document.createElement("div");
    label.textContent = title;
    label.style.cssText = "font-weight: bold; margin-bottom: 4px; color: #aaa;";
    section.appendChild(label);
    for (const child of children) section.appendChild(child);
    return section;
  }

  private createButton(label: string, onClick: () => void): HTMLElement {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style.cssText = `
      display: block;
      width: 100%;
      padding: 4px 8px;
      margin: 2px 0;
      background: #333;
      color: #fff;
      border: 1px solid #555;
      border-radius: 4px;
      cursor: pointer;
      text-align: left;
    `;
    btn.addEventListener("click", onClick);
    return btn;
  }

  private createToggle(label: string, onChange: (value: boolean) => void): HTMLElement {
    const container = document.createElement("label");
    container.style.cssText = "display: flex; align-items: center; gap: 8px; cursor: pointer;";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.addEventListener("change", () => onChange(input.checked));
    container.appendChild(input);
    container.appendChild(document.createTextNode(label));
    return container;
  }

  private async save(): Promise<void> {
    const lights = this.lightManager.getAll().map((l) => ({
      type: l.type as LightType,
      color: l.spotLight?.color.getHex() ?? 0xffffff,
      intensity: l.spotLight?.intensity ?? 1,
      position: { x: l.mesh.position.x, y: l.mesh.position.y, z: l.mesh.position.z },
      targetPosition: {
        x: l.target.position.x,
        y: l.target.position.y,
        z: l.target.position.z,
      },
    }));
    await api.lights.save("default", lights);
  }

  private async load(): Promise<void> {
    const lights = await api.lights.list("default");
    // TODO: 読み込んだデータをシーンに反映する（次フェーズで実装）
    console.log("loaded", lights);
  }
}
