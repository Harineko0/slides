'use strict';
/* =========================================================================
 * scenes-axes.js — 3つの軸の詳細（柱のカードの中身）
 * CONTENT.<k>(stage) はフレーム内（1920x1080）の座標で組む。全体像では 1/4 に縮小され、
 * ズームイン中は stage を進めると同じカードの中で次の内容へモーフィングする。
 * ========================================================================= */
const zk = (id, t, color) => T(id, t, { x: 60, y: 34, size: 28, font: 'mono', weight: 700, color });
const zh = (id, t) => T(id, t, { x: 60, y: 74, size: 60, weight: 800 });
const lab = (id, t, x, y, o = {}) => T(id, t, { x, y, size: 28, font: 'mono', weight: 700, color: ink3, ...o });
const arrow = (id, x0, y0, x1, y1, o = {}) => L(id, [[x0, y0], [x1, y1]], { color: ink, lw: 3, head: 14, ...o });
// 横に並ぶピル（文字幅で詰める）
function pillRow(id, items, x, y, o = {}, to = {}) {
  const size = to.size || 30, gap = o.gap || 12;
  return items.map((t, i) => {
    const w = tw(t, size, to.weight || 700, to.font) + size * 1.4;
    const el = card(id + i, { x, y, w, h: Math.round(size * 2), r: size, fill: panel, stroke: ink, lw: 2, ...o, d: (o.d || 0) + i * 0.08 }, t, { size, weight: 700, ...to });
    x += w + gap;
    return el;
  });
}

/* ---------- 軸①: 認証認可基盤 ---------- */
const HUB = { x: 1260, y: 430, r: 115 };
const RPS = ['tinyurl', 'wiki', 'img', 'scheduler', 'sns', 'pay', 'mc', 'screen', '…'];
const rpY = k => 166 + k * 62;
const RP_PATHS = RPS.map((_, k) => bez([HUB.x + HUB.r, HUB.y], [HUB.x + 220, HUB.y], [1500, rpY(k) + 27], [1610, rpY(k) + 27], 20));
const IDP = [
  'Cloudflare 公式 `workers-oauth-provider`',
  'Google ログイン ＋ D1・KV',
  'OIDC 準拠、20近いアプリが RP',
  'チャプターとメンバーシップを一元管理',
];
const ROUTES = ['サインイン', 'コールバック', 'サインアウト', 'ログイン中ユーザー'];
CONTENT.auth = stage => {
  const out = [
    zk('za-k', 'AXIS ①  AUTH', blueInk),
    zh('za-h', stage < 3 ? '軸①: 認証認可基盤 `accounts.gdgs.jp`' : '本当のうれしさ ＝「数行で書ける権限管理」'),
  ];
  if (stage < 3) {
    out.push(
      lab('za-l0', 'きっかけ', 60, 172),
      T('za-why', '2つ目のアプリ（`tinyurl`）でも\nログインが必要になった', { x: 60, y: 210, size: 46, weight: 800, lh: 1.4, d: 0.2 }),
      lab('za-l1', 'IdP の構成', 60, 380, { d: 0.4 }),
      IDP.map((t, i) => dot('za-b' + i, 60, 420 + i * 68, t, { size: 40, maxW: 1000, d: 0.5 + i * 0.12, dot: cool })),
      RPS.map((t, k) => [
        L('za-rl' + k, RP_PATHS[k], { color: ink3, lw: 2, d: 0.6 + k * 0.05 }),
        card('za-rp' + k, { x: 1610, y: rpY(k), w: 250, h: 54, r: 27, fill: t === '…' ? panel2 : panel, stroke: t === '…' ? line : ink, lw: 2, d: 0.7 + k * 0.05 }, t, { size: 28, font: 'mono', weight: 500 }),
      ]),
      T('za-oidc', 'OIDC', { x: 1480, y: 146, size: 32, font: 'mono', weight: 700, color: blueInk, d: 0.8 }),
      C('za-hub', { x: HUB.x, y: HUB.y, r: HUB.r, fill: pBlue, stroke: ink, lw: 3, d: 0.3 }),
      I('za-hub-i', 'lock', { x: HUB.x, y: HUB.y - 50, size: 44, color: ink, d: 0.35 }),
      T('za-hub-t', 'accounts', { x: HUB.x, y: HUB.y - 14, size: 38, weight: 800, align: 'center', d: 0.35 }),
      T('za-hub-s', 'IdP', { x: HUB.x, y: HUB.y + 40, size: 28, font: 'mono', align: 'center', color: ink2, d: 0.35 }),
    );
  }
  if (stage === 2) {
    out.push(
      B('za-code', { x: 60, y: 716, w: 1800, h: 330, r: 22, fill: COL.code, stroke: ink, lw: 2.5, d: 0.1 }),
      lab('za-cl', '新規アプリ側でやること', 100, 738, { color: blueInk, d: 0.2 }),
      CODE('za-c', [[['initializeRpAuth', blueInk], ['(...)', ink2]]], { x: 100, y: 786, size: 56, weight: 700, in: { reveal: 0 }, dur: 0.9, ease: 'linear', d: 0.4, noMini: 1 }),
      T('za-c2', 'を呼ぶだけ', { x: 100, y: 882, size: 44, weight: 800, d: 1.2 }),
      arrow('za-ca', 800, 850, 880, 850, { d: 1.3 }),
      lab('za-rt', 'ルートが自動で揃う', 900, 738, { d: 1.3 }),
      ROUTES.map((t, i) => card('za-r' + i, { x: 900 + (i % 2) * 470, y: 782 + Math.floor(i / 2) * 88, w: 450, h: 74, r: 37, fill: pBlue, stroke: ink, lw: 2, d: 1.4 + i * 0.15, in: { alpha: 0, s: 0.5 } }, t, { size: 34 })),
      iconLine('za-ck', 'shield', greenInk, 100, 970, 'セッションは署名 Cookie → DB にセッションテーブルすら不要', { size: 36, maxW: 1700, d: 2.1, weight: 700 }),
    );
  }
  if (stage === 3) {
    const ADM = ['mc', 'screen', 'ost', 'roster'];
    out.push(
      T('zp-lead', '「運営メンバーだけが管理画面に入れる」を、アプリ側の[[blueInk!:数行]]で', { x: 60, y: 168, size: 44, weight: 800, maxW: 1800, d: 0.2 }),
      C('zp-u', { x: 112, y: 350, r: 50, fill: pRed, stroke: ink, lw: 2.5, d: 0.3 }),
      I('zp-ui', 'user', { x: 112, y: 350, size: 50, color: ink, d: 0.3 }),
      T('zp-ut', 'ユーザー', { x: 112, y: 412, size: 28, weight: 700, align: 'center', color: ink2, d: 0.3 }),
      arrow('zp-a0', 172, 350, 236, 350, { d: 0.4 }),
      card('zp-acc', { x: 246, y: 280, w: 380, h: 140, r: 22, fill: pBlue, stroke: ink, lw: 2.5, d: 0.45 }, 'accounts\n[[ink2:チャプター × メンバー]]', { size: 34, lh: 1.4 }),
      arrow('zp-a1', 636, 350, 692, 350, { d: 0.55 }),
      C('zp-g', { x: 752, y: 350, r: 56, fill: pGreen, stroke: ink, lw: 2.5, d: 0.6 }),
      I('zp-gi', 'shield', { x: 752, y: 350, size: 52, color: ink, d: 0.6 }),
      T('zp-gt', '運営だけ', { x: 752, y: 414, size: 28, align: 'center', color: greenInk, weight: 800, d: 0.6 }),
      arrow('zp-a2', 818, 350, 874, 350, { d: 0.7 }),
      lab('zp-adl', '管理画面', 890, 234, { d: 0.75 }),
      ADM.map((t, i) => card('zp-ad' + i, { x: 890 + (i % 2) * 166, y: 276 + Math.floor(i / 2) * 76, w: 154, h: 64, r: 32, fill: panel, stroke: ink, lw: 2, d: 0.8 + i * 0.08 }, t, { size: 30, font: 'mono', weight: 500 })),
      dot('zp-lc', 60, 470, '`live-checkin` は `gdg-kwansai` のメンバー限定', { size: 38, maxW: 1150, d: 1.1, dot: cool }),
      L('zp-pub', rp([[230, 650], [230, 600], [1010, 600], [1010, 650]], 18), { color: ink3, lw: 2.5, dash: 9, d: 1.3 }),
      T('zp-pubt', '公開 HTTPS', { x: 420, y: 556, size: 28, font: 'mono', weight: 700, color: ink3, d: 1.35 }),
      I('zp-pubx', 'x', { x: 700, y: 600, size: 40, color: red, lw: 4.5, d: 1.6, in: { alpha: 0, s: 2 } }),
      card('zp-w1', { x: 60, y: 650, w: 360, h: 96, r: 20, fill: panel, stroke: ink, lw: 2.5, d: 1.3 }, 'アプリの Worker', { size: 34 }),
      card('zp-w2', { x: 820, y: 650, w: 380, h: 96, r: 20, fill: pBlue, stroke: ink, lw: 2.5, d: 1.3 }, 'accounts の Worker', { size: 34 }),
      L('zp-sb', [[420, 698], [820, 698]], { color: green, lw: 6, d: 1.5 }),
      T('zp-sbt', 'Service Binding', { x: 620, y: 712, size: 30, font: 'mono', weight: 700, color: greenInk, align: 'center', d: 1.6 }),
      dot('zp-b0', 60, 810, 'Worker 間は Service Binding で直結 → [[greenInk!:高速・安全]]', { size: 40, d: 1.8 }),
      dot('zp-b1', 60, 900, '外部にも OIDC で公開（デモ用クライアント、`gdg` CLI のログイン）', { size: 40, d: 2.0 }),
      IMG('zp-img', IMGP('06-accounts-dashboard.jpg'), { x: 1260, y: 236, w: 600, h: 386, r: 18, d: 0.5 }),
      T('zp-imgc', 'accounts のダッシュボード', { x: 1260, y: 636, size: 28, color: ink3, d: 0.6 }),
    );
  }
  return out;
};
const NOTE7 = '1つ目の軸は認証認可基盤です。Cloudflare 公式の OAuth Provider ライブラリで OIDC の IdP を作りました。新しいアプリを作るときは、共通ライブラリの initializeRpAuth という関数を1つ呼ぶだけで、ログインまわりのルートがすべて生えます。セッションも署名付き Cookie で扱うので、DB にセッションテーブルを作る必要すらありません。';
const NOTE8 = '認証基盤を作って一番うれしかったのは、ログインそのものよりも「権限管理」です。どのユーザーがどのチャプターの運営メンバーかを accounts で一元管理しているので、「関西チャプターの運営だけが入れる管理画面」が数行で書けます。Worker 同士は Cloudflare の Service Binding で直接つながるので、公開ネットワークを経由することもありません。';
const ZMAP = { apps: 4, pil: ['on', 'on', 'on'] };
const focusMap = (i, stage) => map({ ...ZMAP, pil: ZMAP.pil.map((s, j) => (j === i ? 'focus' : s)), stage });
scene({
  ch: 3, title: '軸①: 認証認可基盤 accounts.gdgs.jp', notes: NOTE7, cam: pilFrame(0),
  P: { frame: pilFrame(0), parts: [pFlow({ paths: RP_PATHS, speed: 220, col: cool, spread: 4, weight: 0.5 }), pAmbient({ weight: 0.35, alpha: 0.2 })] },
  A: () => focusMap(0, 1),
});
scene({
  ch: 3, title: '軸①: initializeRpAuth(...) を呼ぶだけ', notes: NOTE7, cam: pilFrame(0),
  P: { frame: pilFrame(0), parts: [pFlow({ paths: RP_PATHS, speed: 220, col: cool, spread: 4, weight: 0.4 }), pAmbient({ weight: 0.35, alpha: 0.2, y: 700, h: 340 })] },
  A: () => focusMap(0, 2),
});
scene({
  ch: 3, title: '軸①: 数行で書ける権限管理', notes: NOTE8, cam: pilFrame(0),
  P: { frame: pilFrame(0), parts: [pFlow({ paths: [[[172, 350], [874, 350]], [[420, 698], [820, 698]]], speed: 200, col: (u, j) => (j ? green : cool), spread: 5, weight: 0.5 }), pAmbient({ weight: 0.3, alpha: 0.2 })] },
  A: () => focusMap(0, 3),
});

/* ---------- 軸②: デザインシステム ---------- */
// きっかけの「バラバラな3アプリ」。stage 2 で同じ見た目に揃う（同じ id のままモーフィング）
function mock(i, unified) {
  const x = unified ? 60 + i * 196 : 60 + i * 400, y = unified ? 180 : 200, w = unified ? 180 : 360, h = unified ? 190 : 400, k = w / 360;
  const v = k => (unified ? 0 : k);
  const dark = !unified && i === 2;
  const btnW = unified ? 140 : [140, 172, 312][i], btnH = unified ? 48 : [52, 40, 64][i], btnX = unified ? 24 : [24, 164, 24][i], btnR = unified ? 24 : [26, 4, 12][i];
  const j = unified ? 0 : 1.5;
  return [
    B('zd-m' + i, { x, y, w, h, r: unified ? 16 : [12, 2, 30][i], fill: dark ? '#2b2b2b' : panel, stroke: ink, lw: 2.5, rot: unified ? 0 : [-0.02, 0.015, -0.01][i], d: 0.2 + i * 0.12, jit: j }),
    B('zd-m' + i + 'h', { x: x + 24 * k, y: y + 24 * k, w: 180 * k, h: 26 * k, r: 6 * k, fill: dark ? '#6b6b6b' : ink3, d: 0.3 + i * 0.12, jit: j }),
    B('zd-m' + i + 'in', { x: x + 24 * k, y: y + (96 + v([0, 18, -8][i])) * k, w: 312 * k, h: 56 * k, r: (unified ? 12 : [8, 0, 28][i]) * k, fill: dark ? '#3a3a3a' : null, stroke: ink3, lw: 2, d: 0.35 + i * 0.12, jit: j }),
    B('zd-m' + i + 'b', { x: x + btnX * k, y: y + (190 + v([0, 14, 34][i])) * k, w: btnW * k, h: btnH * k, r: btnR * k, fill: unified ? cool : [cool, green, red][i], d: 0.4 + i * 0.12, jit: j }),
    [0, 1, 2].map(r => B('zd-m' + i + 'l' + r, { x: x + 24 * k, y: y + (290 + r * (unified ? 30 : [26, 34, 22][i])) * k, w: (260 - r * 50) * k, h: 12 * k, r: 6 * k, fill: dark ? '#555555' : line, d: 0.45 + i * 0.12, jit: j })),
  ];
}
const TECH = ['React 19', 'Radix', 'CSS トークン', 'Light / Dark'];
const COMPS = ['AppShell', 'FormField', 'DataTable', '…'];
const TESTS = ['公開 API', 'SSR', 'コントラスト', 'axe', '画像比較'];
const BAD = [
  [['import', SYN.key], [' { Trash } ', ink], ['from', SYN.key], [' "lucide-react"', SYN.str], [';', ink3]],
  [['import', SYN.key], [' { Dialog } ', ink], ['from', SYN.key], [' "radix-ui"', SYN.str], [';', ink3]],
  [],
  [['<button style={{ color: ', ink], ['"#3b82f6"', SYN.str], [' }}>', ink]],
  [['  <Trash /> 削除', ink]],
  [['</button>', ink]],
];
const BAD_ROWS = [0, 1, 3];
const CODE_Y = 310, CODE_LH = 30 * 1.75;
CONTENT.ds = stage => {
  const out = [
    zk('zd-k', 'AXIS ②  DESIGN SYSTEM', yellowInk),
    zh('zd-h', stage < 3 ? '軸②: デザインシステム' : 'デザインシステムを「守らせる」仕組み'),
  ];
  if (stage === 1) {
    out.push(
      lab('zd-l0', 'きっかけ（アプリが10個を超えたころ）', 60, 160),
      [0, 1, 2].map(i => [mock(i, false), T('zd-m' + i + 'n', 'アプリ ' + 'ABC'[i], { x: 240 + i * 400, y: 618, size: 30, font: 'mono', color: ink2, align: 'center', d: 0.5 })]),
      B('zd-pr', { x: 1290, y: 200, w: 570, h: 460, r: 24, fill: panel, stroke: ink3, lw: 2, dash: 10, d: 0.8 }),
      lab('zd-prl', 'AI への指示（毎回）', 1322, 222, { d: 0.85 }),
      T('zd-prt', '余白はこのくらいで、\nボタンはこの色と角丸で、\nダークモードでは…\n入力欄のラベルは…\nそれから…', { x: 1322, y: 280, size: 36, weight: 600, color: ink2, lh: 1.6, in: { reveal: 0 }, dur: 2.2, ease: 'linear', d: 1.0 }),
      dot('zd-b0', 60, 730, 'アプリごとに余白・ボタン・ダークモードが[[redInk!:微妙に違う]]', { size: 44, d: 1.4 }),
      dot('zd-b1', 60, 830, 'そろえるために、[[redInk!:毎回 AI に長いプロンプト]]を書くのがつらい', { size: 44, d: 1.6 }),
    );
  }
  if (stage === 2) {
    out.push(
      [0, 1, 2].map(i => mock(i, true)),
      T('zd-same', '→ どのアプリも同じ部品・同じトークン', { x: 60, y: 388, size: 36, weight: 800, d: 0.6 }),
      lab('zd-repo', '独立リポジトリ gdg-jp/design-system', 60, 470, { d: 0.7, color: yellowInk }),
      pillRow('zd-tech', TECH, 60, 512, { d: 0.8, fill: pYellow }),
      T('zd-n', '約{n}', { x: 56, y: 590, size: 140, weight: 900, num: 80, in: { alpha: 0, num: 0 }, dur: 1.6, d: 1.0 }),
      T('zd-nt', 'のコンポーネント', { x: 400, y: 678, size: 52, weight: 800, d: 1.1 }),
      pillRow('zd-cp', COMPS, 60, 818, { d: 1.3 }, { font: 'mono', size: 30 }),
      IMG('zd-cat', IMGP('08-design-system-catalog.jpg'), { x: 1060, y: 160, w: 380, h: 245, r: 14, d: 0.4 }),
      IMG('zd-adm', IMGP('08-design-system-admin-light.jpg'), { x: 1480, y: 160, w: 380, h: 245, r: 14, d: 0.5 }),
      T('zd-catc', 'Storybook のカタログ', { x: 1060, y: 414, size: 26, color: ink3, d: 0.5 }),
      T('zd-admc', '管理画面のサンプル', { x: 1480, y: 414, size: 26, color: ink3, d: 0.6 }),
      B('zd-md', { x: 1060, y: 478, w: 800, h: 290, r: 22, fill: pYellow, stroke: ink, lw: 2.5, d: 1.2 }),
      T('zd-mdt', '`DESIGN.md`', { x: 1096, y: 502, size: 50, weight: 800, d: 1.3 }),
      T('zd-mdd', 'トークンと設計判断の正本', { x: 1096, y: 584, size: 42, weight: 800, d: 1.35 }),
      I('zd-mdu', 'user', { x: 1122, y: 700, size: 44, color: ink, d: 1.5 }),
      I('zd-mdb', 'bot', { x: 1182, y: 700, size: 44, color: ink, d: 1.6 }),
      T('zd-mdr', '人間だけでなく [[blueInk!:AI も読む]]', { x: 1226, y: 674, size: 40, weight: 800, d: 1.6 }),
      lab('zd-tl', 'テスト', 1060, 792, { d: 1.7 }),
      pillRow('zd-ts', TESTS, 1060, 834, { d: 1.8, gap: 10 }, { size: 28 }),
      T('zd-foot', 'AI エージェントも `DESIGN.md` を読んで画面を組み立てる', { x: 60, y: 948, size: 44, weight: 800, d: 2.2 }),
    );
  }
  if (stage === 3) {
    out.push(
      T('zg-lead', '作って終わりではなく、[[redInk!:AI が規約を破れない仕組み]]とセットで', { x: 60, y: 164, size: 44, weight: 800, d: 0.2 }),
      B('zg-ed', { x: 60, y: 240, w: 980, h: 410, r: 20, fill: COL.code, stroke: ink, lw: 2.5, d: 0.3 }),
      lab('zg-edl', 'AI が書いたコード（例）', 96, 258, { d: 0.3 }),
      BAD_ROWS.map((row, k) => [
        B('zg-hl' + k, { x: 74, y: CODE_Y + row * CODE_LH, w: 952, h: CODE_LH, r: 4, fill: red, fillA: 0.14, d: 1.4 + k * 0.25, in: { alpha: 0, reveal: 0 } }),
        B('zg-hb' + k, { x: 74, y: CODE_Y + row * CODE_LH, w: 5, h: CODE_LH, r: 0, fill: red, d: 1.4 + k * 0.25 }),
      ]),
      CODE('zg-code', BAD, { x: 96, y: CODE_Y, size: 30, lh: 1.75, d: 0.4 }),
      B('zg-scan', { x: 70, y: 636, w: 960, h: 5, r: 2, fill: green, alpha: 0, in: { y: 300, alpha: 1 }, dur: 1.3, d: 0.6, ease: 'inout', noMini: 1 }),
      B('zg-out', { x: 1080, y: 240, w: 780, h: 410, r: 20, fill: panel, stroke: ink, lw: 2.5, d: 0.4 }),
      lab('zg-outl', 'UI 規約チェッカー', 1112, 258, { d: 0.4 }),
      [['legacy-import', 'アイコン等の直接 import'], ['literal-color', '色コードのベタ書き']].map(([id, desc], k) => [
        I('zg-x' + k, 'x', { x: 1134, y: 336 + k * 116, size: 40, color: red, lw: 4.5, d: 1.5 + k * 0.3, in: { alpha: 0, s: 2 } }),
        T('zg-r' + k, id, { x: 1172, y: 310 + k * 116, size: 38, font: 'mono', weight: 700, color: redInk, d: 1.5 + k * 0.3 }),
        T('zg-rd' + k, desc, { x: 1172, y: 362 + k * 116, size: 30, weight: 600, color: ink2, d: 1.55 + k * 0.3 }),
      ]),
      T('zg-more', '`semantic-color` `button-full-width` …', { x: 1112, y: 526, size: 28, color: ink2, d: 1.9 }),
      card('zg-fail', { x: 1500, y: 580, w: 330, h: 54, r: 27, fill: pRed, stroke: red, lw: 2.5, d: 2.2, in: { alpha: 0, s: 1.6 } }, '違反 → CI が落ちる', { size: 30, color: redInk }),
      dot('zg-b0', 60, 690, '例外を作るときは、コード上に理由（`rationale`）が必須', { size: 40, d: 2.4 }),
      dot('zg-b1', 60, 776, '`gdg-design` skill がロゴ・色・タイポの使い方を AI に教える', { size: 40, d: 2.6 }),
      T('zg-eff', '→ 注文しなくても、[[greenInk!:最初から GDG らしい画面]]が出てくる', { x: 60, y: 890, size: 52, weight: 900, maxW: 1800, d: 2.9 }),
    );
  }
  return out;
};
const NOTE9 = '2つ目の軸はデザインシステムです。アプリが10個を超えたころ、アプリごとに見た目が微妙にズレてしまい、それを直すために毎回長いプロンプトを書くのに疲れ果てて作りました。約80個のコンポーネントと、設計判断を言語化した DESIGN.md を用意していて、AI エージェントもこの DESIGN.md を読んで画面を組み立てます。';
const NOTE10 = 'デザインシステムで重要なのは、作るだけでなく「守らせる仕組み」とセットにすることです。AI は放っておくと、勝手にアイコンライブラリを直接 import したり、カラーコードをベタ書きしたりします。そこで専用の UI 規約チェッカーを作り、違反したら CI を落とすようにしました。例外には理由の記述を必須にしています。これにより、プロンプトで細かく指示しなくても、最初から統一された GDG らしい画面が出てくるようになりました。';
scene({
  ch: 4, title: '軸②: きっかけ — 見た目のズレとプロンプト疲れ', notes: NOTE9, cam: pilFrame(1),
  P: { frame: pilFrame(1), parts: [pCloud({ x: 600, y: 420, rx: 600, ry: 240, col: u => GDG4[Math.floor(hash(u * 773) * 4)], swirl: 0.5, alpha: 0.35, size: 1.8, weight: 0.4 }), pAmbient({ weight: 0.2, alpha: 0.2 })] },
  A: () => focusMap(1, 1),
});
scene({
  ch: 4, title: '軸②: デザインシステムの中身', notes: NOTE9, cam: pilFrame(1),
  P: { frame: pilFrame(1), parts: [pGrid({ x: 60, y: 180, w: 572, h: 190, cols: 30, rows: 10, col: yellow, alpha: 0.5, size: 1.6, weight: 0.4 }), pAmbient({ weight: 0.4, alpha: 0.2 })] },
  A: () => focusMap(1, 2),
});
scene({
  ch: 4, title: '軸②: デザインシステムを「守らせる」仕組み', notes: NOTE10, cam: pilFrame(1),
  P: { frame: pilFrame(1), parts: [pRects({ rects: [{ x: 60, y: 240, w: 980, h: 410 }], speed: 200, col: green, size: 2, alpha: 0.7, weight: 0.4 }), pClusters({ list: [{ x: 1665, y: 607, r: 50, col: red, sq: 0.5 }], weight: 0.2, swirl: 1 }), pAmbient({ weight: 0.3, alpha: 0.2 })] },
  A: () => focusMap(1, 3),
});

/* ---------- 軸③: ハーネスエンジニアリング ---------- */
const CHECKS = [['Biome', 1], ['型検査', 1], ['Vitest', 1], ['ビルド', 1], ['E2E', 1], ['Go', 0]];
const ckY = k => 248 + k * 70;
const CK = { x: 1050, w: 300, h: 58 };
const HOOK = { x: 540, y: 330, w: 420, h: 280 };
const GATE = { x: 1520, y: 470 };
const CI_PATHS = [
  [[196, 470], [258, 470]], [[510, 470], [HOOK.x, 470]],
  ...CHECKS.filter(c => c[1]).map((_, k) => bez([HOOK.x + HOOK.w, 470], [1000, 470], [1000, ckY(k) + 29], [CK.x, ckY(k) + 29], 16)),
  ...CHECKS.filter(c => c[1]).map((_, k) => bez([CK.x + CK.w, ckY(k) + 29], [1410, ckY(k) + 29], [1410, GATE.y], [GATE.x - 60, GATE.y], 16)),
];
const TACTICS = [
  '型検査とビルドを1つの Turbo グラフにまとめる',
  '独立した E2E を最大4並列、ビルド済み Worker を再利用',
  'Vite 8 とネイティブ TypeScript 7（`tsgo`）へ',
  'テストだけ変えたら、関連テストと型検査だけ',
];
const SKILLS = [
  ['wayfinder', '大きな作業を「判断チケットの地図」にして1つずつ決める'],
  ['grilling', '実装前に、計画の穴を AI に質問攻めにしてもらう'],
  ['gdg-design', 'GDG ブランドに沿ったグラフィックや UI を作る'],
  ['gdg-wiki / gdg-img …', '内製したアプリ自体を `gdg` CLI 経由で AI が操作する'],
];
const skY = k => 236 + k * 116;
CONTENT.ci = stage => {
  const HEADS = ['', '軸③: ハーネス① ローカルの pre-commit CI', 'ハーネスが機能する条件 ＝「圧倒的な速さ」', 'ハーネスが機能する条件 ＝「圧倒的な速さ」', 'ハーネス②: Agent Skills と `AGENTS.md`'];
  const out = [zk('zc-k', 'AXIS ③  HARNESS', greenInk), zh('zc-h', HEADS[stage])];
  if (stage === 1) {
    let sel = 0;
    out.push(
      T('zc-lead', 'AI に高速で書かせるなら、[[greenInk!:「壊れたコードをコミットさせない」柵]]が要る', { x: 60, y: 164, size: 44, weight: 800, maxW: 1800, d: 0.2 }),
      C('zc-bot', { x: 128, y: 470, r: 64, fill: pBlue, stroke: ink, lw: 2.5, d: 0.3 }),
      I('zc-boti', 'bot', { x: 128, y: 468, size: 62, color: ink, d: 0.3 }),
      T('zc-bott', 'AI エージェント', { x: 128, y: 550, size: 28, weight: 700, align: 'center', color: ink2, d: 0.3 }),
      arrow('zc-a0', 196, 470, 250, 470, { d: 0.4 }),
      card('zc-git', { x: 258, y: 430, w: 252, h: 80, r: 40, fill: panel, stroke: ink, lw: 2.5, d: 0.45 }, 'git commit', { size: 34, font: 'mono' }),
      arrow('zc-a1', 510, 470, 534, 470, { d: 0.5 }),
      B('zc-hook', { ...HOOK, r: 24, fill: pGreen, stroke: ink, lw: 2.5, d: 0.55 }),
      T('zc-hookt', 'pre-commit フック', { x: HOOK.x + HOOK.w / 2, y: HOOK.y + 26, size: 40, weight: 800, align: 'center', d: 0.6 }),
      T('zc-hookc', 'pnpm ci:staged', { x: HOOK.x + HOOK.w / 2, y: HOOK.y + 96, size: 38, font: 'mono', weight: 700, align: 'center', color: greenInk, d: 0.65 }),
      T('zc-hookd', 'staged なファイルから\nチェックを動的に選ぶ', { x: HOOK.x + HOOK.w / 2, y: HOOK.y + 164, size: 32, weight: 600, lh: 1.4, align: 'center', color: ink2, d: 0.7 }),
      CHECKS.map(([t, on], k) => {
        const y = ckY(k), d = 0.9 + k * 0.1, path = on ? CI_PATHS[2 + sel] : bez([HOOK.x + HOOK.w, 470], [1000, 470], [1000, y + 29], [CK.x, y + 29], 16);
        const back = on ? CI_PATHS[2 + 5 + sel] : null;
        if (on) sel++;
        return [
          L('zc-cl' + k, path, { color: on ? ink : line, lw: 2.5, dash: on ? 0 : 7, d }),
          card('zc-ck' + k, { x: CK.x, y, w: CK.w, h: CK.h, r: 29, fill: on ? pGreen : panel, stroke: on ? ink : ink3, lw: 2, dash: on ? 0 : 7, d }, on ? t : t + '（スキップ）', { size: 32, color: on ? ink : ink3 }),
          back ? L('zc-cr' + k, back, { color: ink, lw: 2.5, d: d + 0.3 }) : null,
        ];
      }),
      C('zc-gate', { x: GATE.x, y: GATE.y, r: 58, fill: panel, stroke: ink, lw: 3, d: 1.6 }),
      I('zc-gatei', 'lock', { x: GATE.x, y: GATE.y, size: 50, color: ink, d: 1.6 }),
      card('zc-ok', { x: 1600, y: 380, w: 270, h: 72, r: 36, fill: pGreen, stroke: ink, lw: 2, d: 1.8 }, '✓ コミット', { size: 34, color: greenInk }),
      card('zc-ng', { x: 1600, y: 490, w: 270, h: 72, r: 36, fill: pRed, stroke: red, lw: 2, d: 1.9 }, '✗ 弾かれる', { size: 34, color: redInk }),
      dot('zc-b0', 60, 730, '変更したアプリの E2E だけ実行、共有コードを触ったら全件', { size: 40, d: 2.1 }),
      dot('zc-b1', 60, 820, 'コミットのたびに走る → [[redInk!:壊れたコードはコミットできない]]', { size: 40, d: 2.3 }),
      dot('zc-b2', 60, 910, '実行時間・キャッシュヒットを毎回 JSON に記録して計測', { size: 40, d: 2.5 }),
    );
  }
  if (stage === 2 || stage === 3) {
    const fast = stage === 3;
    out.push(
      T('zs-lead', '遅いと、人も AI も `--no-verify` でフックを飛ばしたくなる。', { x: 60, y: 164, size: 46, weight: 800, d: 0.2 }),
      T('zs-lead2', '飛ばされた瞬間、ハーネスとして[[redInk!:機能しなくなる]]。', { x: 60, y: 240, size: 46, weight: 800, color: ink2, d: 0.5 }),
      T('zs-l0', 'チューニング前', { x: 60, y: 348, size: 44, weight: 800, d: 0.7 }),
      B('zs-b0', { x: 440, y: 334, w: 1280, h: 90, r: 45, fill: red, stroke: ink, lw: 3, in: { w: 0 }, dur: 2.2, ease: 'inout', d: 0.8 }),
      T('zs-b0t', '3〜30分', { x: 1080, y: 344, size: 52, weight: 900, color: '#ffffff', align: 'center', d: 2.4 }),
      fast ? null : T('zs-nv', 'git commit ' + nolig('--no-verify'), { x: 1720, y: 456, size: 40, font: 'mono', weight: 700, color: redInk, align: 'right', jit: 3, d: 1.6 }),
      fast ? [
        T('zs-l1', 'チューニング後', { x: 60, y: 514, size: 44, weight: 800 }),
        B('zs-b1', { x: 440, y: 500, w: 160, h: 90, r: 45, fill: green, stroke: ink, lw: 3, in: { w: 1280, alpha: 1 }, dur: 1.8, ease: 'inout', d: 0.4 }),
        T('zs-b1t', '1秒〜1分', { x: 630, y: 506, size: 60, weight: 900, color: greenInk, d: 1.8, in: { alpha: 0, dx: 300 } }),
        lab('zs-tl', '1秒〜1分に縮めるためにやったこと', 60, 646, { d: 1.6 }),
        TACTICS.map((t, k) => card('zs-t' + k, { x: 60 + (k % 2) * 910, y: 690 + Math.floor(k / 2) * 166, w: 890, h: 148, r: 22, fill: panel, stroke: green, lw: 2.5, d: 1.8 + k * 0.15 }, t, { size: 38, weight: 800, maxW: 820, lh: 1.35 })),
      ] : null,
    );
  }
  if (stage === 4) {
    out.push(
      T('zk-lead', 'AI の「作業の進め方」と「作ったアプリの運用」も型化する', { x: 60, y: 164, size: 44, weight: 800, d: 0.2 }),
      SKILLS.map(([n, desc], k) => {
        const y = skY(k), d = 0.3 + k * 0.18, hot = k === 3;
        return [
          B('zk-row' + k, { x: 60, y, w: 1800, h: 100, r: 18, fill: hot ? pGreen : panel, stroke: hot ? ink : line, lw: 2, d }),
          T('zk-n' + k, n, { x: 90, y: y + 28, size: 34, font: 'mono', weight: 700, color: greenInk, d }),
          T('zk-d' + k, desc, { x: 560, y: y + 26, size: 38, weight: 700, maxW: 1280, d: d + 0.05 }),
        ];
      }),
      C('zk-bot', { x: 116, y: 780, r: 46, fill: pBlue, stroke: ink, lw: 2.5, d: 1.2 }),
      I('zk-boti', 'bot', { x: 116, y: 778, size: 44, color: ink, d: 1.2 }),
      arrow('zk-a0', 168, 780, 222, 780, { d: 1.3 }),
      card('zk-cli', { x: 232, y: 744, w: 210, h: 72, r: 36, fill: panel, stroke: ink, lw: 2.5, d: 1.35 }, 'gdg CLI', { size: 34, font: 'mono' }),
      arrow('zk-a1', 450, 780, 504, 780, { d: 1.4 }),
      ['wiki', 'tinyurl', 'img', 'sns'].map((t, k) => card('zk-ap' + k, { x: 514 + k * 166, y: 746, w: 152, h: 68, r: 16, fill: panel, stroke: ink, lw: 2, d: 1.45 + k * 0.08 }, t, { size: 30, font: 'mono', weight: 500 })),
      T('zk-say', '「Wiki を更新して」と頼むだけ', { x: 1200, y: 752, size: 40, weight: 800, color: ink2, d: 1.8 }),
      dot('zk-b0', 60, 870, '`AGENTS.md`: 構成（feature-first）・コマンド・規約を集約', { size: 40, d: 2.0 }),
      dot('zk-b1', 60, 958, '外部の skill はハッシュでバージョンを固定して運用', { size: 40, d: 2.2 }),
    );
  }
  return out;
};
const NOTE11 = '3つ目の軸がハーネスエンジニアリングです。AI エージェントに猛スピードで実装させると、当然ミスもします。そこで、コミット時の pre-commit フックで、ステージされたファイルから必要な型検査・ビルド・Playwright の E2E テストだけを選んで走らせています。これによって、AI は壊れたコードをそもそもコミットできなくなります。';
const NOTE12 = 'ただし、pre-commit フックには致命的な罠があります。「遅いと、人も AI もフックを飛ばしたくなる」ということです。以前は3分から30分かかっていましたが、これではハーネスとして機能しません。そこで毎回ログを JSON で計測し、Turbo グラフの統合、E2E の並列化、TypeScript 7 のネイティブコンパイラへの移行をやり切りました。今では1秒から1分で終わるので、AI が何度コミットしてもストレスなく品質を守れます。';
const NOTE13 = 'コードの検査だけでなく、AI の「仕事の進め方」も Agent Skills で型化しています。実装前に grilling で設計の穴を AI に質問攻めにしてもらったり、wayfinder で判断を分割したりしています。さらに面白いのが一番下で、内製したアプリ用の CLI と Skill も作っているので、「Wiki を更新して」「短縮リンクを発行して」と AI に頼むだけで、作ったアプリ自体を AI が操作してくれます。';
scene({
  ch: 5, title: '軸③: ローカルの pre-commit CI', notes: NOTE11, cam: pilFrame(2),
  P: { frame: pilFrame(2), parts: [pFlow({ paths: CI_PATHS, speed: 240, col: green, spread: 3, weight: 0.6, size: 2 }), pAmbient({ weight: 0.25, alpha: 0.2 })] },
  A: () => focusMap(2, 1),
});
scene({
  ch: 5, title: '軸③: 遅いとフックは飛ばされる', notes: NOTE12, cam: pilFrame(2),
  P: { frame: pilFrame(2), parts: [pClusters({ list: [{ x: 1560, y: 480, r: 70, col: red, sq: 0.5 }], weight: 0.3, swirl: 1.4 }), pAmbient({ weight: 0.4, alpha: 0.2 })] },
  A: () => focusMap(2, 2),
});
scene({
  ch: 5, title: '軸③: 3〜30分 → 1秒〜1分', notes: NOTE12, cam: pilFrame(2),
  P: { frame: pilFrame(2), parts: [pFlow({ paths: [[[440, 545], [600, 545]]], speed: 300, col: green, spread: 30, weight: 0.4 }), pAmbient({ weight: 0.3, alpha: 0.2 })] },
  A: () => focusMap(2, 3),
});
scene({
  ch: 5, title: '軸③: Agent Skills と AGENTS.md', notes: NOTE13, cam: pilFrame(2),
  P: { frame: pilFrame(2), parts: [pFlow({ paths: [[[168, 780], [514, 780], [1170, 780]]], speed: 220, col: green, spread: 5, weight: 0.4 }), pAmbient({ weight: 0.35, alpha: 0.2 })] },
  A: () => focusMap(2, 4),
});
