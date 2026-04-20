import type { Light, NewLight } from "../models/Light.js";

export interface ILightRepository {
  /** プロジェクトの照明一覧を取得（order 昇順） */
  findAllByProjectId(projectId: string): Promise<Light[]>;
  /** 照明一覧を全件置き換え保存 */
  replaceAll(projectId: string, lights: NewLight[]): Promise<void>;
}
