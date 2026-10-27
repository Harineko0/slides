'use strict';
/* =========================================================================
 * kit.js — シーン定義で共通に使う部品（見出し・カード・ピル・アイコン行）
 * engine-core.js の後、デッキの scenes-*.js の前に読み込む。
 * 既定値は window.ENGINE_THEME.kit で上書きできる。
 * ここで宣言した名前（色の短縮名を含む）はデッキ側で再宣言しないこと。
 * ========================================================================= */
const { ink, ink2, ink3, warm, cool, green, red, yellow, gray, violet, line, panel, panel2 } = COL;
const KIT_CFG = {
  cardSize: 26, // card() の既定の文字サイズ
  iconTint: 0.14, // iconLine() の丸い下地の不透明度
  ...THEME.kit,
  heading: { x: 60, y: 36, size: 60, weight: 800, ...(THEME.kit && THEME.kit.heading) },
};

// 文字列の描画幅（設計座標）
const tw = (text, size, weight = 500, font = 'sans') => layoutText({ ...DEF.text, size, weight, font }, text).w;
// 画面左上の見出し。id は常に 'h' なので、シーンをまたいで文字がモーフィングする
const Hd = (text, o = {}) => T('h', text, { hud: true, ...KIT_CFG.heading, ...o });
// 角丸の箱 + 中央揃えのラベル。o は箱、to はラベルへの上書き
function card(id, o, label, to = {}) {
  const size = to.size || KIT_CFG.cardSize, lh = to.lh || 1.4;
  const n = to.maxW ? layoutText({ ...DEF.text, size, lh, weight: to.weight || 700, font: to.font || 'sans', maxW: to.maxW }, label).lines.length : String(label).split('\n').length;
  return [
    B(id, { r: 14, fill: panel2, stroke: line, ...o }),
    T(id + '_t', label, {
      x: o.x + o.w / 2, y: o.y + (o.h - size * lh * n) / 2, align: 'center', size, lh, weight: 700,
      d: o.d, md: o.md, s: o.s, rot: o.rot, alpha: o.alpha, jit: o.jit, ...to,
    }),
  ];
}
// 文字幅に合わせた丸いピル。align: 'center' なら x は中心
function pill(id, x, y, text, o = {}, to = {}) {
  const size = to.size || 30, weight = to.weight || 700;
  const w = tw(text, size, weight, to.font) + size * 1.5, h = Math.round(size * 2.1);
  return card(id, { x: o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x, y, w, h, r: h / 2, fill: panel, stroke: ink, lw: 2, ...o }, text, { size, weight, ...to });
}
// アイコン + 本文の 1 行（アイコンの大きさは文字サイズに比例）
function iconLine(id, icon_, color, x, y, text, o = {}) {
  const size = o.size || 48, r = size * 0.66, cy = y + size * 0.725;
  return [
    C(id + '_c', { x: x + r, y: cy, r, fill: color, fillA: KIT_CFG.iconTint, d: o.d, alpha: o.alpha }),
    I(id + '_i', icon_, { x: x + r, y: cy, size: size * 0.72, color, lw: 2.6, d: o.d, alpha: o.alpha }),
    T(id, text, { x: x + r * 2 + size * 0.5, y, size, weight: 700, maxW: 800, ...o }),
  ];
}
