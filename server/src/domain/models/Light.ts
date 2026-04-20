export type LightType = "spotlight" | "cone" | "cylinder-a" | "cylinder-b";

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// 照明エンティティ（DB 保存済み。id と order を持つ）
export class Light {
  readonly id: string;
  readonly type: LightType;
  readonly color: number;
  readonly intensity: number;
  readonly position: Vector3;
  readonly targetPosition: Vector3;
  readonly order: number;

  private constructor(params: {
    id: string;
    type: LightType;
    color: number;
    intensity: number;
    position: Vector3;
    targetPosition: Vector3;
    order: number;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.color = params.color;
    this.intensity = params.intensity;
    this.position = params.position;
    this.targetPosition = params.targetPosition;
    this.order = params.order;
  }

  // ファクトリメソッド（ドメインバリデーション付き）
  static create(params: {
    id: string;
    type: LightType;
    color: number;
    intensity: number;
    position: Vector3;
    targetPosition: Vector3;
    order: number;
  }): Light {
    assertValidColor(params.color);
    assertValidIntensity(params.intensity);
    return new Light(params);
  }
}

// 新規登録用（id・order はインフラ層で付与する）
export interface NewLight {
  type: LightType;
  color: number;
  intensity: number;
  position: Vector3;
  targetPosition: Vector3;
}

// ドメインバリデーション（入力値検証）
export function validateNewLight(data: NewLight): void {
  assertValidColor(data.color);
  assertValidIntensity(data.intensity);
}

function assertValidColor(color: number): void {
  if (!Number.isInteger(color) || color < 0 || color > 0xffffff) {
    throw new Error(`不正なカラー値: ${color}（0〜16777215 の整数で指定してください）`);
  }
}

function assertValidIntensity(intensity: number): void {
  if (intensity < 0 || intensity > 5) {
    throw new Error(`強度は 0〜5 の範囲で指定してください: ${intensity}`);
  }
}
