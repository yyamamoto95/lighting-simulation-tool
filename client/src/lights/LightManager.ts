import * as THREE from "three";

export type LightType = "spotlight" | "cone" | "cylinder-a" | "cylinder-b";

export interface ManagedLight {
  id: string;
  type: LightType;
  /** Three.js 光源（SpotLight のみ。モデル型は null） */
  spotLight: THREE.SpotLight | null;
  /** 照準ターゲットメッシュ */
  target: THREE.Mesh;
  /** 光源位置メッシュ（モデル型はこれで位置管理） */
  mesh: THREE.Object3D;
  /** SpotLight補助線（デバッグ表示用） */
  helper: THREE.SpotLightHelper | null;
}

// 照明オブジェクトの生成・追加・削除・状態管理を担う
export class LightManager {
  private scene: THREE.Scene;
  private lights: Map<string, ManagedLight> = new Map();
  private nextId = 1;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    // 環境光
    scene.add(new THREE.AmbientLight(0x111111));
  }

  add(type: LightType, color = 0xffffff): ManagedLight {
    const id = `light-${this.nextId++}`;
    const offsetZ = this.lights.size * 2;

    const target = this.createTargetMesh(0, 0, offsetZ);
    let spotLight: THREE.SpotLight | null = null;
    let mesh: THREE.Object3D;
    let helper: THREE.SpotLightHelper | null = null;

    if (type === "spotlight") {
      spotLight = this.createSpotLight(color);
      spotLight.position.set(-10 + this.lights.size * 5, 15, 0);
      spotLight.target = target;
      mesh = spotLight;
      helper = new THREE.SpotLightHelper(spotLight);
      helper.visible = false;
      this.scene.add(spotLight, target, helper);
    } else {
      mesh = this.createModelLight(type, color);
      mesh.position.set(0, 10, offsetZ);
      this.scene.add(mesh, target);
    }

    const managed: ManagedLight = { id, type, spotLight, target, mesh, helper };
    this.lights.set(id, managed);
    return managed;
  }

  remove(id: string): void {
    const light = this.lights.get(id);
    if (!light) return;
    this.scene.remove(light.mesh, light.target);
    if (light.helper) this.scene.remove(light.helper);
    this.lights.delete(id);
  }

  getAll(): ManagedLight[] {
    return Array.from(this.lights.values());
  }

  get(id: string): ManagedLight | undefined {
    return this.lights.get(id);
  }

  setDebugVisible(visible: boolean): void {
    for (const light of this.lights.values()) {
      if (light.helper) light.helper.visible = visible;
      const mat = (light.target as THREE.Mesh).material as THREE.MeshPhongMaterial;
      mat.opacity = visible ? 0.5 : 0;
    }
  }

  updateHelpers(): void {
    for (const light of this.lights.values()) {
      light.helper?.update();
    }
  }

  private createSpotLight(color: number): THREE.SpotLight {
    const light = new THREE.SpotLight(color, 2);
    light.castShadow = true;
    light.angle = 0.3;
    light.penumbra = 0.2;
    light.decay = 2;
    light.distance = 50;
    light.shadow.mapSize.set(1024, 1024);
    return light;
  }

  private createTargetMesh(x: number, y: number, z: number): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshPhongMaterial({ transparent: true, opacity: 0 }),
    );
    mesh.position.set(x, y, z);
    return mesh;
  }

  private createModelLight(type: LightType, color: number): THREE.Mesh {
    // テクスチャ付きモデルで高輝度ライトを表現（旧実装の Light1〜3 に相当）
    const geometryMap: Record<Exclude<LightType, "spotlight">, THREE.BufferGeometry> = {
      cone: new THREE.ConeGeometry(1.0, 10, 32),
      "cylinder-a": new THREE.CylinderGeometry(2, 2, 15, 25, 25, true),
      "cylinder-b": new THREE.CylinderGeometry(3, 3, 15, 25, 25, true),
    };
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    return new THREE.Mesh(geometryMap[type as Exclude<LightType, "spotlight">], material);
  }
}
