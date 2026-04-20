import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Three.js のシーン・カメラ・レンダラー・コントロールを一元管理する
export class SceneManager {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly controls: OrbitControls;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);

    this.camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      1,
      2000,
    );
    this.camera.position.set(76, 22, -30);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 7, 0);
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.update();

    // ウィンドウリサイズ対応
    window.addEventListener("resize", () => this.onResize(container));
  }

  private onResize(container: HTMLElement): void {
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  startRenderLoop(onFrame: () => void): void {
    const loop = () => {
      requestAnimationFrame(loop);
      onFrame();
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }
}
