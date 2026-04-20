import type { Light, NewLight } from "../../domain/models/Light.js";
import { validateNewLight } from "../../domain/models/Light.js";
import type { ILightRepository } from "../../domain/repositories/ILightRepository.js";

// 照明一覧取得ユースケース
export class GetLightingUseCase {
  constructor(private readonly lightRepository: ILightRepository) {}

  async execute(projectId: string): Promise<Light[]> {
    return this.lightRepository.findAllByProjectId(projectId);
  }
}

// 照明一括更新ユースケース
export class UpdateLightingUseCase {
  constructor(private readonly lightRepository: ILightRepository) {}

  async execute(projectId: string, inputs: NewLight[]): Promise<void> {
    // 全件バリデーション（1 件でも不正値があれば保存しない）
    for (const input of inputs) {
      validateNewLight(input);
    }
    await this.lightRepository.replaceAll(projectId, inputs);
  }
}
