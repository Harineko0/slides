# engine — モーショングラフィックス・スライドエンジン

1920×1080 の設計座標で「シーン（ある時点の画面の状態）」を宣言すると、シーン間をモーフィング・カメラワーク・パーティクルでつないで再生する。
ビルド不要の素のスクリプトで、各デッキの `index.html` から `../engine/` を読み込んで使う。

```
engine/            共通モジュール（デッキ固有のものは置かない）
  engine.css       ステージ・スピーカーノート・ヘルプのスタイル
  engine-core.js   描画プリミティブ・テキストレイアウト・パーティクル形状・シーン登録
  kit.js           シーン定義で共通に使う部品（Hd / card / pill / iconLine / tw）
  engine-run.js    遷移・カメラ・パーティクル・入力・発表者ウィンドウ・メインループ
template/          新しいデッキの雛形
design-harness/    デッキ（例）
product-harness/   デッキ（例）
```

## 新しいデッキを作る

```bash
cp -R template my-deck
```

`my-deck/index.html` のタイトルと `ENGINE_THEME`、`my-deck/scenes.js` のシーンを書き換える。
シーンが増えたら `scenes-*.js` に分け、`index.html` で `kit.js` と `engine-run.js` の間に読み込む。

読み込み順は次の通り（すべてクラシックスクリプトで、トップレベルの名前を共有する）。

1. `engine.css` と `window.ENGINE_THEME` の定義（`<head>`）
2. `engine-core.js`
3. `kit.js`
4. デッキの `scenes-*.js`
5. `engine-run.js`

`#notes` と `#help` の要素は `engine-run.js` が作る。`<canvas id="stage">` は `aria-label` を付けるために置いておくとよい（無ければ `document.title` を使って作る）。

確認はリポジトリのルートで `python3 -m http.server 8765` を起動し、`http://localhost:8765/my-deck/` を開く。

## ENGINE_THEME

すべて省略可能。省略した項目はエンジンの既定値（ライトテーマ、Inter + JetBrains Mono）になる。

| キー | 内容 |
| --- | --- |
| `col` | 色の上書き。`bg ink ink2 ink3 line panel panel2 code warmBg warm cool green red yellow gray violet` のほか、独自のキーも足せる（`COL.xxx` や `[[xxx:文字]]` で使える） |
| `fs` / `fm` | 本文 / 等幅のフォントスタック |
| `fonts` | 起動時に先読みするフォント `[[family, [weights]], …]`。Google Fonts の `<link>` と揃える（Noto Sans JP は常に読む） |
| `chapters` | 章名の配列。シーンの `ch` はこの添字 |
| `kit` | `kit.js` の既定値。`{ heading: { x, y, size, weight }, cardSize, iconTint }` |

ノートとヘルプの見た目は `index.html` の `<style>` で CSS 変数 `--ui-bg --ui-border --ui-shadow --ui-blur --ui-muted` を上書きして変える。

## シーン

```js
scene({
  ch: 0,                       // 章（ENGINE_THEME.chapters の添字）
  title: 'タイトル',            // ノート・発表者ウィンドウに出る
  notes: 'スピーカーノート',
  cam: { x: 960, y: 540, z: 1 }, // 省略時は全体表示。z > 1 でズーム
  P: [pRing({ … }), pAmbient()],  // パーティクル（省略時は漂う塵）
  A: () => [T('id', '文字', { x, y }), …],  // アクター
});
```

同じ `id` のアクターは次のシーンへ数値・色・点列をモーフィングで引き継ぐ。前のシーンにしか無い `id` はフェードアウトし、新しい `id` は入場アニメーションで現れる。

### アクター

`T(id, text, o)` テキスト / `B` 角丸の箱 / `L(id, pts)` 折れ線 / `C` 円 / `I(id, name)` アイコン（`ICON_D` のキー） / `IMG(id, src)` 画像 / `CODE(id, lines)` コード / `POLY(id, pts)` 多角形

既定値は `engine-core.js` の `DEF`。主な共通プロパティは次の通り。

- `d` 入場の遅延（秒）、`dur` 入場の長さ、`in` 入場前の状態（例 `{ alpha: 0, dx: -40 }`）
- `md` / `mdur` / `mease` モーフィングの遅延・長さ・カーブ、`out` / `odur` 退場の状態と長さ
- `hud: true` カメラに追従しない（見出しなど）、`z` 重なり順、`reveal` 部分描画（0..1）
- テキストの記法: `**強調**` `` `コード` `` `~~打ち消し~~` `[[red:色指定]]` `[[red!:太字+色]]`

`inFrame(frame, actors)` はズーム先のローカル座標系に載せ、`scaleG(actors, k, ax, ay, bx, by)` は部品グループを拡大縮小して移す。`json(src)` / `sh(src)` は `CODE` 用にシンタックスハイライトした行を作る。

### パーティクル

`pRing` 円環 / `pCloud` ガウス雲 / `pGrid` 格子 / `pText` 文字形状 / `pPoly` 多角形の内部 / `pFlow` 経路に沿った流れ / `pAmbient` 漂う塵 / `pClusters` 複数の塊 / `pLines` コード行風の横棒 / `pRects` 矩形の外周

各部品は `weight` の比で 1100 個の粒子を分け合う。`P: { parts: […], frame }` とするとズーム先のフレームに載せられる。

### kit.js

| 部品 | 内容 |
| --- | --- |
| `Hd(text, o)` | 画面左上の見出し（id は常に `'h'`） |
| `card(id, box, label, textOpts)` | 角丸の箱 + 中央揃えのラベル（複数行は行数で縦位置を合わせる） |
| `pill(id, x, y, text, box, textOpts)` | 文字幅に合わせた丸いピル |
| `iconLine(id, icon, color, x, y, text, o)` | アイコン + 本文の 1 行 |
| `tw(text, size, weight, font)` | 文字列の描画幅 |

色の短縮名 `ink ink2 ink3 warm cool green red yellow gray violet line panel panel2` も `kit.js` が宣言する。デッキ側で同じ名前を再宣言すると SyntaxError になるので、独自の色は別名で取り出す（例 `const { blueInk } = COL;`）。

## 操作

`→` / Space / クリックで次へ、`←` / Shift+クリックで戻る、`N` スピーカーノート、`P` 発表者ウィンドウ、`F` フルスクリーン、`Home` / `End` 最初 / 最後、`?` ヘルプ。URL の `#番号` でそのシーンから始まる。
