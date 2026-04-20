import { AnimationManager } from "./animation/AnimationManager";
import { LightManager } from "./lights/LightManager";
import { SceneManager } from "./scene/SceneManager";
import { ControlPanel } from "./ui/ControlPanel";
import { createTokyoDome } from "./venues/TokyoDome";

// アプリケーションのエントリポイント
const container = document.getElementById("canvas-container");
if (!container) throw new Error("canvas-container が見つかりません");

const sceneManager = new SceneManager(container);
const lightManager = new LightManager(sceneManager.scene);
const animationManager = new AnimationManager(lightManager);
const controlPanel = new ControlPanel(lightManager, animationManager);

// 会場モデルをシーンに追加
const venue = createTokyoDome();
sceneManager.scene.add(venue);

// UI をマウント
document.body.appendChild(controlPanel.element);

// レンダリングループ開始
sceneManager.startRenderLoop(() => {
  animationManager.update();
  controlPanel.update();
});
