/**
 * openapi-fetch を用いた型安全な API クライアント
 * BE の Zod スキーマから生成された schema.d.ts を参照し、
 * リクエスト・レスポンスの型が自動で保証される。
 *
 * schema.d.ts は手動で編集しないこと。
 * 更新は `pnpm api:gen` で再生成する。
 */
import createClient from "openapi-fetch";
import type { components, paths } from "./schema.d.ts";

// ブラウザでは location.origin を使用（Vite proxy が /api を転送）
// Node.js テスト環境では window が存在し jsdom の URL が解決基準になる
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

// openapi-fetch は createClient() 時に globalThis.fetch をキャプチャするため、
// ラッパー関数を渡して MSW 等のパッチが実行時に反映されるようにする
const client = createClient<paths>({
  baseUrl: BASE_URL,
  fetch: (...args) => globalThis.fetch(...args),
});

// 共通型のエイリアス（スキーマから直接参照することで二重定義を排除）
export type Light = components["schemas"]["Light"];
export type LightInput = components["schemas"]["LightInput"];
export type LightType = components["schemas"]["LightType"];
export type Vector3 = components["schemas"]["Vector3"];

// 型安全な API ラッパー
export const api = {
  lights: {
    /** プロジェクトの照明一覧を取得 */
    async list(projectId: string): Promise<Light[]> {
      const { data, error } = await client.GET("/api/projects/{projectId}/lights", {
        params: { path: { projectId } },
      });
      if (error) throw new Error(`照明一覧の取得に失敗しました: ${JSON.stringify(error)}`);
      return data;
    },

    /** プロジェクトの照明一覧を保存（全件置き換え） */
    async save(projectId: string, lights: LightInput[]): Promise<void> {
      const { error } = await client.PUT("/api/projects/{projectId}/lights", {
        params: { path: { projectId } },
        body: lights,
      });
      if (error) throw new Error(`照明データの保存に失敗しました: ${JSON.stringify(error)}`);
    },
  },

  projects: {
    /** プロジェクト一覧を取得 */
    async list(): Promise<{ id: string; name: string }[]> {
      const { data, error } = await client.GET("/api/projects");
      if (error) throw new Error(`プロジェクト一覧の取得に失敗しました: ${JSON.stringify(error)}`);
      return data;
    },
  },
};
