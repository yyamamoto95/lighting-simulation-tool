/**
 * OpenAPI JSON をファイルに書き出すスクリプト
 * 実行: pnpm --filter server openapi:export
 * 出力: server/openapi.json（FE クライアント生成の入力として使用）
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { lightingRoutes } from "./interface/controllers/LightingController.js";

const app = new OpenAPIHono();
app.use("*", cors());
app.route("/api", lightingRoutes);
app.doc("/doc", {
  openapi: "3.0.0",
  info: { title: "舞台照明シミュレーター API", version: "0.1.0" },
  servers: [{ url: "http://localhost:3000" }],
});
app.get("/ui", swaggerUI({ url: "/doc" }));

// /doc エンドポイントを内部で呼び出して JSON を取得
void (async () => {
  const res = await app.request("/doc");
  const spec = await res.json();

  const outPath = join(import.meta.dirname, "../../openapi.json");
  writeFileSync(outPath, JSON.stringify(spec, null, 2), "utf-8");
  console.log(`OpenAPI JSON を出力しました: ${outPath}`);
})();
