import type { LightManager } from "../lights/LightManager";

export interface Keyframe {
  time: number; // 秒
  lightId: string;
  position: { x: number; y: number; z: number };
  targetPosition: { x: number; y: number; z: number };
  color: number;
  intensity: number;
}

// 照明モーションの時間軸管理と再生を担う
export class AnimationManager {
  private lightManager: LightManager;
  private keyframes: Keyframe[] = [];
  private isPlaying = false;
  private startTime: number | null = null;
  private duration = 10; // 秒

  constructor(lightManager: LightManager) {
    this.lightManager = lightManager;
  }

  play(): void {
    this.isPlaying = true;
    this.startTime = Date.now() / 1000;
  }

  stop(): void {
    this.isPlaying = false;
    this.startTime = null;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  addKeyframe(keyframe: Keyframe): void {
    this.keyframes.push(keyframe);
    this.keyframes.sort((a, b) => a.time - b.time);
  }

  clearKeyframes(): void {
    this.keyframes = [];
  }

  setDuration(seconds: number): void {
    this.duration = seconds;
  }

  // レンダリングループから毎フレーム呼ばれる
  update(): void {
    if (!this.isPlaying || this.startTime === null) return;

    const elapsed = (Date.now() / 1000 - this.startTime) % this.duration;

    // キーフレーム補間（各ライトについて現在時刻を挟む前後2フレームを線形補間）
    const lightIds = new Set(this.keyframes.map((k) => k.lightId));
    for (const id of lightIds) {
      const frames = this.keyframes.filter((k) => k.lightId === id);
      const prev = [...frames].reverse().find((k) => k.time <= elapsed);
      const next = frames.find((k) => k.time > elapsed);
      if (!prev || !next) continue;

      const t = (elapsed - prev.time) / (next.time - prev.time);
      const light = this.lightManager.get(id);
      if (!light) continue;

      light.mesh.position.lerpVectors(
        {
          x: prev.position.x,
          y: prev.position.y,
          z: prev.position.z,
        } as unknown as import("three").Vector3,
        {
          x: next.position.x,
          y: next.position.y,
          z: next.position.z,
        } as unknown as import("three").Vector3,
        t,
      );
    }
  }
}
