import type { Light as PrismaLight } from "@prisma/client";
import type { LightType } from "../../domain/models/Light.js";
import { Light } from "../../domain/models/Light.js";

/**
 * Prisma モデル → ドメインエンティティ
 * DB のカラム名変更がドメイン層に影響しないよう、ここで吸収する
 */
export function toDomain(record: PrismaLight): Light {
  return Light.create({
    id: record.id,
    type: record.type as LightType,
    color: record.color,
    intensity: record.intensity,
    position: {
      x: record.positionX,
      y: record.positionY,
      z: record.positionZ,
    },
    targetPosition: {
      x: record.targetPositionX,
      y: record.targetPositionY,
      z: record.targetPositionZ,
    },
    order: record.order,
  });
}
