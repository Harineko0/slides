'use strict';
/* =========================================================================
 * scenes-map.js — プロダクトハーネスの全体像（1枚の「世界」）と進化年表
 * 上段: アプリのタイル / 中段: 3本柱（16:9 のカード）/ 下段: Cloudflare の土台。
 * 各柱のカードには詳細（scenes-axes.js の CONTENT）が 1/4 に縮小して入っており、
 * カメラが z=4 でズームインすると、そのカードがそのまま画面になる（480 × 4 = 1920）。
 * ========================================================================= */
const ZM = 4;
const CONTENT = {}; // { auth, ds, ci, cf }: stage => actors（1920x1080 のフレーム内座標）
const pilFrame = i => ({ x: PIL[i].cx, y: PCARD.y + PCARD.h / 2, z: ZM });
const SLAB = { x: 180, y: 800, w: 1560, h: 120 };
const CF_FRAME = { x: 960, y: 875, z: ZM };
const frameRect = f => ({ x: f.x - 960 / f.z, y: f.y - 540 / f.z, w: 1920 / f.z, h: 1080 / f.z });

/* ---------- アプリのタイル（[名前, 登場する年表の段階]。名前なしは「…」の分） ---------- */
const APPS = [
  ['wiki', 0], ['tinyurl', 1], ['img', 2], ['scheduler', 2], ['sns', 2], ['pay', 2], ['connpass', 2], ['ost', 2], ['roster', 2], ['', 2], ['', 2],
  ['live-checkin', 3], ['', 3], ['', 3], ['', 3], ['', 3], ['', 3], ['', 3], ['', 3], ['', 3], ['mc', 4], ['screen', 4],
];
const TILE = { x0: 85, y0: 138, w: 150, h: 64, gx: 160, gy: 76 };
const tileXY = i => ({ x: TILE.x0 + (i % 11) * TILE.gx, y: TILE.y0 + Math.floor(i / 11) * TILE.gy });
const appIdx = name => APPS.findIndex(a => a[0] === name);

function tiles(o) {
  const out = [];
  APPS.forEach(([name, ph], i) => {
    if (ph > o.apps || (o.only && !o.only.includes(name))) return;
    const { x, y } = tileXY(i), hot = name === 'mc' || name === 'screen';
    // 年表の 05〜09: アプリごとに見た目がバラバラ
    const bara = o.bara && ph >= 1 && ph <= 2;
    const j = k => (hash(i * 7.3 + k) - 0.5);
    const box = bara
      ? { x: x + j(1) * 14, y: y + j(2) * 12, w: TILE.w, h: TILE.h, r: 4 + hash(i * 3.3) * 24, fill: [pBlue, pRed, pYellow, pGreen, panel][i % 5], stroke: [ink, ink3, cool][i % 3], lw: 1.5 + hash(i) * 2.5, rot: j(3) * 0.16 }
      : { x, y, w: TILE.w, h: TILE.h, r: 12, fill: name ? panel : panel2, stroke: hot ? red : name ? ink : line, lw: hot ? 3 : 2, rot: 0 };
    const d = o.instant ? 0 : 0.2 + (ph === o.apps ? (i % 11) * 0.06 : 0);
    out.push(B('app' + i, { ...box, alpha: o.appsA ?? 1, d, in: { alpha: 0, s: 0.4 } }));
    const size = name ? Math.min(26, (26 * (TILE.w - 16)) / tw(name, 26, 500, 'mono')) : 28;
    out.push(T('app' + i + '_t', name || '…', {
      x: box.x + TILE.w / 2, y: box.y + (TILE.h - size * 1.45) / 2, size, font: 'mono', align: 'center', rot: box.rot,
      color: hot ? redInk : name ? ink : ink3, weight: hot ? 700 : 500, alpha: o.appsA ?? 1, d,
    }));
  });
  return out;
}

/* ---------- 3本柱と土台 ---------- */
function pillars(o) {
  const out = [];
  PIL.forEach((p, i) => {
    const st = o.pil[i];
    if (!st || st === 'off') return;
    const ghost = st === 'ghost', focus = st === 'focus', d = 0.1 + i * 0.12;
    out.push(B('pl' + i, pilBox(p, ghost
      ? { fill: null, stroke: ink3, lw: 2, dash: 10, strokeA: 0.7, d }
      : focus ? { r: 0, lw: 0.5, strokeA: 0.5, fillA: 0.4 } : { d, md: o.md })));
    out.push(pilName(p, i, { color: ghost ? ink3 : ink, alpha: o.namesA ?? 1, d }));
    if (o.caps !== false) out.push(pilCap(p, i, (o.capText || CAPS)[i], { alpha: ghost ? 0.5 : 1, d: d + 0.1 }));
    if (ghost || o.noMini) return;
    const list = CONTENT[p.k](focus ? o.stage || 1 : 1).flat(Infinity).filter(Boolean);
    const mini = list.filter(a => !a.noMini).map(a => ({ ...a, alpha: (a.alpha ?? 1) * 0.55, d: 0.5 + i * 0.1, dur: 0.8, in: { alpha: 0 } }));
    out.push(inFrame(pilFrame(i), focus ? list : mini));
  });
  return out;
}
const SLAB_CHIPS = [['Workers', 'D1', 'R2', 'KV', 'Durable Objects', 'Realtime SFU'], ['Service Bindings', 'Queues', 'Workers AI', 'Vectorize', 'Analytics Engine']];
function slab(st, o = {}) {
  if (!st || st === 'off') return [];
  if (st === 'focus') {
    const r = frameRect(CF_FRAME);
    return [B('slab', { ...r, r: 0, fill: panel, fillA: 0.4, stroke: ink, lw: 0.5 }), inFrame(CF_FRAME, CONTENT.cf(o.stage || 1))];
  }
  const d = o.d ?? 0.2;
  return [
    B('slab', { ...SLAB, r: 22, fill: ink, stroke: ink, lw: 2, d, in: { alpha: 0, dy: 160 }, dur: 1.0 }),
    T('slab-t', 'Cloudflare', { x: SLAB.x + 36, y: SLAB.y + 14, size: 46, weight: 900, color: '#ffffff', d: d + 0.2 }),
    T('slab-s', '土台（月 $5）', { x: SLAB.x + 38, y: SLAB.y + 74, size: 28, weight: 700, color: '#bdbdbd', d: d + 0.25 }),
    SLAB_CHIPS.map((row, r) => {
      let x = SLAB.x + 360;
      return row.map((t, k) => {
        const w = tw(t, 26, 500, 'mono') + 30, el = card('sc' + r + '_' + k, { x, y: SLAB.y + 8 + r * 54, w, h: 48, r: 24, fill: '#3a3a3a', stroke: null, d: d + 0.3 + (r * 6 + k) * 0.03 }, t, { size: 26, font: 'mono', weight: 500, color: '#f0f0f0' });
        x += w + 10;
        return el;
      });
    }),
  ];
}
// opts: { hd, apps, bara, pil: [st, st, st], stage, slab, slabStage, caps, capText, appsA, only, noMini }
function map(o) {
  return [o.hd ? Hd(o.hd) : null, tiles(o), pillars(o), slab(o.slab, { stage: o.slabStage })];
}
// 柱からアプリへ流れるパーティクル（柱が支えている様子）
function mapP(o) {
  const parts = [];
  PIL.forEach((p, i) => {
    if (o.pil[i] !== 'on' && o.pil[i] !== 'focus') return;
    const paths = APPS.map((a, k) => [a, k]).filter(([a]) => a[1] <= o.apps).map(([, k]) => {
      const { x, y } = tileXY(k);
      return bez([p.cx + (k % 2 ? 1 : -1) * (180 + hash(k) * 50), PCARD.y], [p.cx, PCARD.y - 60], [x + TILE.w / 2, y + TILE.h + 60], [x + TILE.w / 2, y + TILE.h], 16);
    });
    if (paths.length) parts.push(pFlow({ paths, speed: 90, col: p.color, spread: 2, weight: 0.22, size: 1.8, alpha: 0.7 }));
  });
  if (o.slab === 'on') parts.push(pRects({ rects: [SLAB], speed: 160, col: u => GDG4[Math.floor(u * 4) % 4], size: 2, alpha: 0.8, weight: 0.25 }));
  parts.push(pAmbient({ weight: 0.3, alpha: 0.18 }));
  return parts;
}

/* ---------- 6. 進化年表 ---------- */
const NOTE6 = '具体的な中に入る前に、全体の時系列だけ共有します。今年の2月に最初の Wiki を作ったときは、基盤なんて何もありませんでした。4月に2つ目の短縮リンクを作るときに認証基盤ができ、夏にアプリが10個を超えてからデザインシステムが生まれました。こうして段階的に育った3つの軸を、順番に見ていきます。';
const MX = m => 180 + (m - 2) * 173;
const TLY = 846;
const TL = [
  { d: '2026-02', x0: MX(2.3), x1: MX(2.7), c: '1つ目のアプリ `wiki` だけを作った（基盤なし）' },
  { d: '2026-04', x0: MX(4.2), x1: MX(4.8), c: '2つ目の `tinyurl` でログインが必要に → [[blueInk!:① 認証認可基盤]]' },
  { d: '2026-05〜09', x0: MX(5), x1: MX(10), c: '`img` `scheduler` `sns` `pay` `connpass` … と急増' },
  { d: '2026-07〜10', x0: MX(7), x1: MX(10.9), c: '10個を超えて UI がバラバラに → [[yellowInk!:② デザインシステム]]' },
  { d: '2026-10', x0: MX(10.2), x1: MX(10.8), c: '[[greenInk!:③ 高速 CI・Skills]] が揃い、`mc` `screen` を2〜3時間で' },
];
const MONTHS = ['2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'];
function timeline(ph) {
  const e = TL[ph], cx = (e.x0 + e.x1) / 2;
  return [
    L('tl-line', [[MX(2), TLY], [MX(11), TLY]], { color: ink3, lw: 3, dur: 1.2, ease: 'inout' }),
    MONTHS.map((m, k) => [
      L('tl-tk' + k, [[MX(2 + k), TLY - 8], [MX(2 + k), TLY + 8]], { color: ink3, lw: 2, d: 0.2 }),
      T('tl-m' + k, m, { x: MX(2.5 + k), y: TLY + 12, size: 24, font: 'mono', color: ink3, align: 'center', d: 0.2 }),
    ]),
    L('tl-r', [[e.x0, TLY], [e.x1, TLY]], { color: ink, lw: 10, mdur: 1.2 }),
    C('tl-c', { x: e.x1, y: TLY, r: 12, fill: red, stroke: ink, lw: 2.5, mdur: 1.2 }),
    T('tl-d', e.d, { x: Math.min(1700, cx), y: TLY - 62, size: 32, font: 'mono', weight: 700, align: 'center', mdur: 1.2 }),
    T('tl-t', e.c, { x: 960, y: 918, size: 44, weight: 800, align: 'center', maxW: 1840 }),
  ];
}
const H6 = 'gdgs.jp の進化年表: アプリと基盤の歩み';
const TL_STATES = [
  { apps: 0, pil: ['ghost', 'ghost', 'ghost'] },
  { apps: 1, pil: ['on', 'ghost', 'ghost'] },
  { apps: 2, bara: 1, pil: ['on', 'ghost', 'ghost'] },
  { apps: 3, pil: ['on', 'on', 'ghost'] },
  { apps: 4, pil: ['on', 'on', 'on'] },
];
const TL_TITLES = ['2026-02: 基盤なしの1つ目', '2026-04: 認証認可基盤', '2026-05〜09: アプリが急増', '2026-07〜10: デザインシステム', '2026-10: 高速 CI・Skills'];
TL_STATES.forEach((s, ph) => scene({
  ch: 2, title: '進化年表 — ' + TL_TITLES[ph], notes: NOTE6,
  P: mapP(s),
  A: () => [map({ hd: H6, ...s }), timeline(ph)],
}));
