# 業務フロー ワイヤーフレーム

照明設計（LS-1xx）と保存・共有（LS-2xx）の流れを
[flow-wireframe](https://github.com/yyamamoto95/flow-wireframe) で見える化したもの。
Project / Light テーブル（server/prisma/schema.prisma と対応）へのデータ変化も
CRUD マトリクスで追える。

| ファイル | 役割 |
|---------|------|
| `lighting.flow.json` | フロー定義（編集対象。`$schema` によりエディタ補完が効く） |
| `lighting.wireframe.html` | 生成物（ブラウザで直接開ける静的HTML。JSなし・単一ファイル） |

## 再生成の方法

```bash
npx flow-wireframe build wireframes/lighting.flow.json -o wireframes/lighting.wireframe.html
```
