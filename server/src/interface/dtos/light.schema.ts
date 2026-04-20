import { z } from "@hono/zod-openapi";

// 3次元座標
const Vector3Schema = z
  .object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  })
  .openapi("Vector3");

// 照明の種類
const LightTypeSchema = z
  .enum(["spotlight", "cone", "cylinder-a", "cylinder-b"])
  .openapi("LightType");

// PUT リクエストボディ（DB id なし）
export const LightInputSchema = z
  .object({
    type: LightTypeSchema,
    color: z.number().int().min(0).max(0xffffff).openapi({
      description: "照明カラー（16進数整数値 例: 0xff0000 = 16711680）",
      example: 16711680,
    }),
    intensity: z.number().min(0).max(5).openapi({
      description: "光の強さ（0.0〜5.0）",
      example: 2.0,
    }),
    position: Vector3Schema.openapi({ description: "光源位置" }),
    targetPosition: Vector3Schema.openapi({ description: "照射ターゲット位置" }),
  })
  .openapi("LightInput");

// GET レスポンス（DB id あり）
export const LightSchema = LightInputSchema.extend({
  id: z.string().openapi({ description: "照明 ID" }),
  order: z.number().int().openapi({ description: "表示順" }),
}).openapi("Light");

// レスポンス配列
export const LightArraySchema = z.array(LightSchema).openapi("LightArray");
export const LightInputArraySchema = z.array(LightInputSchema).openapi("LightInputArray");

// 汎用レスポンス
export const SuccessResponseSchema = z.object({ success: z.boolean() }).openapi("SuccessResponse");

export const ErrorResponseSchema = z.object({ error: z.string() }).openapi("ErrorResponse");
