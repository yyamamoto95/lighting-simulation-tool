import { serve } from "@hono/node-server";
import { app } from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
  console.log(`Swagger UI:   http://localhost:${PORT}/ui`);
  console.log(`OpenAPI JSON: http://localhost:${PORT}/doc`);
});
