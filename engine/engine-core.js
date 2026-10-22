'use strict';
/* =========================================================================
 * engine-core.js — 描画プリミティブ・テキストレイアウト・パーティクル形状
 * 座標系は 1920x1080 の設計座標。シーン定義は scenes-*.js、実行は engine-run.js。
 * レイアウトの基準: 左右の余白 60、見出しは y 36、本文は y 150〜1040。
 * ========================================================================= */

const W = 1920, H = 1080;
// ライトテーマ。アクセント色は白地でも読める濃さにしてある
const COL = {
  bg: '#f5f6f8', ink: '#141a24', ink2: '#4a5466', ink3: '#8a93a3', line: '#d6dce5',
  panel: '#ffffff', panel2: '#eef1f5', code: '#f7f8fb', warmBg: '#fff3ec',
  warm: '#ec6a3e', cool: '#1b7fd6', green: '#12a05c', red: '#e03a52',
  yellow: '#c88400', gray: '#7d8697', violet: '#7556e6',
};
const FS = '"Inter","Noto Sans JP","Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';
const FM = '"JetBrains Mono","SF Mono",Menlo,Consolas,"Noto Sans JP",monospace';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

/* ---------- easing (値は animate スキルの推奨カーブ) ---------- */
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 24; i++) { if (sx(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return sy(t);
  };
}
const EASE = {
  out: bezier(0.23, 1, 0.32, 1),
  inout: bezier(0.77, 0, 0.175, 1),
  drawer: bezier(0.32, 0.72, 0, 1),
  linear: x => x,
};

/* ---------- color ---------- */
const _rgb = new Map();
function rgb(c) {
  let v = _rgb.get(c);
  if (v) return v;
  let s = c.replace('#', '');
  if (s.length === 3) s = s.split('').map(ch => ch + ch).join('');
  v = [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  _rgb.set(c, v);
  return v;
}
function mixc(a, b, t) {
  if (!a || !b || a === b) return b || a;
  const A = rgb(a), B = rgb(b);
  return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join('');
}
function rgba(c, a) { const v = rgb(c); return `rgba(${v[0]},${v[1]},${v[2]},${a})`; }

/* ---------- text layout ---------- */
const NO_START = '、。，．）」』】〉》”’！？：；ー…・％!?.,:;)]}%';
const measureCache = new Map(), layoutCache = new Map();
const mctx = document.createElement('canvas').getContext('2d');
function clearTextCaches() { measureCache.clear(); layoutCache.clear(); }

function fontOf(st, a) {
  const mono = st.mono || a.font === 'mono';
  const size = st.mono && a.font !== 'mono' ? a.size * 0.86 : a.size;
  const weight = st.bold ? Math.max(a.weight, 700) : a.weight;
  return `${weight} ${size}px ${mono ? FM : FS}`;
}
function mw(f, s) {
  const k = f + '\u0000' + s;
  let v = measureCache.get(k);
  if (v === undefined) { mctx.font = f; v = mctx.measureText(s).width; measureCache.set(k, v); }
  return v;
}
// **強調**  `コード`  ~~打ち消し~~  [[red:色指定]]  [[red!:太字+色]]
function parseRich(text, accent) {
  const out = [], re = /\*\*(.+?)\*\*|`(.+?)`|~~(.+?)~~|\[\[(\w+)(!?):(.+?)\]\]/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: text.slice(last, m.index), st: {} });
    if (m[1] != null) out.push({ t: m[1], st: { bold: 1, color: accent } });
    else if (m[2] != null) out.push({ t: m[2], st: { mono: 1, chip: 1 } });
    else if (m[3] != null) out.push({ t: m[3], st: { strike: 1 } });
    else out.push({ t: m[6], st: { color: COL[m[4]] || m[4], bold: m[5] ? 1 : 0 } });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ t: text.slice(last), st: {} });
  return out;
}
const UNIT_RE = /[A-Za-z0-9_\-.\/@#$%+=<>{}()\[\]'",;:|~^&*!?]+|[ \t\u3000]+|[^\sA-Za-z0-9]/g;

function layoutText(a, text, nocache) {
  const key = [text, a.size, a.weight, a.font, a.maxW, a.lh, a.accent].join('|');
  if (!nocache) { const hit = layoutCache.get(key); if (hit) return hit; }
  const runs = parseRich(String(text), a.accent);
  const maxW = a.maxW || 1e9, pad = a.size * 0.3;
  const lines = [];
  let cur = [], x = 0;
  const push = () => { lines.push({ units: cur, w: x }); cur = []; x = 0; };
  for (const r of runs) {
    const f = fontOf(r.st, a);
    const parts = r.st.chip ? [r.t] : r.t.split(/(\n)/).flatMap(s => (s === '\n' ? ['\n'] : s.match(UNIT_RE) || []));
    for (const u of parts) {
      if (u === '\n') { push(); continue; }
      const w = mw(f, u) + (r.st.chip ? pad * 2 : 0);
      if (cur.length && x + w > maxW && !NO_START.includes(u[0])) {
        push();
        if (/^[ \t\u3000]+$/.test(u)) continue;
      }
      cur.push({ t: u, st: r.st, f, w });
      x += w;
    }
  }
  push();
  let chars = 0;
  for (const ln of lines) {
    const m = [];
    for (const u of ln.units) {
      const p = m[m.length - 1];
      if (p && p.st === u.st && !u.st.chip) { p.t += u.t; p.w += u.w; } else m.push({ ...u });
    }
    // 「、「」のような約物の連続は描画時に詰められるので、ラン単位で測り直す
    for (const r of m) if (!r.st.chip) r.w = mw(r.f, r.t);
    ln.runs = m;
    ln.w = m.reduce((s, r) => s + r.w, 0);
    // 行頭の始め括弧は左へぶら下げて、左揃えの縦のラインを揃える
    ln.lead = m.length && /^[「『（【〈《]/.test(m[0].t) ? a.size * 0.5 : 0;
    for (const r of m) chars += r.t.length;
  }
  const lhpx = a.size * a.lh;
  const L = { lines, w: Math.max(0, ...lines.map(l => l.w)), h: lines.length * lhpx, lhpx, chars, pad };
  if (!nocache) layoutCache.set(key, L);
  return L;
}

function drawTextLayout(c, a, L, alpha, limit) {
  let shown = 0;
  const pad = L.pad;
  for (let i = 0; i < L.lines.length; i++) {
    const ln = L.lines[i];
    const cy = a.y + L.lhpx * (i + 0.5);
    let x = a.x - (a.align === 'center' ? ln.w / 2 : a.align === 'right' ? ln.w : ln.lead);
    for (const r of ln.runs) {
      if (limit != null && shown >= limit) return;
      let t = r.t;
      if (limit != null && shown + t.length > limit) t = t.slice(0, limit - shown);
      shown += r.t.length;
      const color = r.st.color || a.color;
      c.font = r.f;
      if (r.st.chip) {
        const h = a.size * 1.22;
        c.globalAlpha = alpha;
        rr(c, x, cy - h / 2, r.w, h, 7);
        c.fillStyle = COL.panel2; c.fill();
        c.strokeStyle = COL.line; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = r.st.color || a.chip || COL.cool;
        c.fillText(t, x + pad, cy);
      } else {
        c.globalAlpha = alpha;
        c.fillStyle = color;
        c.fillText(t, x, cy);
        if (r.st.strike) {
          c.strokeStyle = COL.red; c.lineWidth = Math.max(2, a.size * 0.07);
          c.beginPath(); c.moveTo(x - 2, cy); c.lineTo(x + mw(r.f, t) + 2, cy); c.stroke();
        }
      }
      x += r.w;
    }
  }
}

const SCRAMBLE = '01<>/{}[]#$%&*+=_ｱｲｳｴｵｶｷｸｹｺ';
function scrambleText(from, to, p, seed) {
  const a = [...from], b = [...to], n = Math.max(a.length, b.length);
  const k = Math.floor(p * (n + 6)) - 6;
  let out = '';
  for (let i = 0; i < n; i++) {
    if (i < k) out += b[i] ?? '';
    else if (i < k + 6) out += (b[i] || a[i]) ? SCRAMBLE[Math.floor(hash(i + seed) * SCRAMBLE.length)] : '';
    else out += a[i] ?? '';
  }
  return out;
}
function fmtNum(v, dec) { return dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US'); }

/* ---------- shapes ---------- */
function rr(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
// 角丸の折れ線を点列に展開（部分描画のため）
function rp(pts, r = 18) {
  if (pts.length < 3) return pts.map(p => [p[0], p[1]]);
  const out = [[pts[0][0], pts[0][1]]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], [cx, cy] = pts[i + 1];
    const d1 = Math.hypot(bx - ax, by - ay), d2 = Math.hypot(cx - bx, cy - by);
    const rr_ = Math.min(r, d1 / 2, d2 / 2);
    const p1 = [bx - (bx - ax) / d1 * rr_, by - (by - ay) / d1 * rr_];
    const p2 = [bx + (cx - bx) / d2 * rr_, by + (cy - by) / d2 * rr_];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8, u = 1 - t;
      out.push([u * u * p1[0] + 2 * u * t * bx + t * t * p2[0], u * u * p1[1] + 2 * u * t * by + t * t * p2[1]]);
    }
  }
  out.push([pts[pts.length - 1][0], pts[pts.length - 1][1]]);
  return out;
}
function bez(p0, c1, c2, p1, n = 32) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
    ]);
  }
  return out;
}
function polyLen(pts) { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; }
function pointAt(pts, u, lens) {
  const total = lens[lens.length - 1];
  let d = u * total, i = 1;
  while (i < lens.length - 1 && lens[i] < d) i++;
  const seg = lens[i] - lens[i - 1] || 1, t = (d - lens[i - 1]) / seg;
  return [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])];
}
function cumLens(pts) { const l = [0]; for (let i = 1; i < pts.length; i++) l.push(l[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return l; }

// 横顔（右向き）。0..1 の正規化座標
const HEAD = [[0.30, 1.00], [0.30, 0.80], [0.18, 0.72], [0.10, 0.55], [0.10, 0.38], [0.16, 0.22], [0.28, 0.10], [0.44, 0.04], [0.60, 0.04], [0.74, 0.10], [0.84, 0.22], [0.88, 0.36], [0.87, 0.44], [0.92, 0.52], [0.98, 0.62], [0.92, 0.66], [0.93, 0.72], [0.90, 0.76], [0.91, 0.80], [0.84, 0.86], [0.72, 0.86], [0.66, 0.90], [0.64, 1.00]];

/* ---------- icons (24x24 stroke paths) ---------- */
const ICON_D = {
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  file: 'M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5',
  folder: 'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  terminal: 'M4 17l6-6-6-6M12 19h8',
  bot: 'M12 8V4H8M4 8h16v12H4zM2 14h2M20 14h2M15 13v2M9 13v2',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  cpu: 'M6 6h12v12H6zM9 9h6v6H9zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  branch: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  plug: 'M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z',
  package: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  loop: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  alert: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  pr: 'M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 9v12M13 6h3a2 2 0 0 1 2 2v7',
  pen: 'M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.6 7.6M11 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  clip: 'M9 3h6v3H9zM8 4.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5.5a1 1 0 0 0-1-1h-2M9 12h6M9 16h4',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  ban: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM4.9 4.9l14.2 14.2',
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  layers: 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  merge: 'M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21V9a9 9 0 0 0 9 9',
  list: 'M3 17l2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8',
  chart: 'M3 3v18h18M7 16v-5M12 16V8M17 16v-8',
  gap: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35M8 11h6',
  diff: 'M12 3v14M5 10h14M5 21h14',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  image: 'M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01',
};
const ICON = {};
function icon(name) { return ICON[name] || (ICON[name] = new Path2D(ICON_D[name] || ICON_D.help)); }

/* ---------- images ---------- */
const IMGS = new Map();
function img(src) {
  let e = IMGS.get(src);
  if (!e) {
    e = { el: new Image(), ok: false, err: false };
    e.el.onload = () => { e.ok = true; };
    e.el.onerror = () => { e.err = true; };
    e.el.src = src;
    IMGS.set(src, e);
  }
  return e;
}

/* ---------- actor constructors (シーン定義用) ---------- */
const T = (id, text, o = {}) => ({ id, type: 'text', text, ...o });
const B = (id, o = {}) => ({ id, type: 'box', ...o });
const L = (id, pts, o = {}) => ({ id, type: 'line', pts, ...o });
const C = (id, o = {}) => ({ id, type: 'circle', ...o });
const I = (id, name, o = {}) => ({ id, type: 'icon', name, ...o });
const IMG = (id, src, o = {}) => ({ id, type: 'image', src, ...o });
const CODE = (id, lines, o = {}) => ({ id, type: 'code', lines, ...o });
const POLY = (id, pts, o = {}) => ({ id, type: 'poly', pts, ...o });
// フレーム（ズーム先のローカル座標系）に載せる
function inFrame(f, list) { return list.flat(Infinity).map(a => ({ ...a, fx: f.x, fy: f.y, fz: f.z })); }
// 部品グループを (ax, ay) 基準で k 倍し、(bx, by) へ移す
function scaleG(list, k, ax, ay, bx, by) {
  const X = v => bx + (v - ax) * k, Y = v => by + (v - ay) * k;
  return list.flat(Infinity).filter(Boolean).map(a => {
    const o = { ...a };
    if (o.x != null) o.x = X(o.x);
    if (o.y != null) o.y = Y(o.y);
    for (const key of ['w', 'h', 'r', 'size', 'maxW', 'lw']) if (o[key] != null) o[key] *= k;
    if (o.pts) o.pts = o.pts.map(([x, y]) => [X(x), Y(y)]);
    return o;
  });
}
// '--' が等幅フォントの合字にならないよう ZWNJ を挟む
const nolig = s => s.replace(/--/g, '-\u200c-');

const DEF = {
  common: { alpha: 1, s: 1, rot: 0, reveal: 1, fx: 960, fy: 540, fz: 1, jit: 0, pulse: 0, glow: 0, z: 0 },
  text: { x: 0, y: 0, size: 32, weight: 500, color: COL.ink, align: 'left', font: 'sans', lh: 1.45, maxW: 0, accent: COL.cool },
  box: { x: 0, y: 0, w: 100, h: 100, r: 14, fill: null, fillA: 1, stroke: null, strokeA: 1, lw: 2, dash: 0 },
  line: { pts: [[0, 0], [100, 0]], color: COL.ink3, lw: 2, dash: 0, flow: 0, head: 0 },
  circle: { x: 0, y: 0, r: 10, fill: null, fillA: 1, stroke: null, strokeA: 1, lw: 2 },
  icon: { x: 0, y: 0, size: 32, color: COL.ink, lw: 2 },
  image: { x: 0, y: 0, w: 320, h: 180, r: 12, src: '' },
  code: { x: 0, y: 0, size: 24, lh: 1.6, lines: [], weight: 400 },
  poly: { x: 0, y: 0, w: 100, h: 100, pts: [], stroke: COL.ink, lw: 2, fill: null, fillA: 0.1, closed: 1, smooth: 1 },
};
const NUM_KEYS = ['x', 'y', 'w', 'h', 'r', 'size', 'alpha', 's', 'rot', 'reveal', 'fx', 'fy', 'fz', 'lw', 'fillA', 'strokeA', 'jit', 'pulse', 'glow', 'num', 'dash', 'flow', 'head'];
const COLOR_KEYS = ['color', 'fill', 'stroke', 'accent', 'chip'];
const IN_DEF = {
  text: { alpha: 0, dy: 18 }, box: { alpha: 0, s: 0.96 }, line: { reveal: 0 }, circle: { alpha: 0, s: 0.9 },
  icon: { alpha: 0, s: 0.9 }, image: { alpha: 0, dy: 28 }, code: { alpha: 0, dy: 12 }, poly: { alpha: 0, reveal: 0 },
};
const DUR_DEF = { text: 0.7, box: 0.8, line: 0.9, circle: 0.7, icon: 0.6, image: 0.9, code: 0.8, poly: 1.2 };

function withDefaults(a) {
  const o = { ...DEF.common, ...DEF[a.type] };
  for (const k in a) if (a[k] !== undefined) o[k] = a[k];
  return o;
}

/* ---------- actor drawing ---------- */
function anchorOf(a) {
  switch (a.type) {
    case 'box': case 'image': case 'poly': return [a.x + a.w / 2, a.y + a.h / 2];
    case 'line': return [0, 0];
    default: return [a.x, a.y];
  }
}

function drawActor(c, a, now) {
  if (a.alpha <= 0.002) return;
  c.save();
  if (a.fz !== 1 || a.fx !== 960 || a.fy !== 540) { c.translate(a.fx, a.fy); c.scale(1 / a.fz, 1 / a.fz); c.translate(-960, -540); }
  let s = a.s;
  if (a.pulse) s *= 1 + a.pulse * 0.035 * Math.sin(now * 3.4);
  if (a.jit && !REDUCED) {
    const k = Math.floor(now * 14);
    c.translate((hash(k + a.id.length) - 0.5) * a.jit, (hash(k * 1.7 + 3) - 0.5) * a.jit);
  }
  if (s !== 1 || a.rot) {
    const [ax, ay] = anchorOf(a);
    c.translate(ax, ay); c.rotate(a.rot); c.scale(s, s); c.translate(-ax, -ay);
  }
  if (a.glow) { c.shadowBlur = a.glow; c.shadowColor = rgba(a.color || a.stroke || a.fill || COL.cool, 0.45); }
  DRAW[a.type](c, a, now);
  c.restore();
}

const DRAW = {
  text(c, a, now) {
    c.textBaseline = 'middle';
    c.textAlign = 'left';
    const tpl = t => (a.num != null && String(t).includes('{n}') ? String(t).replace('{n}', fmtNum(a.num, a.dec)) : t);
    const limit = L_ => (a.reveal < 1 ? Math.floor(L_.chars * a.reveal) : null);
    if (a._prev != null && a._xf < 1) {
      if (a.fxs === 'scramble') {
        const Ls = layoutText(a, scrambleText(String(a._prev), String(tpl(a.text)), a._xf, a.id.length), true);
        drawTextLayout(c, a, Ls, a.alpha, null);
        return;
      }
      // 旧テキストが消えてから新テキストを出す（重なって読めない瞬間を作らない）
      const outA = Math.max(0, 1 - a._xf * 2.2), inA = Math.max(0, a._xf * 2.2 - 1.2);
      if (outA > 0) drawTextLayout(c, a, layoutText(a, tpl(a._prev)), a.alpha * outA, null);
      const Ln = layoutText(a, tpl(a.text));
      if (inA > 0) drawTextLayout(c, a, Ln, a.alpha * Math.min(1, inA), limit(Ln));
      return;
    }
    const Lx = layoutText(a, tpl(a.text));
    drawTextLayout(c, a, Lx, a.alpha, limit(Lx));
    if (a.reveal > 0 && a.reveal < 1 && a.caret) {
      c.globalAlpha = a.alpha;
      c.fillStyle = a.color;
      c.fillRect(a.x + Lx.w * a.reveal, a.y + 4, a.size * 0.5, a.size * 1.1);
    }
  },
  box(c, a) {
    c.globalAlpha = a.alpha;
    if (a.reveal < 1) { c.beginPath(); c.rect(a.x - 4, a.y - 40, (a.w + 8) * a.reveal, a.h + 80); c.clip(); }
    rr(c, a.x, a.y, a.w, a.h, a.r);
    if (a.fill) { c.globalAlpha = a.alpha * a.fillA; c.fillStyle = a.fill; c.fill(); }
    if (a.stroke && a.lw > 0) {
      c.shadowBlur = 0;
      c.globalAlpha = a.alpha * a.strokeA;
      c.strokeStyle = a.stroke; c.lineWidth = a.lw;
      if (a.dash) c.setLineDash([a.dash, a.dash * 0.8]);
      c.stroke();
    }
  },
  line(c, a, now) {
    const pts = a.pts;
    if (!pts || pts.length < 2 || a.reveal <= 0) return;
    const lens = cumLens(pts), total = lens[lens.length - 1], upto = total * a.reveal;
    c.globalAlpha = a.alpha;
    c.strokeStyle = a.color; c.lineWidth = a.lw; c.lineCap = 'round'; c.lineJoin = 'round';
    if (a.dash) { c.setLineDash([a.dash, a.dash * 1.1]); c.lineDashOffset = a.flow ? -now * a.flow : 0; }
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    let tip = pts[0], ang = 0;
    for (let i = 1; i < pts.length; i++) {
      if (lens[i] <= upto) { c.lineTo(pts[i][0], pts[i][1]); tip = pts[i]; ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]); }
      else {
        const t = (upto - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
        tip = [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)];
        ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
        c.lineTo(tip[0], tip[1]);
        break;
      }
    }
    c.stroke();
    if (a.head) {
      c.setLineDash([]);
      const hs = a.head;
      c.fillStyle = a.color;
      c.beginPath();
      c.moveTo(tip[0] + Math.cos(ang) * hs * 0.4, tip[1] + Math.sin(ang) * hs * 0.4);
      c.lineTo(tip[0] + Math.cos(ang + 2.5) * hs, tip[1] + Math.sin(ang + 2.5) * hs);
      c.lineTo(tip[0] + Math.cos(ang - 2.5) * hs, tip[1] + Math.sin(ang - 2.5) * hs);
      c.closePath(); c.fill();
    }
  },
  circle(c, a) {
    c.globalAlpha = a.alpha;
    if (a.fill) {
      c.beginPath(); c.arc(a.x, a.y, Math.max(0, a.r), 0, Math.PI * 2);
      c.globalAlpha = a.alpha * a.fillA; c.fillStyle = a.fill; c.fill();
    }
    if (a.stroke && a.lw > 0) {
      c.shadowBlur = 0;
      c.beginPath(); c.arc(a.x, a.y, Math.max(0, a.r), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a.reveal);
      c.globalAlpha = a.alpha * a.strokeA; c.strokeStyle = a.stroke; c.lineWidth = a.lw;
      if (a.dash) c.setLineDash([a.dash, a.dash]);
      c.stroke();
    }
  },
  icon(c, a) {
    c.globalAlpha = a.alpha;
    c.translate(a.x, a.y);
    const k = a.size / 24;
    c.scale(k, k); c.translate(-12, -12);
    c.strokeStyle = a.color; c.lineWidth = a.lw / k; c.lineCap = 'round'; c.lineJoin = 'round';
    c.stroke(icon(a.name));
  },
  image(c, a) {
    const drawOne = (src, alpha) => {
      if (!src || alpha <= 0) return;
      const e = img(src);
      c.save();
      c.globalAlpha = alpha;
      rr(c, a.x, a.y, a.w, a.h, a.r);
      c.fillStyle = COL.panel2; c.fill();
      c.clip();
      if (e.ok) c.drawImage(e.el, a.x, a.y, a.w, a.h);
      else {
        c.fillStyle = COL.ink3; c.font = `500 ${Math.max(14, a.w / 30)}px ${FS}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(e.err ? '画像を読み込めません（オフライン時は出典 URL を参照）' : '読み込み中…', a.x + a.w / 2, a.y + a.h / 2);
      }
      c.restore();
    };
    if (a._prevSrc && a._xf < 1) drawOne(a._prevSrc, a.alpha * (1 - a._xf));
    drawOne(a.src, a.alpha * (a._prevSrc && a._xf < 1 ? a._xf : 1));
    c.globalAlpha = a.alpha;
    rr(c, a.x, a.y, a.w, a.h, a.r);
    c.strokeStyle = COL.line; c.lineWidth = 2; c.stroke();
  },
  code(c, a, now) {
    c.textBaseline = 'middle';
    c.textAlign = 'left';
    const f = `${a.weight} ${a.size}px ${FM}`;
    c.font = f;
    const lh = a.size * a.lh;
    const total = a.lines.reduce((s, ln) => s + ln.reduce((q, r) => q + r[0].length, 0) + 1, 0);
    const limit = a.reveal < 1 ? Math.floor(total * a.reveal) : Infinity;
    let shown = 0, cx = a.x, cy = a.y + lh / 2;
    if (a.hl) for (const [row, color] of a.hl) {
      c.globalAlpha = a.alpha * 0.14; c.fillStyle = color;
      c.fillRect(a.x - 14, a.y + row * lh, (a.hlW || 900), lh);
      c.globalAlpha = a.alpha; c.fillRect(a.x - 14, a.y + row * lh, 4, lh);
    }
    c.globalAlpha = a.alpha;
    for (let i = 0; i < a.lines.length && shown < limit; i++) {
      let x = a.x;
      const y = a.y + lh * (i + 0.5);
      for (const [t, color] of a.lines[i]) {
        if (shown >= limit) break;
        const s = shown + t.length > limit ? t.slice(0, limit - shown) : t;
        c.fillStyle = color || COL.ink;
        c.fillText(s, x, y);
        x += mw(f, s);
        shown += t.length;
      }
      shown += 1;
      cx = x; cy = y;
    }
    if (a.reveal < 1 && a.reveal > 0 && Math.floor(now * 2.5) % 2 === 0) {
      c.fillStyle = COL.ink; c.fillRect(cx + 2, cy - a.size * 0.55, a.size * 0.55, a.size * 1.1);
    }
  },
  poly(c, a) {
    const P = a.pts.map(p => [a.x + p[0] * a.w, a.y + p[1] * a.h]);
    if (P.length < 2) return;
    c.globalAlpha = a.alpha;
    c.beginPath();
    if (a.smooth) {
      const n = P.length, m = (i) => [(P[i % n][0] + P[(i + 1) % n][0]) / 2, (P[i % n][1] + P[(i + 1) % n][1]) / 2];
      const s0 = m(0);
      c.moveTo(s0[0], s0[1]);
      for (let i = 1; i <= (a.closed ? n : n - 1); i++) { const q = m(i); c.quadraticCurveTo(P[i % n][0], P[i % n][1], q[0], q[1]); }
    } else {
      c.moveTo(P[0][0], P[0][1]);
      for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]);
    }
    if (a.closed) c.closePath();
    if (a.fill) { c.globalAlpha = a.alpha * a.fillA * a.reveal; c.fillStyle = a.fill; c.fill(); }
    if (a.stroke) {
      const len = polyLen(P) * 1.1 + 40;
      c.globalAlpha = a.alpha;
      c.setLineDash([len * a.reveal, len]);
      c.strokeStyle = a.stroke; c.lineWidth = a.lw; c.lineJoin = 'round'; c.lineCap = 'round';
      c.stroke();
    }
  },
};

/* =========================================================================
 * particle shapes — 各関数は「部品」を返し、engine-run.js がコンパイルする。
 * 部品は build(count) → { fill(t, tx, ty, off), col(k), size(k), alpha(k) }。
 * ========================================================================= */
function _sampleCanvas(w, h, draw, step = 3) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c = cv.getContext('2d');
  draw(c);
  const d = c.getImageData(0, 0, w, h).data, pts = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 128) pts.push([x, y]);
  return pts;
}
function _colFn(col) { return typeof col === 'function' ? col : () => col; }
function _pick(arr, k, n) { return arr[Math.floor((k * arr.length) / Math.max(1, n)) % arr.length]; }

// 円環（回転）
function pRing(o) {
  const { x, y, r, w = 40, speed = 0.08, col = COL.cool, size = 2, alpha = 0.8, weight = 1 } = o;
  return { weight, build(n) {
    const cf = _colFn(col);
    return {
      fill(t, tx, ty, off) {
        for (let k = 0; k < n; k++) {
          const u = k / n, rad = r + (hash(k * 3.1) - 0.5) * w;
          const a = u * Math.PI * 2 + t * speed * (0.7 + 0.6 * hash(k));
          tx[off + k] = x + Math.cos(a) * rad; ty[off + k] = y + Math.sin(a) * rad * (o.squash || 1);
        }
      },
      col: k => cf(k / n), size: k => size * (0.6 + hash(k * 7.3)), alpha: () => alpha,
    };
  } };
}
// ガウス雲（ゆっくり渦）
function pCloud(o) {
  const { x, y, rx, ry = rx, col = COL.warm, size = 2, alpha = 0.7, swirl = 0.15, weight = 1 } = o;
  return { weight, build(n) {
    const cf = _colFn(col);
    const base = Array.from({ length: n }, (_, k) => {
      const a = hash(k * 1.3) * Math.PI * 2, rr_ = Math.sqrt(-2 * Math.log(hash(k * 2.7) * 0.98 + 0.01)) * 0.5;
      return [a, rr_];
    });
    return {
      fill(t, tx, ty, off) {
        for (let k = 0; k < n; k++) {
          const [a, d] = base[k], aa = a + t * swirl * (1.2 - d);
          tx[off + k] = x + Math.cos(aa) * d * rx; ty[off + k] = y + Math.sin(aa) * d * ry;
        }
      },
      col: k => cf(k / n), size: k => size * (0.5 + hash(k * 5.1)), alpha: () => alpha,
    };
  } };
}
// 格子
function pGrid(o) {
  const { x, y, w, h, cols, rows, jitter = 0, col = COL.cool, size = 2, alpha = 0.5, weight = 1, wob = 0 } = o;
  return { weight, build(n) {
    const cf = _colFn(col);
    return {
      fill(t, tx, ty, off) {
        for (let k = 0; k < n; k++) {
          const cell = k % (cols * rows), cx = cell % cols, cy = Math.floor(cell / cols);
          const j = jitter ? jitter : 0;
          tx[off + k] = x + (cx + 0.5) * (w / cols) + (hash(k * 9.1) - 0.5) * j + (wob ? Math.sin(t * 1.3 + k) * wob : 0);
          ty[off + k] = y + (cy + 0.5) * (h / rows) + (hash(k * 4.3) - 0.5) * j + (wob ? Math.cos(t * 1.1 + k) * wob : 0);
        }
      },
      col: k => cf(k / n), size: k => size, alpha: k => (k < cols * rows ? alpha : 0),
    };
  } };
}
// テキスト形状（サンプリング）
function pText(o) {
  const { str, x, y, size = 200, weight = 900, font = FS, col = COL.cool, psize = 2, alpha = 0.9, wob = 1.5 } = o;
  return { weight: o.weight_ || 1, build(n) {
    const cf = _colFn(col);
    const pw = Math.ceil(size * (str.length + 1) * 1.1), ph = Math.ceil(size * 1.4);
    const pts = _sampleCanvas(pw, ph, c => {
      c.font = `${weight} ${size}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff';
      c.fillText(str, pw / 2, ph / 2);
    }, Math.max(2, Math.round(size / 70)));
    const order = pts.map((p, i) => [hash(i * 1.37), p]).sort((a, b) => a[0] - b[0]).map(e => e[1]);
    return {
      fill(t, tx, ty, off) {
        for (let k = 0; k < n; k++) {
          const p = order.length ? order[k % order.length] : [pw / 2, ph / 2];
          tx[off + k] = x + p[0] - pw / 2 + Math.sin(t * 1.7 + k) * wob; ty[off + k] = y + p[1] - ph / 2 + Math.cos(t * 1.3 + k) * wob;
        }
      },
      col: k => cf(k / n), size: k => psize * (0.7 + hash(k) * 0.6), alpha: () => alpha,
    };
  } };
}
// 多角形内部（例: 頭部シルエット）
function pPoly(o) {
  const { pts, x, y, w, h, col = COL.warm, size = 2, alpha = 0.8, weight = 1, wob = 6 } = o;
  return { weight, build(n) {
    const cf = _colFn(col);
    const path = new Path2D();
    pts.forEach((p, i) => (i ? path.lineTo(p[0] * w, p[1] * h) : path.moveTo(p[0] * w, p[1] * h)));
    path.closePath();
    const cv = document.createElement('canvas').getContext('2d');
    const inside = [];
    let guard = 0;
    while (inside.length < n && guard++ < n * 60) {
      const px = hash(guard * 1.91) * w, py = hash(guard * 3.17) * h * (o.top || 1);
      if (cv.isPointInPath(path, px, py)) inside.push([px, py]);
    }
    return {
      fill(t, tx, ty, off) {
        for (let k = 0; k < n; k++) {
          const p = inside[k % Math.max(1, inside.length)] || [w / 2, h / 2];
          tx[off + k] = x + p[0] + Math.sin(t * 0.9 + k * 1.3) * wob; ty[off + k] = y + p[1] + Math.cos(t * 0.7 + k * 0.7) * wob;
        }
      },
      col: k => cf(k / n), size: k => size * (0.6 + hash(k * 2.2) * 0.8), alpha: () => alpha,
    };
  } };
}
// 経路に沿って流れる
function pFlow(o) {
  const { paths, speed = 90, col = COL.cool, size = 2, alpha = 0.85, spread = 3, weight = 1 } = o;
  return { weight, build(n) {
    const cf = _colFn(col);
    const P = paths.map(p => ({ p, l: cumLens(p) }));
    return {
      fill(t, tx, ty, off) {
        for (let k = 0; k < n; k++) {
          const e = P[k % P.length], len = e.l[e.l.length - 1] || 1;
          const u = (hash(k * 0.73) + (t * speed * (0.8 + 0.4 * hash(k * 5.5))) / len) % 1;
          const q = pointAt(e.p, u, e.l);
          const sp = (hash(k * 8.8) - 0.5) * spread * 2;
          tx[off + k] = q[0] - Math.sin(q[2]) * sp; ty[off + k] = q[1] + Math.cos(q[2]) * sp;
        }
      },
      col: k => cf(k / n, k % P.length), size: k => size * (0.6 + hash(k * 3.9) * 0.8), alpha: () => alpha,
    };
  } };
}
// 漂う塵
function pAmbient(o = {}) {
  const { x = 0, y = 0, w = W, h = H, col = COL.ink3, size = 1.4, alpha = 0.35, weight = 1, drift = 18 } = o;
  return { weight, build(n) {
    const cf = _colFn(col);
    return {
      fill(t, tx, ty, off) {
        for (let k = 0; k < n; k++) {
          tx[off + k] = x + hash(k * 1.11) * w + Math.sin(t * 0.21 + k) * drift;
          ty[off + k] = y + hash(k * 2.23) * h + Math.cos(t * 0.17 + k * 1.7) * drift;
        }
      },
      col: k => cf(k / n), size: k => size * (0.5 + hash(k * 6.6)), alpha: k => alpha * (0.4 + 0.6 * hash(k * 4.4)),
    };
  } };
}
// 複数の塊
function pClusters(o) {
  const { list, size = 2, alpha = 0.8, weight = 1, swirl = 0.3 } = o;
  const totalW = list.reduce((s, e) => s + (e.w || 1), 0);
  return { weight, build(n) {
    const idx = [];
    for (let k = 0; k < n; k++) {
      let u = hash(k * 0.917) * totalW, j = 0;
      while (j < list.length - 1 && u > (list[j].w || 1)) { u -= list[j].w || 1; j++; }
      idx.push(j);
    }
    return {
      fill(t, tx, ty, off) {
        for (let k = 0; k < n; k++) {
          const e = list[idx[k]];
          const a = hash(k * 1.7) * Math.PI * 2 + t * swirl * (hash(k) > 0.5 ? 1 : -1);
          const d = Math.sqrt(hash(k * 2.9)) * e.r;
          tx[off + k] = e.x + Math.cos(a) * d; ty[off + k] = e.y + Math.sin(a) * d * (e.sq || 1);
        }
      },
      col: k => list[idx[k]].col || COL.cool, size: k => size * (0.6 + hash(k * 3.3) * 0.8), alpha: k => list[idx[k]].a ?? alpha,
    };
  } };
}
// コード行のような横棒
function pLines(o) {
  const { x, y, w, rows, lh = 22, col = COL.cool, size = 2, alpha = 0.8, weight = 1, gap = 6 } = o;
  return { weight, build(n) {
    const cf = _colFn(col);
    const slots = [];
    for (let r = 0; r < rows; r++) {
      const indent = (Math.floor(hash(r * 3.3) * 4)) * 34, len = w * (0.25 + hash(r * 7.7) * 0.6);
      for (let px = 0; px < len; px += gap) slots.push([x + indent + px, y + r * lh]);
    }
    return {
      fill(t, tx, ty, off) {
        for (let k = 0; k < n; k++) { const p = _pick(slots, k, n); tx[off + k] = p[0]; ty[off + k] = p[1]; }
      },
      col: k => cf(k / n), size: () => size, alpha: () => alpha,
    };
  } };
}
// 矩形の外周
function pRects(o) {
  const { rects, col = COL.cool, size = 1.8, alpha = 0.7, weight = 1, speed = 0 } = o;
  return { weight, build(n) {
    const cf = _colFn(col);
    const per = rects.map(r => 2 * (r.w + r.h)), tot = per.reduce((a, b) => a + b, 0);
    return {
      fill(t, tx, ty, off) {
        for (let k = 0; k < n; k++) {
          let d = ((k / n) * tot + t * speed) % tot, i = 0;
          while (d > per[i]) { d -= per[i]; i++; }
          const r = rects[i];
          let px, py;
          if (d < r.w) { px = r.x + d; py = r.y; }
          else if (d < r.w + r.h) { px = r.x + r.w; py = r.y + d - r.w; }
          else if (d < 2 * r.w + r.h) { px = r.x + r.w - (d - r.w - r.h); py = r.y + r.h; }
          else { px = r.x; py = r.y + r.h - (d - 2 * r.w - r.h); }
          tx[off + k] = px; ty[off + k] = py;
        }
      },
      col: k => cf(k / n), size: () => size, alpha: () => alpha,
    };
  } };
}

/* ---------- syntax tokens for code actors ---------- */
const SYN = { key: '#0f6fb8', str: '#138a52', num: '#b36a00', punc: '#8a93a3', com: '#8a93a3', cmd: '#141a24', flag: '#b36a00', prompt: '#12a05c' };
function json(src) {
  return src.split('\n').map(line => {
    const out = [], re = /("(?:[^"\\]|\\.)*")(\s*:)?|(\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?)|([{}\[\],:])|(\s+)|([^"{}\[\],:\s]+)/g;
    let m;
    while ((m = re.exec(line))) {
      if (m[1]) { out.push([m[1], m[2] ? SYN.key : SYN.str]); if (m[2]) out.push([m[2], SYN.punc]); }
      else if (m[3]) out.push([m[3], SYN.num]);
      else if (m[4]) out.push([m[4], SYN.punc]);
      else out.push([m[0], COL.ink2]);
    }
    return out;
  });
}
function sh(src) {
  return src.split('\n').map(line => {
    const i = line.indexOf('#');
    const code = i >= 0 ? line.slice(0, i) : line, com = i >= 0 ? line.slice(i) : '';
    const out = [];
    if (code.trim()) {
      out.push(['$ ', SYN.prompt]);
      code.split(/(\s+)/).forEach((w, j) => out.push([nolig(w), w.startsWith('-') ? SYN.flag : j === 0 ? SYN.cmd : COL.ink2]));
    }
    if (com) out.push([com, SYN.com]);
    return out;
  });
}

/* ---------- scene registry ---------- */
const CHAPTERS = ['イントロ', '背景', '動機', '事例: LayerX', 'ハーネスの作り方', 'スキル紹介', '使った結果', 'まとめ'];
const SCENES = [];
// scene({ ch, title, notes, cam?, P: particle parts | {parts, frame}, A: () => actors[] })
function scene(o) { SCENES.push(o); }
