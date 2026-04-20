# 舞台照明シミュレーションツール — プロジェクト計画

## プロダクト概要

### 解決する課題

大規模コンサートツアーの演出チームは、照明のイメージを**言葉・手描きスケッチ・参考写真**でしか照明チームに伝えられない。
その結果、イメージのズレが高額なリハーサル現場で発覚し、修正コストが発生する。

また、既存の商用シミュレーションツール（LightConverse / Capture 等）は高額・専用ハードウェア（ライティングコンソール / DMX512）・専門的な照明技術が必要であり、演出チームが気軽に使えるものではない。

### プロダクト定義

> **照明知識ゼロの演出チームが、ブラウザだけで照明イメージを3D可視化し、照明チームと共有できるツール**

- 専用ソフト・ハードウェア・照明知識なしに使える
- Webブラウザのみで動作する
- リアルタイムに照明を編集・プレビューできる
- 設計データをチームで共有できる（将来）

---

## ペルソナ

### Primary — 演出家 / ショーディレクター

| 項目 | 内容 |
|------|------|
| 職種 | コンサート演出家・ショーディレクター |
| 照明知識 | ほぼなし（「赤い光で全体を包みたい」レベル） |
| 現在の課題 | 照明チームへの伝達が口頭・スケッチのみ。現場で初めてズレが発覚する |
| ゴール | 照明チームに「これがやりたい」を視覚的に見せてから議論したい |
| 使用シーン | 制作会議・照明チームとの打ち合わせ前の準備 |

### Secondary — アーティストマネージャー / 制作担当

| 項目 | 内容 |
|------|------|
| 職種 | アーティスト事務所の制作スタッフ |
| 照明知識 | なし |
| 現在の課題 | アーティスト本人の「こんな感じにしたい」をプロダクションチームに橋渡しできない |
| ゴール | リハーサル前にアーティストに照明イメージを見せて早期承認を取りたい |
| 使用シーン | アーティストへのプレゼン・制作会社への発注前 |

---

## 機能スコープ

### MVP（初回リリース対象）

| # | 機能 | 説明 |
|---|------|------|
| 1 | 会場3D表示 | 東京ドームを模した固定モデルを表示する |
| 2 | スポットライト追加 | 複数種のライト（Light1〜4）をシーンに追加する |
| 3 | 照明の位置変更 | 光源位置をマウス＋キー操作で変更する |
| 4 | 照明の照準変更 | 照射方向（ターゲット）をマウス＋キー操作で変更する |
| 5 | 色・強度変更 | GUIで照明の色と光の強さをリアルタイムに変更する |
| 6 | 照明の削除 | 選択した照明をシーンから削除する |
| 7 | デバッグモード | 照明の補助線と照準点（ターゲット球）を表示する |
| 8 | バミリ表示 | 舞台上の位置マーカーを 3 / 16 / 32 点から選択して表示する |
| 9 | ペンライト演出シミュレーション | 観客席のペンライトをパーティクルで表現する |
| 10 | アニメーション | 照明のモーションを時間軸で設計・再生する |
| 11 | 保存 | 現在の照明設計データをサーバーに保存する |
| 12 | 復元（読み込み） | 保存済みの設計データを読み込んでシーンを再現する |
| 13 | カメラ操作 | マウスで視点を自由に変更できる（回転・ズーム・パン） |

### 将来拡張（MVP 対象外）

| # | 機能 | 説明 |
|---|------|------|
| A | 会場モデル選択 | 東京ドーム・武道館・横浜アリーナ等、複数会場から選択する |
| B | URLリアルタイム共有 | URLを共有して複数人が同一セッションを同時に閲覧・編集できる |
| C | モバイル対応 | タブレットでのプレゼン利用を想定したUI |

---

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Vite | ^8.0 | バンドラー・開発サーバー |
| TypeScript | ^6.0 | 言語 |
| Three.js | ^0.184 | WebGL 3D レンダリング |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Node.js | 22.x LTS | ランタイム |
| Hono | ^4.12 | Web フレームワーク |
| TypeScript | ^6.0 | 言語 |

### データ永続化

| 技術 | バージョン | 用途 |
|------|-----------|------|
| SQLite | — | データベース（ファイルベース・運用コストゼロ） |
| Prisma | ^7.7 | ORM・マイグレーション管理 |
| @prisma/adapter-libsql | ^7.7 | Prisma 7 向け SQLite アダプター |

### 開発ツール

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Biome | ^2.4 | Linter / Formatter（ESLint + Prettier の代替） |
| Vitest | ^4.1 | テストフレームワーク |
| pnpm | ^10 | パッケージマネージャー |

---

## ディレクトリ構成

```
lighting-simulation-tool/
├── client/                        フロントエンド（Vite + TypeScript + Three.js）
│   ├── src/
│   │   ├── main.ts                エントリポイント
│   │   ├── scene/
│   │   │   └── SceneManager.ts    Three.js シーン・カメラ・レンダラー一元管理
│   │   ├── lights/
│   │   │   └── LightManager.ts    照明オブジェクトの生成・管理
│   │   ├── venues/
│   │   │   └── TokyoDome.ts       東京ドームモデル（会場差し替え可能な構造）
│   │   ├── animation/
│   │   │   └── AnimationManager.ts  照明モーションのキーフレーム管理・再生
│   │   └── ui/
│   │       └── ControlPanel.ts    カスタムコントロールパネル
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                        バックエンド（Hono + TypeScript）
│   ├── src/
│   │   ├── index.ts               Honoサーバー エントリポイント
│   │   ├── routes/
│   │   │   └── lighting.ts        照明設計 API ルート
│   │   └── db/
│   │       └── client.ts          Prisma クライアント（libsql アダプター）
│   ├── prisma/
│   │   ├── schema.prisma          DB スキーマ定義
│   │   └── dev.db                 SQLite データベース（gitignore 対象）
│   ├── prisma.config.ts           Prisma 7 設定（DB URL 管理）
│   └── tsconfig.json
├── docs/                          ドキュメント
│   ├── plan.md                    ← このファイル
│   ├── product-definition.md      ビジネス課題・ペルソナ詳細
│   ├── features.md                機能一覧・優先順位
│   ├── current-architecture.md    旧実装の構成・既知バグ（参照用）
│   └── tech-stack.md              技術スタック詳細・設計方針
├── biome.json                     Biome 設定
├── pnpm-workspace.yaml            モノレポ設定
├── package.json                   ルートスクリプト
├── .nvmrc                         Node.js バージョン固定（22.20.0）
└── CLAUDE.md                      AI向け開発ガイド
```

---

## API 設計

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/api/health` | ヘルスチェック |
| `GET` | `/api/projects` | プロジェクト一覧取得 |
| `GET` | `/api/projects/:projectId/lights` | 照明一覧取得 |
| `PUT` | `/api/projects/:projectId/lights` | 照明一覧保存（全件置き換え） |

### 照明データ構造

```typescript
interface Light {
  id: string;
  type: "spotlight" | "cone" | "cylinder-a" | "cylinder-b";
  color: number;          // 16進数カラー値（例: 0xff0000）
  intensity: number;      // 光の強さ（0.0〜5.0）
  position: { x: number; y: number; z: number };
  targetPosition: { x: number; y: number; z: number };
}
```

---

## 開発コマンド

```bash
# セットアップ
pnpm install

# 開発サーバー（両方同時起動）
pnpm dev   # client: http://localhost:5173 / server: http://localhost:3000

# Lint / Format
pnpm lint                  # チェックのみ
pnpm biome check --write . # 自動修正（import 整列含む）

# テスト
pnpm test

# DB
pnpm --filter server db:migrate   # マイグレーション実行
pnpm --filter server db:generate  # Prisma Client 再生成

# OpenAPI（型安全基盤）
pnpm openapi:gen    # openapi.json 出力 → FE 型定義を再生成（1コマンドで完結）
pnpm openapi:watch  # server/src/schema・routes 変更を監視して自動再生成
```

## ドキュメント URL（開発サーバー起動時）

| URL | 内容 |
|-----|------|
| http://localhost:5173 | フロントエンド |
| http://localhost:3000/ui | Swagger UI |
| http://localhost:3000/doc | OpenAPI JSON |

---

## 旧実装について

`app.js` / `bin/` / `routes/` / `views/` / `public/` は 2019年の旧実装。
新実装（`client/` + `server/`）への移行完了後に削除予定。
