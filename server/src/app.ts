import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { lightingRoutes } from "./interface/controllers/LightingController.js";

// テストから直接インポートして hono.request() でテストできるよう、serve() と分離する
export const app = new OpenAPIHono();

app.use("*", logger());
app.use("*", cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (c) => c.json({ status: "ok" }));
app.route("/api", lightingRoutes);

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "舞台照明シミュレーター API",
    version: "0.1.0",
    description: "照明設計データの保存・取得 API",
  },
  servers: [{ url: "http://localhost:3000", description: "開発サーバー" }],
});

app.get("/ui", swaggerUI({ url: "/doc" }));
