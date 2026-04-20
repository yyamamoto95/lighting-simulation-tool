import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  GetLightingUseCase,
  UpdateLightingUseCase,
} from "../../application/usecases/LightingUseCases.js";
import type { NewLight } from "../../domain/models/Light.js";
import { prisma } from "../../infrastructure/db/client.js";
import { PrismaLightRepository } from "../../infrastructure/persistence/PrismaLightRepository.js";
import {
  ErrorResponseSchema,
  LightArraySchema,
  LightInputArraySchema,
  SuccessResponseSchema,
} from "../dtos/light.schema.js";

// DI：リポジトリとユースケースのインスタンスをここで組み立てる
const repository = new PrismaLightRepository(prisma);
const getLightingUseCase = new GetLightingUseCase(repository);
const updateLightingUseCase = new UpdateLightingUseCase(repository);

export const lightingRoutes = new OpenAPIHono();

const ProjectIdParam = z.object({ projectId: z.string() });

// GET /api/projects/:projectId/lights
const getProjectLightsRoute = createRoute({
  method: "get",
  path: "/projects/{projectId}/lights",
  tags: ["Lights"],
  summary: "プロジェクトの照明一覧を取得",
  request: { params: ProjectIdParam },
  responses: {
    200: {
      content: { "application/json": { schema: LightArraySchema } },
      description: "照明一覧",
    },
    500: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "サーバーエラー",
    },
  },
});

lightingRoutes.openapi(getProjectLightsRoute, async (c) => {
  const { projectId } = c.req.valid("param");
  const lights = await getLightingUseCase.execute(projectId);
  return c.json(
    lights.map((l) => ({
      id: l.id,
      order: l.order,
      type: l.type,
      color: l.color,
      intensity: l.intensity,
      position: l.position,
      targetPosition: l.targetPosition,
    })),
    200,
  );
});

// PUT /api/projects/:projectId/lights
const putProjectLightsRoute = createRoute({
  method: "put",
  path: "/projects/{projectId}/lights",
  tags: ["Lights"],
  summary: "プロジェクトの照明一覧を保存（全件置き換え）",
  request: {
    params: ProjectIdParam,
    body: {
      content: { "application/json": { schema: LightInputArraySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: SuccessResponseSchema } },
      description: "保存成功",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "バリデーションエラー",
    },
    500: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "サーバーエラー",
    },
  },
});

lightingRoutes.openapi(putProjectLightsRoute, async (c) => {
  const { projectId } = c.req.valid("param");
  const body = c.req.valid("json");

  // DTO → ドメインモデルへ変換
  const newLights: NewLight[] = body.map((dto) => ({
    type: dto.type,
    color: dto.color,
    intensity: dto.intensity,
    position: dto.position,
    targetPosition: dto.targetPosition,
  }));

  await updateLightingUseCase.execute(projectId, newLights);
  return c.json({ success: true }, 200);
});

// GET /api/projects
const getProjectsRoute = createRoute({
  method: "get",
  path: "/projects",
  tags: ["Projects"],
  summary: "プロジェクト一覧を取得（将来の共有機能向け）",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(z.object({ id: z.string(), name: z.string() })),
        },
      },
      description: "プロジェクト一覧",
    },
  },
});

lightingRoutes.openapi(getProjectsRoute, async (c) => {
  // プロジェクトに固有のビジネスロジックがないため、インフラ層を直接使用する
  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });
  return c.json(projects, 200);
});
