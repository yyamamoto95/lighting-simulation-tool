import { http, HttpResponse } from "msw";

// デフォルトの MSW ハンドラー（テスト内で上書き可能）
export const handlers = [
  http.get("http://localhost:5173/api/projects/:projectId/lights", () => {
    return HttpResponse.json([]);
  }),

  http.put(
    "http://localhost:5173/api/projects/:projectId/lights",
    () => {
      return HttpResponse.json({ success: true });
    },
  ),

  http.get("http://localhost:5173/api/projects", () => {
    return HttpResponse.json([]);
  }),
];
