# 照明シミュレーションツール

照明知識ゼロの演出チームが、ブラウザだけでコンサート照明を3D可視化し、照明チームと共有できるWebツール。

専用ソフト・ハードウェア・照明の専門知識なしに、照明のイメージを視覚化してチームと議論できることを目的としています。

---

## スクリーンショット

> ※ 追加予定

---

## 機能（MVP）

| 機能 | 説明 |
|---|---|
| 会場3D表示 | 東京ドームを模した固定モデルを表示 |
| 照明追加 | スポット / コーン / シリンダーA / シリンダーB の4種を追加 |
| 照明の位置・照準変更 | マウス＋キー操作で光源位置・照射方向を変更 |
| 色・強度変更 | GUIでリアルタイムに変更 |
| デバッグモード | 補助線・ターゲット球の表示トグル |
| アニメーション | 照明モーションを時間軸で設計・再生 |
| 保存 / 復元 | 照明設計データをサーバーに保存・読み込み |
| カメラ操作 | マウスで回転・ズーム・パン |

---

## 技術スタック

### フロントエンド

| 技術 | 用途 |
|---|---|
| [Vite](https://vitejs.dev/) | バンドラー・開発サーバー |
| TypeScript | 言語 |
| [Three.js](https://threejs.org/) | 3D レンダリング（WebGL） |

### バックエンド

| 技術 | 用途 |
|---|---|
| [Hono](https://hono.dev/) | Web フレームワーク（TypeScript-first） |
| [Prisma](https://www.prisma.io/) | ORM・マイグレーション管理 |
| SQLite | データベース（ファイルベース） |

### 開発ツール

| 技術 | 用途 |
|---|---|
| [Biome](https://biomejs.dev/) | Linter / Formatter |
| [Vitest](https://vitest.dev/) | ユニット・コンポーネントテスト |
| [Playwright](https://playwright.dev/) | ブラウザ e2e テスト |
| [MSW](https://mswjs.io/) | API モック（テスト用） |
| pnpm | パッケージ管理（モノレポ） |

---

## アーキテクチャ

pnpm モノレポ構成（`client/` + `server/`）。バックエンドは DDD 4層構造。

```
lighting-simulation-tool/
├── client/          # フロントエンド（Vite + Three.js）
├── server/          # バックエンド（Hono + Prisma）
│   └── src/
│       ├── domain/          # エンティティ・バリデーション（フレームワーク非依存）
│       ├── application/     # ユースケース
│       ├── infrastructure/  # Prisma 実装・DB クライアント
│       └── interface/       # Hono Controller・Zod DTO（OpenAPI）
├── tests/           # Playwright e2e テスト
├── openapi.json     # 自動生成（手動編集禁止）
└── CLAUDE.md        # AI 開発者向けプロジェクト規約
```

FE/BE の型は OpenAPI スキーマを SSOT として自動同期します（`pnpm openapi:gen`）。

---

## セットアップ

### 前提条件

- Node.js `22.20.0`（`.nvmrc` 参照）
- pnpm `^10`

```bash
# Node.js バージョンを合わせる（nvm 使用時）
nvm use

# pnpm のインストール（未導入の場合）
npm install -g pnpm
```

### インストール

```bash
git clone https://github.com/yyamamoto95/lighting-simulation-tool.git
cd lighting-simulation-tool
pnpm install
```

### DB セットアップ

```bash
pnpm --filter server db:migrate
```

### 開発サーバー起動

```bash
pnpm dev
# フロントエンド: http://localhost:5173
# バックエンド:   http://localhost:3000
# Swagger UI:    http://localhost:3000/ui
```

---

## 開発コマンド

```bash
# 型チェック（全パッケージ）
pnpm check-types

# Lint / Format
pnpm lint
pnpm format

# ユニットテスト
pnpm test:unit

# API e2e テスト（test.db 使用、サーバー不要）
pnpm --filter server test:e2e:api

# ブラウザ e2e テスト（Playwright、両サーバー自動起動）
pnpm test:e2e

# OpenAPI スキーマ再生成（schema.ts 変更後に実行）
pnpm openapi:gen

# Prisma Studio（DB GUI）
pnpm --filter server db:studio
```

---

## コントリビューション

### ブランチ・コミット規約

- ブランチ名: `feature/<topic>` / `fix/<topic>`
- コミット: [Conventional Commits](https://www.conventionalcommits.org/) 形式、本文は日本語

```
feat(domain): Light エンティティに照射範囲バリデーションを追加
fix(infra): PrismaLightRepository の order ソートが逆転するバグを修正
```

スコープ: `domain` / `application` / `infra` / `interface` / `client` / `e2e` / `ci` / `docs`

### コミット前チェック

PR を出す前に以下がすべてグリーンであることを確認してください。

```bash
pnpm check-types   # 型エラーなし
pnpm lint          # Biome チェック通過
pnpm test:unit     # 単体テスト全件グリーン
```

### PR テンプレート

`.github/PULL_REQUEST_TEMPLATE.md` に沿って記載してください。

### DDD 依存ルール（重要）

```
interface → application → domain ← infrastructure
```

- Controller で Prisma を直接呼ばない
- Domain 層で Hono / Prisma の型を import しない
- UseCase の外でドメインバリデーションを行わない

詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。
