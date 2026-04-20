import type { PrismaClient } from "@prisma/client";
import type { Light, NewLight } from "../../domain/models/Light.js";
import type { ILightRepository } from "../../domain/repositories/ILightRepository.js";
import { toDomain } from "./LightMapper.js";

export class PrismaLightRepository implements ILightRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAllByProjectId(projectId: string): Promise<Light[]> {
    const records = await this.db.light.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });
    return records.map(toDomain);
  }

  async replaceAll(projectId: string, lights: NewLight[]): Promise<void> {
    // プロジェクトが未作成の場合は自動生成（初回保存時）
    await this.db.project.upsert({
      where: { id: projectId },
      update: {},
      create: { id: projectId, name: projectId },
    });

    await this.db.$transaction([
      this.db.light.deleteMany({ where: { projectId } }),
      this.db.light.createMany({
        data: lights.map((l, i) => ({
          projectId,
          type: l.type,
          color: l.color,
          intensity: l.intensity,
          positionX: l.position.x,
          positionY: l.position.y,
          positionZ: l.position.z,
          targetPositionX: l.targetPosition.x,
          targetPositionY: l.targetPosition.y,
          targetPositionZ: l.targetPosition.z,
          order: i,
        })),
      }),
    ]);
  }
}
