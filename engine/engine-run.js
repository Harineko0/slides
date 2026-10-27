'use strict';
/* =========================================================================
 * engine-run.js — 遷移（宣言的な状態間のモーフィング）、パーティクル、カメラ、
 * 背景、入力、発表者ウィンドウ、メインループ
 * ========================================================================= */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPEED = REDUCED ? 0.45 : 1;

/* ---------- DOM（index.html に無ければ作る） ---------- */
const HELP_HTML = [
  ['→ / Space / クリック', '次へ'], ['← / Shift+クリック', '戻る'], ['N', 'スピーカーノート'], ['P', '発表者ウィンドウ'],
  ['F', 'フルスクリーン'], ['Home / End', '最初 / 最後'], ['?', 'このヘルプ'],
].map(([k, v]) => `<b>${k}</b> ${v}`).join('<br>');
function ensureEl(id, tag, html = '') {
  let el = document.getElementById(id);
  if (!el) { el = document.createElement(tag); el.id = id; el.innerHTML = html; document.body.appendChild(el); }
  return el;
}
const cv = ensureEl('stage', 'canvas');
if (!cv.hasAttribute('aria-label')) cv.setAttribute('aria-label', document.title);
const notesEl = ensureEl('notes', 'div', '<div class="meta"><span id="notes-title"></span><span id="notes-next"></span></div><div id="notes-body"></div>');
const helpEl = ensureEl('help', 'div', HELP_HTML);
const ctx = cv.getContext('2d');
let dpr = 1, vw = 0, vh = 0, sc = 1, ox = 0, oy = 0, vignette = null;

function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  vw = innerWidth; vh = innerHeight;
  cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
  sc = Math.min(vw / W, vh / H); ox = (vw - W * sc) / 2; oy = (vh - H * sc) / 2;
  vignette = document.createElement('canvas');
  vignette.width = cv.width; vignette.height = cv.height;
  const g = vignette.getContext('2d');
  const R = Math.hypot(cv.width, cv.height) / 2;
  const grad = g.createRadialGradient(cv.width * 0.5, cv.height * 0.45, R * 0.1, cv.width * 0.5, cv.height * 0.5, R);
  grad.addColorStop(0, 'rgba(255,255,255,0.75)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(40,52,80,0.08)');
  g.fillStyle = grad; g.fillRect(0, 0, cv.width, cv.height);
}
addEventListener('resize', resize);
resize();

/* ---------- actors / transitions ---------- */
const NUM_SET = new Set(NUM_KEYS), COLOR_SET = new Set(COLOR_KEYS);
const live = new Map();
let order = [], idx = -1, clock = 0;

function resolveRel(o, base) {
  if (o.dx != null) { o.x = (base.x || 0) + o.dx; delete o.dx; }
  if (o.dy != null) { o.y = (base.y || 0) + o.dy; delete o.dy; }
  if (o.ds != null) { o.s = (base.s ?? 1) * o.ds; delete o.ds; }
  return o;
}

function buildScene(n) {
  return SCENES[n].A().flat(Infinity).filter(Boolean).map(withDefaults);
}

function goTo(n, instant = false) {
  n = clamp(n, 0, SCENES.length - 1);
  if (n === idx && !instant) return;
  idx = n;
  const S = SCENES[n];
  const list = buildScene(n);
  const ids = new Set(list.map(a => a.id));
  const now = clock;
  let exits = 0;
  for (const [id, e] of live) {
    if (ids.has(id)) continue;
    if (instant) { live.delete(id); continue; }
    if (!e.exiting) {
      exits++;
      e.exiting = true;
      e.from = { ...e.cur };
      e.to = resolveRel({ ...e.cur, alpha: 0, ...(e.to.out || {}) }, e.cur);
      e.t0 = now; e.dur = (e.to.odur || 0.45) * SPEED; e.ease = EASE.out;
      e.prevText = null; e.prevSrc = null;
    }
  }
  const base = exits ? 0.3 : 0.05;
  for (const a of list) {
    let e = live.get(a.id);
    if (e && e.cur.type !== a.type) { live.delete(a.id); e = null; }
    if (instant) { live.set(a.id, { from: a, to: a, cur: { ...a }, t0: 0, dur: 0, ease: EASE.out }); continue; }
    if (e) {
      const from = { ...e.cur };
      e.exiting = false;
      e.from = from; e.to = a;
      e.t0 = now + (a.md || 0) * SPEED; e.dur = (a.mdur || 1.0) * SPEED; e.ease = EASE[a.mease || 'inout'];
      e.prevText = a.type === 'text' && from.text !== a.text ? from.text : null;
      e.prevSrc = a.type === 'image' && from.src !== a.src ? from.src : null;
    } else {
      const from = resolveRel({ ...a, ...IN_DEF[a.type], ...(a.in || {}) }, a);
      live.set(a.id, {
        from, to: a, cur: { ...from },
        t0: now + (base + (a.d || 0)) * SPEED, dur: (a.dur || DUR_DEF[a.type]) * SPEED, ease: EASE[a.ease || 'out'],
      });
    }
  }
  order = list.map(a => a.id);
  setCam(S.cam || { x: 960, y: 540, z: 1 }, instant);
  setParticles(S.P, instant);
  onStepChange();
}

function updateActors(now) {
  for (const [id, e] of live) {
    const p = e.dur <= 0 ? 1 : clamp((now - e.t0) / e.dur, 0, 1);
    const k = e.ease(p);
    const f = e.from, t = e.to, cur = e.cur;
    for (const key in t) {
      if (NUM_SET.has(key)) {
        const a = f[key], b = t[key];
        cur[key] = a == null || b == null ? b : a + (b - a) * k;
      } else if (COLOR_SET.has(key)) {
        cur[key] = k >= 1 ? t[key] : mixc(f[key], t[key], k);
      } else if (key === 'pts') {
        cur.pts = f.pts && f.pts !== t.pts && f.pts.length === t.pts.length && k < 1
          ? t.pts.map((q, i) => [lerp(f.pts[i][0], q[0], k), lerp(f.pts[i][1], q[1], k)])
          : t.pts;
      } else cur[key] = t[key];
    }
    cur._prev = e.prevText != null && k < 1 ? e.prevText : null;
    cur._prevSrc = e.prevSrc && k < 1 ? e.prevSrc : null;
    cur._xf = k;
    if (e.exiting && p >= 1) live.delete(id);
  }
}

function drawActors(now) {
  const world = [], hud = [];
  const seen = new Set(order);
  for (const [id, e] of live) if (!seen.has(id)) (e.cur.hud ? hud : world).push(e.cur);
  for (const id of order) { const e = live.get(id); if (e) (e.cur.hud ? hud : world).push(e.cur); }
  world.sort((a, b) => a.z - b.z);
  ctx.save();
  ctx.translate(960, 540); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
  for (const a of world) drawActor(ctx, a, now);
  ctx.restore();
  for (const a of hud) drawActor(ctx, a, now);
}

/* ---------- camera (van Wijk & Nuij の滑らかなズーム・パン) ---------- */
let cam = { x: 960, y: 540, z: 1 }, camAnim = null;
function zoomPath(a, b) {
  const rho = 1.4, w0 = W / a.z, w1 = W / b.z, dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, d1 = Math.sqrt(d2);
  if (d1 < 1e-3) {
    const S = Math.abs(Math.log(w1 / w0)) / rho;
    if (S < 1e-6) return { S: 0, at: () => ({ ...b }) };
    const k = w1 < w0 ? -1 : 1;
    return { S, at: e => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), z: W / (w0 * Math.exp(k * rho * e * S)) }) };
  }
  const b0 = (w1 * w1 - w0 * w0 + rho ** 4 * d2) / (2 * w0 * rho * rho * d1);
  const b1 = (w1 * w1 - w0 * w0 - rho ** 4 * d2) / (2 * w1 * rho * rho * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / rho, ch = Math.cosh(r0), shr = Math.sinh(r0);
  return {
    S,
    at: e => {
      const s = e * S, u = (w0 / (rho * rho * d1)) * (ch * Math.tanh(rho * s + r0) - shr);
      return { x: a.x + dx * u, y: a.y + dy * u, z: W / ((w0 * ch) / Math.cosh(rho * s + r0)) };
    },
  };
}
function setCam(target, instant) {
  if (instant) { cam = { ...target }; camAnim = null; return; }
  if (Math.abs(cam.x - target.x) < 0.5 && Math.abs(cam.y - target.y) < 0.5 && Math.abs(cam.z - target.z) < 1e-3 && !camAnim) return;
  const path = zoomPath(cam, target);
  camAnim = { path, target: { ...target }, t0: clock, dur: clamp(1.0 + path.S * 0.5, 1.1, 2.4) * SPEED };
}
function updateCam(now) {
  if (!camAnim) return;
  const p = clamp((now - camAnim.t0) / camAnim.dur, 0, 1);
  cam = camAnim.path.at(EASE.inout(p));
  if (p >= 1) { cam = { ...camAnim.target }; camAnim = null; }
}

/* ---------- particles ---------- */
const NP = 1100;
const px = new Float32Array(NP), py = new Float32Array(NP), vx = new Float32Array(NP), vy = new Float32Array(NP);
const pcr = new Float32Array(NP), pcg = new Float32Array(NP), pcb = new Float32Array(NP), pa = new Float32Array(NP), ps = new Float32Array(NP);
const kk = new Float32Array(NP), pDelay = new Float32Array(NP), perm = new Uint16Array(NP);
const txA = new Float32Array(NP), tyA = new Float32Array(NP), txB = new Float32Array(NP), tyB = new Float32Array(NP);
for (let i = 0; i < NP; i++) {
  px[i] = hash(i * 1.3) * W; py[i] = hash(i * 2.1) * H; kk[i] = 16 + 26 * hash(i * 5.7);
  pcr[i] = 92; pcg[i] = 200; pcb[i] = 255; ps[i] = 1.5; perm[i] = i;
}
for (let i = NP - 1; i > 0; i--) { const j = Math.floor(hash(i * 9.13) * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
let PA = null, PB = null, pT0 = -10;

function compileP(spec) {
  const parts = !spec ? [pAmbient()] : Array.isArray(spec) ? spec : spec.parts;
  const frame = spec && !Array.isArray(spec) ? spec.frame : null;
  const sum = parts.reduce((s, p) => s + p.weight, 0);
  const cr = new Float32Array(NP), cg = new Float32Array(NP), cb = new Float32Array(NP), al = new Float32Array(NP), sz = new Float32Array(NP);
  const built = [];
  let off = 0;
  parts.forEach(p => {
    const n = Math.round((NP * p.weight) / Math.max(1, sum));
    const count = Math.min(n, NP - off);
    if (count <= 0) return;
    const b = p.build(count);
    for (let k = 0; k < count; k++) {
      const c = rgb(b.col(k)); cr[off + k] = c[0]; cg[off + k] = c[1]; cb[off + k] = c[2];
      al[off + k] = b.alpha(k); sz[off + k] = b.size(k);
    }
    built.push({ b, off, count });
    off += count;
  });
  const hidden = off;
  return {
    cr, cg, cb, al, sz,
    fill(t, tx, ty) {
      for (const e of built) e.b.fill(t, tx, ty, e.off);
      for (let k = hidden; k < NP; k++) { tx[k] = NaN; ty[k] = NaN; }
      if (frame) for (let k = 0; k < hidden; k++) { tx[k] = frame.x + (tx[k] - 960) / frame.z; ty[k] = frame.y + (ty[k] - 540) / frame.z; }
    },
  };
}
function setParticles(spec, instant) {
  PA = PB; PB = compileP(spec); pT0 = clock;
  for (let i = 0; i < NP; i++) pDelay[i] = hash(i * 3.3 + idx) * 0.45 * SPEED;
  if (instant || !PA) {
    PB.fill(clock, txB, tyB);
    for (let i = 0; i < NP; i++) {
      const j = perm[i];
      if (instant && !isNaN(txB[j])) { px[i] = txB[j]; py[i] = tyB[j]; }
      if (instant) { pcr[i] = PB.cr[j]; pcg[i] = PB.cg[j]; pcb[i] = PB.cb[j]; pa[i] = PB.al[j]; ps[i] = PB.sz[j]; }
    }
    PA = null;
  }
}
function stepParticles(now, dt) {
  const trans = PA && now < pT0 + 0.5 * SPEED;
  if (trans) PA.fill(now, txA, tyA);
  PB.fill(now, txB, tyB);
  const sub = dt > 1 / 50 ? 2 : 1, h = dt / sub, cr = Math.min(1, dt * 3.2);
  for (let i = 0; i < NP; i++) {
    const useB = !trans || now >= pT0 + pDelay[i];
    const S = useB ? PB : PA, j = perm[i];
    let tx = useB ? txB[j] : txA[j], ty = useB ? tyB[j] : tyA[j];
    let targetA = S.al[j];
    if (isNaN(tx)) { tx = px[i]; ty = py[i]; targetA = 0; }
    const k = kk[i] * (REDUCED ? 2 : 1), c = 2 * Math.sqrt(k) * 0.74;
    for (let s = 0; s < sub; s++) {
      vx[i] += ((tx - px[i]) * k - vx[i] * c) * h; vy[i] += ((ty - py[i]) * k - vy[i] * c) * h;
      px[i] += vx[i] * h; py[i] += vy[i] * h;
    }
    pcr[i] += (S.cr[j] - pcr[i]) * cr; pcg[i] += (S.cg[j] - pcg[i]) * cr; pcb[i] += (S.cb[j] - pcb[i]) * cr;
    pa[i] += (targetA - pa[i]) * cr; ps[i] += (S.sz[j] - ps[i]) * cr;
  }
}
function drawParticles() {
  const x0 = -ox / sc - 20, x1 = (vw - ox) / sc + 20, y0 = -oy / sc - 20, y1 = (vh - oy) / sc + 20;
  for (let i = 0; i < NP; i++) {
    const a = pa[i];
    if (a < 0.01) continue;
    const sx = (px[i] - cam.x) * cam.z + 960, sy = (py[i] - cam.y) * cam.z + 540;
    if (sx < x0 || sx > x1 || sy < y0 || sy > y1) continue;
    const r = ps[i] * 1.15, col = `${pcr[i] | 0},${pcg[i] | 0},${pcb[i] | 0}`;
    ctx.fillStyle = `rgba(${col},${a * 0.1})`;
    ctx.beginPath(); ctx.arc(sx, sy, r * 3.2, 0, 6.2832); ctx.fill();
    ctx.fillStyle = `rgba(${col},${a})`;
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, 6.2832); ctx.fill();
  }
}

/* ---------- background grid ---------- */
function drawDots(sp, alpha, r) {
  const x0 = -ox / sc, x1 = (vw - ox) / sc, y0 = -oy / sc, y1 = (vh - oy) / sc;
  const wx0 = cam.x + (x0 - 960) / cam.z, wx1 = cam.x + (x1 - 960) / cam.z;
  const wy0 = cam.y + (y0 - 540) / cam.z, wy1 = cam.y + (y1 - 540) / cam.z;
  ctx.fillStyle = rgba(COL.ink2, alpha);
  for (let gx = Math.floor(wx0 / sp) * sp; gx <= wx1; gx += sp) {
    const sx = (gx - cam.x) * cam.z + 960;
    for (let gy = Math.floor(wy0 / sp) * sp; gy <= wy1; gy += sp) {
      ctx.fillRect(sx - r / 2, (gy - cam.y) * cam.z + 540 - r / 2, r, r);
    }
  }
}
function drawGrid() {
  let sp = 60;
  while (sp * cam.z < 34) sp *= 4;
  while (sp * cam.z >= 136) sp /= 4;
  const t = Math.log((sp * cam.z) / 34) / Math.log(4);
  drawDots(sp, 0.03 + 0.06 * t, 1.6);
  drawDots(sp * 4, 0.1, 2.2);
}

/* ---------- notes / presenter ---------- */
let pres = null, presT0 = performance.now();
const PRES_HTML = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>発表者ビュー</title><style>
body{margin:0;background:${COL.bg};color:${COL.ink};font:18px/1.8 "Noto Sans JP","Hiragino Sans",sans-serif;display:grid;grid-template-rows:auto 1fr auto;height:100vh}
header,footer{display:flex;justify-content:space-between;align-items:center;padding:14px 22px;border-bottom:1px solid ${COL.line};font:14px ${FM};color:${COL.ink2}}
footer{border-top:1px solid ${COL.line};border-bottom:0}
main{padding:22px 28px;overflow:auto}
h1{font-size:24px;margin:0 0 14px;line-height:1.5}
#timer{font-size:28px;color:${COL.cool}}
button{background:${COL.panel};color:${COL.ink};border:1px solid ${COL.line};border-radius:8px;padding:6px 12px;font:inherit;cursor:pointer}
#notes{font-size:22px;line-height:1.9;white-space:pre-wrap}
</style></head><body><header><span id="idx"></span><span id="timer">0:00</span><button id="reset">タイマー リセット</button></header>
<main><h1 id="cur"></h1><div id="notes"></div></main><footer><span>次へ →</span><span id="next"></span></footer></body></html>`;
function openPresenter() {
  pres = window.open('', 'engine-presenter', 'width=1000,height=720');
  if (!pres) { notesEl.classList.add('on'); return; } // ポップアップがブロックされたらインラインのノートで代替
  pres.document.open(); pres.document.write(PRES_HTML); pres.document.close();
  pres.document.addEventListener('keydown', onKey);
  pres.document.getElementById('reset').onclick = () => { presT0 = performance.now(); };
  presT0 = performance.now();
  onStepChange();
}
function onStepChange() {
  const S = SCENES[idx], N = SCENES[idx + 1];
  document.getElementById('notes-title').textContent = `${idx + 1}/${SCENES.length}  ${S.title}`;
  document.getElementById('notes-next').textContent = N ? `次: ${N.title}` : '（最後）';
  document.getElementById('notes-body').textContent = S.notes || '';
  if (pres && !pres.closed) {
    const d = pres.document;
    d.getElementById('idx').textContent = [`${idx + 1} / ${SCENES.length}`, CHAPTERS[S.ch]].filter(Boolean).join('  ·  ');
    d.getElementById('cur').textContent = S.title;
    d.getElementById('notes').textContent = S.notes || '（ノートなし）';
    d.getElementById('next').textContent = N ? N.title : '（最後）';
  }
  history.replaceState(null, '', '#' + (idx + 1));
}
function tickPresenter() {
  if (!pres || pres.closed) return;
  const s = Math.floor((performance.now() - presT0) / 1000);
  const el = pres.document.getElementById('timer');
  if (el) el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/* ---------- input ---------- */
function onKey(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); goTo(idx + 1); }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); goTo(idx - 1); }
  else if (k === 'Home') goTo(0);
  else if (k === 'End') goTo(SCENES.length - 1);
  else if (k === 'n' || k === 'N') notesEl.classList.toggle('on');
  else if (k === 'p' || k === 'P') openPresenter();
  else if (k === '?') helpEl.classList.toggle('on');
  else if (k === 'f' || k === 'F') {
    if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.();
  }
}
addEventListener('keydown', onKey);
cv.addEventListener('click', e => goTo(idx + (e.shiftKey ? -1 : 1)));
cv.addEventListener('contextmenu', e => { e.preventDefault(); goTo(idx - 1); });
let touchX = null;
cv.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
cv.addEventListener('touchend', e => {
  if (touchX == null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) { e.preventDefault(); goTo(idx + (dx < 0 ? 1 : -1)); }
  touchX = null;
});
let pointerTimer = 0;
addEventListener('mousemove', () => {
  document.body.classList.add('pointer');
  clearTimeout(pointerTimer);
  pointerTimer = setTimeout(() => document.body.classList.remove('pointer'), 1800);
});
addEventListener('hashchange', () => {
  const n = parseInt(location.hash.slice(1), 10);
  if (n && n - 1 !== idx) goTo(n - 1);
});

/* ---------- main loop ---------- */
let last = performance.now(), lastTick = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000);
  last = ts;
  clock += dt;
  updateCam(clock);
  updateActors(clock);
  stepParticles(clock, dt);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.drawImage(vignette, 0, 0);
  ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
  drawGrid();
  drawParticles();
  drawActors(clock);

  if (ts - lastTick > 500) { tickPresenter(); lastTick = ts; }
  requestAnimationFrame(frame);
}

/* ---------- boot: シーン中の全テキストでフォントを先読み ---------- */
(async function boot() {
  const text = [...new Set(SCENES.flatMap(s => s.A().flat(Infinity).map(a => (a && a.text) || '')).join('') + 'AaBb?？0123456789{}')].join('');
  // THEME.fonts は index.html の Google Fonts の指定と揃える（既定は Inter + JetBrains Mono）
  const fonts = [['Noto Sans JP', [400, 500, 700, 900]], ...(THEME.fonts || [['Inter', [400, 500, 700, 800]], ['JetBrains Mono', [400, 700]]])];
  const loads = [];
  for (const [fam, ws] of fonts) for (const w of ws) loads.push(document.fonts.load(`${w} 40px "${fam}"`, text));
  ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
  ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = COL.ink3; ctx.font = `500 18px ${FM}`; ctx.textAlign = 'center';
  ctx.fillText('loading…', 960, 540);
  await Promise.race([Promise.allSettled(loads), new Promise(r => setTimeout(r, 3500))]);
  clearTextCaches();
  document.fonts.addEventListener('loadingdone', clearTextCaches);
  const start = parseInt(location.hash.slice(1), 10);
  goTo(start ? start - 1 : 0, !!start);
  requestAnimationFrame(ts => { last = ts; frame(ts); });
})();
