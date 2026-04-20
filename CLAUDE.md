# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## プロジェクト憲章（AI 行動規範）

### 1. ワークフロー規約

**実装前の宣言が必須**。コードを変更する前に必ず以下を提示し、ユーザーの承認を得ること。

1. 変更対象のファイルパス一覧
2. 追加・修正するテストの概要
3. 設計意図（DDD のどの層に何を追加するか、なぜその設計か）

**コミットメッセージ**は Conventional Commits を厳守する（本文は日本語）。

```
feat(domain): Light エンティティに照射範囲バリデーションを追加
fix(infra): PrismaLightRepository の order ソートが逆転するバグを修正
test(application): UpdateLightingUseCase のエラー系テストを追加
docs(api): OpenAPI スキーマに intensity の説明を追記
```

スコープの対応：`domain` / `application` / `infra` / `interface` / `client` / `e2e` / `ci` / `docs`

**PR の責務**：変更完了後、以下の内容を含む PR 文を作成すること。
- 変更内容のサマリー
- 設計の意図（なぜその実装にしたか）
- 実施したテストの結果（パスしたコマンドと件数）

---

### 2. コード規約・アーキテクチャ遵守

**DDD 4 層の依存方向を絶対に破壊しないこと**。

```
interface → application → domain ← infrastructure
```

| 層 | パス | 役割 |
|---|---|---|
| domain | `server/src/domain/` | Entity・ValueObject・Repository Interface（Pure TS。Hono / Prisma に依存禁止） |
| application | `server/src/application/` | UseCase（ドメインロジックの組み立て）|
| infrastructure | `server/src/infrastructure/` | Prisma 実装・Mapper（DB詳細をドメインから隠蔽）|
| interface | `server/src/interface/` | Hono Controller・Zod DTO（HTTP の詳細をドメインから隠蔽）|

**禁止パターン**（発見したら指摘し、修正案を提示すること）：
- Controller で Prisma を直接呼ぶ
- Domain 層で Hono の Context や Prisma の型を import する
- UseCase の外でドメインバリデーションを行う

**SSOT（Single Source of Truth）**：
- 型変更は必ず `server/src/interface/dtos/*.schema.ts`（Zod）から開始する
- スキーマ変更後は即座に `pnpm openapi:gen` を実行し、FE の型定義を同期する
- `openapi.json` と `client/src/api/schema.d.ts` は自動生成物。手動編集禁止

**命名規則**：

| 種別 | 規則 | 例 |
|---|---|---|
| Repository Interface | `I...Repository.ts` | `ILightRepository.ts` |
| UseCase | `...UseCase.ts` | `UpdateLightingUseCase.ts` |
| Mapper | `...Mapper.ts` | `LightMapper.ts` |
| Zod DTO | `*.schema.ts` | `light.schema.ts` |

---

### 3. コミット前検証（必須）

コミット前に以下のコマンドが全てパスしたことを報告すること。

```bash
pnpm check-types   # 型エラーなし
pnpm lint          # Biome チェック通過
pnpm test:unit     # 単体テスト全件グリーン
```

**新機能追加時**：対応する Unit Test（Vitest）を必ず同一 PR に含めること。

**`schema.prisma` 変更時**：`pnpm --filter server db:migrate` の実行が必要であることを必ずユーザーに指摘すること。

---

### 4. ストッパー機能（AI の自制）

**新規パッケージ追加**（`pnpm add`）が必要な場合：
- 独断で実行しない
- 利点・欠点・代替案をユーザーに説明し、承認を得てから実行する

**セキュリティ関連の変更**で必ず「懸念点」を明示すること：
- `.env` / 環境変数の取り扱い
- CORS 設定の変更
- SQLite のファイルパス
- API 認証の追加・変更

**不確実な場合**：答えが確実でない技術判断は「確信度：低」と明記し、ユーザーに確認を取ること。

---

## 開発コマンド

```bash
pnpm install                          # 依存パッケージインストール

# 開発サーバー
pnpm dev                              # client: http://localhost:5173 / server: http://localhost:3000
pnpm --filter client dev              # フロントエンドのみ
pnpm --filter server dev              # バックエンドのみ

# 型チェック・Lint
pnpm check-types                      # 全パッケージ tsc --noEmit
pnpm lint                             # Biome チェック
pnpm format                           # Biome 自動フォーマット

# テスト
pnpm test:unit                        # 単体テスト（domain / usecase / API client / component）
pnpm --filter server test:e2e:api     # BE API e2e（test.db 使用、サーバー不要）
pnpm test:e2e                         # Playwright ブラウザ全系（両サーバー自動起動）

# OpenAPI（型同期）
pnpm openapi:gen                      # openapi.json 出力 + FE schema.d.ts 再生成
pnpm openapi:watch                    # schema / routes 変更を監視して自動再生成

# DB
pnpm --filter server db:migrate       # マイグレーション実行（schema.prisma 変更後に必須）
pnpm --filter server db:generate      # Prisma Client 再生成
pnpm --filter server db:studio        # Prisma Studio（GUI）
```

---

## アーキテクチャ概要

pnpm モノレポ構成（`client/` + `server/`）。

### フロントエンド（`client/`）

- **エントリポイント**: `client/src/main.ts`
- **モジュール構成**:
  - `scene/SceneManager.ts` — Three.js シーン・カメラ・レンダラー・OrbitControls を一元管理
  - `lights/LightManager.ts` — 照明オブジェクトの生成・追加・削除・状態管理
  - `venues/TokyoDome.ts` — 東京ドームを模した会場3Dモデル
  - `animation/AnimationManager.ts` — 照明モーションのキーフレーム管理・再生
  - `ui/ControlPanel.ts` — カスタムコントロールパネル
- **API 通信**: `src/api/client.ts`（openapi-fetch）。`/api/*` は Vite proxy 経由でポート 3000 へ転送
- **型の流れ**: `server/src/interface/dtos/*.schema.ts` → `openapi.json` → `src/api/schema.d.ts`（自動生成）→ `client.ts`

### バックエンド（`server/`）DDD 4 層構造

```
server/src/
├── domain/
│   ├── models/Light.ts              # Light エンティティ（バリデーション付き）
│   └── repositories/ILightRepository.ts
├── application/
│   └── usecases/LightingUseCases.ts # GetLightingUseCase / UpdateLightingUseCase
├── infrastructure/
│   ├── db/client.ts                 # Prisma 7 + libsql アダプター
│   └── persistence/
│       ├── LightMapper.ts           # Prisma ↔ ドメインモデル変換
│       └── PrismaLightRepository.ts
└── interface/
    ├── controllers/LightingController.ts  # Hono ルート定義・DI 組み立て
    └── dtos/light.schema.ts              # Zod スキーマ（OpenAPI SSOT）
```

- **エントリポイント**: `server/src/index.ts`（`app.ts` を import して `serve()` 呼び出し）
- **テスト用アプリ**: `server/src/app.ts`（`serve()` なし。`app.request()` でテスト可能）
- **DB**: SQLite（`server/prisma/dev.db`）+ Prisma 7。`schema.prisma` に `url` は書かず `prisma.config.ts` で管理

### 3 モデルの分離

| モデル | 場所 | 役割 |
|---|---|---|
| Zod DTO | `interface/dtos/light.schema.ts` | FE との OpenAPI 契約 |
| Domain Entity | `domain/models/Light.ts` | ビジネスルール（バリデーション） |
| Prisma Model | `prisma/schema.prisma` | DB テーブル構造 |

`LightMapper.ts` が Prisma ↔ ドメインを変換し、DB カラム名変更がドメイン・インターフェース層に伝播しない構造。

### API エンドポイント

| Method | Path | Controller |
|---|---|---|
| GET | `/api/health` | `app.ts` 直接 |
| GET | `/api/projects` | `LightingController` |
| GET | `/api/projects/:projectId/lights` | `LightingController` + `GetLightingUseCase` |
| PUT | `/api/projects/:projectId/lights` | `LightingController` + `UpdateLightingUseCase` |

---

## テスト戦略

| コマンド | 対象 | 速度 | タイミング |
|---|---|---|---|
| `pnpm test:unit` | domain / usecase / API client / component | 高速 | コミット毎 |
| `pnpm --filter server test:e2e:api` | Hono エンドポイント + SQLite | 中速 | PR 毎 |
| `pnpm test:e2e` | Playwright ブラウザ全系 | 低速 | PR マージ前 |

---

## 旧実装について

`app.js` / `bin/` / `routes/` / `views/` / `public/` は旧実装（2019年）。
新実装（`client/` / `server/`）への移行完了後に削除予定。参照しないこと。
