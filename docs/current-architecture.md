# 現状のアーキテクチャ（旧実装）

再構築の参照・移行元として記録する。

## ファイル構成

```
app.js                        - Express アプリ本体
bin/www                       - HTTP サーバー起動エントリポイント（ポート3000）
routes/index.js               - GET / → views/index.ejs をレンダリング
routes/users.js               - スタブ（未使用）
views/index.ejs               - メインUI（Three.js シーン＋全ロジックがインラインに記述）
views/main.ejs                - スクリプトincludeのみ・ルーティング未接続（実質未使用）
views/error.ejs               - エラーページ
public/javascripts/file.js    - Three.js ユーティリティ関数群
public/js/0three_main.js      - 旧バージョンのメインロジック（index.ejs と重複）
public/cgi/data.csv           - 照明設定の永続化ファイル
```

## データフロー

```
ブラウザ → GET / → index.ejs レンダリング
  → Three.js 3D シーン初期化
  → Save ボタン → POST /cgi → data.csv 書き込み
  → Load ボタン → GET /cgi → data.csv 読み込み → ライト再生成
```

## CSVフォーマット（data.csv）

```
name, color(hex), intensity, pos_x, pos_y, pos_z, target_x, target_y, target_z
例: SpotLight1,ff0000,2,-10,15,0,-10,0,10
```

## 既知のバグ・動作しない原因

| # | 場所 | 内容 |
|---|------|------|
| 1 | `index.ejs` L45 | `THREE.Projector` は Three.js r71 以降で削除済み → 即クラッシュ |
| 2 | `0three_main.js` L196 | `animate()` を呼び出しているが関数が未定義 |
| 3 | 全体 | `index.ejs` と `0three_main.js` で `createSpotlight()` / `init()` 等が二重定義 |
| 4 | `index.ejs` L257 | `add_targets=0` の直後に `add_targets.length=[]` → 数値の `.length` 参照でエラー |
| 5 | 全体 | `file.js` の全関数が `index.ejs` のグローバル変数（`scene` / `param` 等）に依存 |
| 6 | `index.ejs` | `for (key in array)` で配列に `for...in` を使用（非推奨） |
| 7 | `index.ejs` L172 | `default_num` を `var` 宣言なしで使用（グローバル汚染） |
| 8 | `main.ejs` | ルーティング未接続・HTMLボディなし（実質デッドコード） |

## 構造上の問題点

- ロジックが `index.ejs` のインライン `<script>` に集中しており、テスト・分割が不可能
- モジュールシステムなし（全変数がグローバルスコープ）
- TypeScript なし・リントなし・テストなし
- jQuery 1.12.1（2016年）/ Three.js バージョン不明（r85〜r100 前後と推定）
- データ保存が単一 CSV ファイルで複数プロジェクト・複数ユーザー非対応
