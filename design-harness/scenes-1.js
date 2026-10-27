'use strict';
/* =========================================================================
 * scenes-1.js — イントロ / 背景 / 動機
 * 同じ id のアクターは次のシーンへモーフィングで引き継がれる。
 * ========================================================================= */
// 共通ヘルパー（tw / Hd / card / iconLine と色の短縮名は engine/kit.js）
function head(id, x, y, w, h, o = {}) {
  return POLY(id, HEAD, { x, y, w, h, stroke: warm, lw: 3.5, fill: warm, fillA: 0.05, ...o });
}
const headP = (x, y, w, h, o = {}) => pPoly({ pts: HEAD, x, y, w, h, top: 0.75, ...o });
// 右上の QR コードとラベル。タイトル（資料 URL）→ 自己紹介（X）で同じ id のまま差し替わる
function qrTag(kick, label, src, d) {
  return [
    T('t-url-k', kick, { x: 1640, y: 92, size: 22, font: 'mono', color: cool, align: 'right', d }),
    T('t-url', label, { x: 1640, y: 128, size: 30, font: 'mono', weight: 700, color: ink2, align: 'right', d }),
    IMG('t-qr', src, { x: 1680, y: 40, w: 180, h: 180, r: 8, d }),
  ];
}
img('img/qr-x.png'); // 自己紹介で使う QR を先読みしておく

/* ---------- 1. タイトル ---------- */
scene({
  ch: 0, title: 'デザインハーネスをエンジニア向けに説明する',
  notes: '最近よく耳にする「デザインハーネス」ですが、エンジニアの視点で見ると一体何なのか。今日は、私たちが普段から使っている道具（リポジトリ、lint、CI、コードレビュー）と対比させながら、わかりやすく解説します。',
  P: [pRing({ x: 1600, y: 580, r: 230, w: 100, speed: 0.07, size: 2.6, alpha: 0.85, col: u => mixc(warm, cool, 0.5 + 0.5 * Math.cos(u * Math.PI * 2)) })],
  A: () => [
    T('t-main', 'デザインハーネス', { x: 54, y: 300, size: 150, weight: 900, d: 0.1 }),
    T('t-sub', 'をエンジニア向けに説明する', { x: 62, y: 520, size: 76, weight: 700, d: 0.2 }),
    T('t-tag', '〜デザイナーの判断基準を、コードと同じように運用する〜', { x: 66, y: 660, size: 42, color: ink2, d: 0.35 }),
    T('t-meta', 'ゆにねこ / AIAU・GDG関西 / 2026/09/25', { x: 66, y: 930, size: 30, font: 'mono', color: ink3, d: 0.5 }),
    qrTag('SLIDES', 'design-harness.slides.yuni.cat', 'img/qr.png', 0.6),
  ],
});

/* ---------- 1.5 自己紹介 ---------- */
const AVATAR = 'https://pbs.twimg.com/profile_images/1634320183467851777/82h0YFhY_400x400.jpg';
img(AVATAR); // タイトル表示中に先読みしておく
const AV = { x: 1420, y: 540, r: 230 };
scene({
  ch: 0, title: '自己紹介',
  notes: 'ゆにねこです。AIAU、そして GDG関西 のスタッフとして活動しています。',
  P: [
    pRing({ x: AV.x, y: AV.y, r: AV.r + 70, w: 70, speed: 0.05, size: 2.4, alpha: 0.75, col: u => mixc(warm, cool, 0.5 + 0.5 * Math.cos(u * Math.PI * 2)) }),
    pAmbient({ weight: 0.25, alpha: 0.2 }),
  ],
  A: () => [
    Hd('自己紹介'),
    T('me-kick', 'SPEAKER', { x: 66, y: 300, size: 28, font: 'mono', color: cool }),
    T('me-name', 'ゆにねこ', { x: 56, y: 350, size: 140, weight: 900, d: 0.1 }),
    iconLine('me-a1', 'spark', cool, 66, 600, 'AIAU', { d: 0.3 }),
    iconLine('me-a2', 'user', green, 66, 710, 'GDG関西 スタッフ', { d: 0.45 }),
    C('me-ring', { x: AV.x, y: AV.y, r: AV.r + 12, stroke: cool, lw: 3, d: 0.15 }),
    IMG('me-av', AVATAR, { x: AV.x - AV.r, y: AV.y - AV.r, w: AV.r * 2, h: AV.r * 2, r: AV.r, d: 0.2 }),
    qrTag('X', '@harineko_univ', 'img/qr-x.png', 0.3),
  ],
});

/* ---------- 2. AI で UI を作ると起きること ---------- */
const SW = [cool, warm, green, yellow, violet];
// キット／生成画面は元の座標で組み、KIT で右側の領域へ拡大配置する
const KIT = [1.15, 1020, 190, 986, 165];
const kp = (x, y) => [KIT[3] + (x - KIT[1]) * KIT[0], KIT[4] + (y - KIT[2]) * KIT[0]];
function dsKit(state) {
  // state: 'kit' | 'screen' | 'review'
  const kit = state === 'kit';
  const out = [];
  out.push(B('ds', kit
    ? { x: 1020, y: 220, w: 760, h: 600, r: 22, fill: panel, stroke: line }
    : { x: 1060, y: 190, w: 700, h: 660, r: 18, fill: panel, stroke: line }));
  out.push(T('ds-l', kit ? 'design-system/' : 'profile.html — AI 生成', { x: kit ? 1052 : 1090, y: kit ? 242 : 206, size: 20, font: 'mono', color: kit ? ink3 : warm }));
  if (!kit) out.push(L('ds-bar', [[1060, 250], [1760, 250]], { color: line, lw: 2 }));
  if (kit) {
    SW.forEach((c, i) => out.push(B('sw' + i, { x: 1056 + i * 92, y: 292, w: 72, h: 72, r: 14, fill: c, d: 0.05 * i, out: { s: 0.6 } })));
    out.push(T('sw-l', 'tokens', { x: 1056, y: 376, size: 18, font: 'mono', color: ink3 }));
    out.push(T('cm-l', 'components', { x: 1056, y: 698, size: 18, font: 'mono', color: ink3 }));
  }
  const J = kit ? 0 : 1; // 生成画面は少しずつ崩す
  out.push(card('c-btn', kit ? { x: 1056, y: 440, w: 200, h: 60, fill: cool, stroke: null, d: 0.2 }
    : { x: 1118, y: 508, w: 210, h: 60, fill: cool, stroke: null, rot: -0.018, jit: state === 'screen' ? 2 : 0 },
    '保存する', { size: 24, color: '#ffffff' }));
  out.push(card('c-link', kit ? { x: 1286, y: 440, w: 200, h: 60, fill: null, stroke: null, d: 0.25 }
    : { x: 1356, y: 504, w: 280, h: 60, fill: panel2, stroke: cool, rot: 0.01 },
    kit ? '[[cool:詳細を見る →]]' : '詳細を見る', { size: 24, color: cool }));
  out.push(card('c-in', kit ? { x: 1056, y: 540, w: 430, h: 60, fill: null, stroke: ink3, d: 0.3 }
    : { x: 1100, y: 380, w: 600, h: 64, fill: null, stroke: ink3, rot: 0.008 * J },
    '表示名', { size: 22, color: ink3, weight: 500, align: 'left', x: (kit ? 1056 : 1100) + 20 }));
  out.push(B('c-card', kit ? { x: 1520, y: 440, w: 220, h: 160, fill: panel2, stroke: line, d: 0.35 }
    : { x: 1100, y: 612, w: 600, h: 200, fill: panel2, stroke: line }));
  out.push(B('c-card1', kit ? { x: 1544, y: 468, w: 140, h: 14, r: 7, fill: ink3, d: 0.4 } : { x: 1112, y: 628, w: 260, h: 16, r: 8, fill: ink3 }));
  out.push(B('c-card2', kit ? { x: 1544, y: 498, w: 172, h: 10, r: 5, fill: line, d: 0.42 } : { x: 1170, y: 690, w: 420, h: 12, r: 6, fill: line }));
  out.push(B('c-card3', kit ? { x: 1544, y: 520, w: 120, h: 10, r: 5, fill: line, d: 0.44 } : { x: 1140, y: 760, w: 300, h: 12, r: 6, fill: line }));
  if (!kit) {
    out.push(T('scr-h', 'プロフィール編集', { x: 1100, y: 286, size: 34, weight: 800 }));
    out.push(T('scr-lab', '表示名', { x: 1104, y: 344, size: 20, color: ink2 }));
  }
  return scaleG(out, ...KIT);
}
const S2L1 = d => iconLine('l1', 'check', green, 60, 190, 'デザインシステム・トークン・\nコンポーネントは完備', d);
const S2L2 = d => iconLine('l2', 'alert', warm, 60, 390, 'それでも AI 生成画面は\n「それっぽいけれど、[[warm!:何かが違う]]」', d);
const S2L3 = d => iconLine('l3', 'chat', warm, 60, 590, 'レビューで[[warm!:繰り返される]]同じ指摘', d);
const NOTE2 = 'UI パーツ自体は揃っているのに、その組み合わせ方や「なぜそう設計するのか」という意図が AI に伝わっていません。正しいコンポーネントをただ並べただけでは、まとまりのある画面にはならないのです [E2-B]。';

scene({
  ch: 1, title: 'AI で UI を作ると起きること — 部品は完備', notes: NOTE2,
  P: [pAmbient({ col: cool, alpha: 0.35 })],
  A: () => [Hd('AI で UI を作ると起きること'), S2L1({}), dsKit('kit')],
});
scene({
  ch: 1, title: 'AI で UI を作ると起きること — それっぽいが何かが違う', notes: NOTE2,
  P: [pAmbient({ col: u => (u < 0.5 ? warm : cool), alpha: 0.4, drift: 30 })],
  A: () => [Hd('AI で UI を作ると起きること'), S2L1({ color: ink2 }), S2L2({}), dsKit('screen')],
});
// レビューコメント（吹き出し）。高さは本文の行数から決め、アバターと件数は縦中央に揃える
const BUB = { size: 30, lh: 1.4, pad: 20 };
function bubble(id, x, y, w, text, n, anchor, o = {}) {
  const th = BUB.size * BUB.lh * text.split('\n').length, h = th + BUB.pad * 2, cy = y + h / 2;
  return [
    L(id + '_p', [[x + 44, cy], anchor], { color: warm, lw: 2.5, dash: 7, d: o.d, alpha: o.alpha }),
    C(id + '_a', { x: anchor[0], y: anchor[1], r: 9, fill: warm, d: o.d, alpha: o.alpha, s: o.s }),
    B(id, { x, y, w, h, r: 20, fill: COL.warmBg, stroke: warm, lw: 2.5, d: o.d, alpha: o.alpha, s: o.s, md: o.md }),
    C(id + '_av', { x: x + 44, y: cy, r: 24, fill: warm, fillA: 0.2, d: o.d, alpha: o.alpha, s: o.s }),
    I(id + '_avi', 'user', { x: x + 44, y: cy, size: 28, color: warm, d: o.d, alpha: o.alpha, s: o.s }),
    T(id + '_t', text, { x: x + 84, y: y + BUB.pad, size: BUB.size, lh: BUB.lh, weight: 700, d: o.d, alpha: o.alpha, s: o.s, maxW: w - 180 }),
    T(id + '_n', '×{n}', { x: x + w - 24, y: cy - BUB.size * BUB.lh / 2, size: BUB.size, lh: BUB.lh, weight: 800, font: 'mono', color: warm, align: 'right', num: n, in: { alpha: 0, num: 1 }, dur: 2.2, d: (o.d || 0) + 0.2, alpha: o.alpha, s: o.s }),
  ];
}
const BUBBLES = [
  ['rv1', 1170, 820, 680, 'この余白はこっちの\nトークンを指定', 14, kp(1300, 700)],
  ['rv2', 1040, 378, 810, 'このユースケースなら\nボタンではなくリンク', 9, kp(1496, 534)],
  ['rv3', 720, 690, 610, '送信失敗時に\n入力値消失はNG', 11, kp(1220, 538)],
];
scene({
  ch: 1, title: 'AI で UI を作ると起きること — 繰り返される同じ指摘', notes: NOTE2,
  P: [pAmbient({ col: warm, alpha: 0.3 })],
  A: () => [
    Hd('AI で UI を作ると起きること'),
    S2L1({ color: ink2, alpha: 0.6 }), S2L2({ color: ink2, alpha: 0.6 }), S2L3({}),
    dsKit('review'),
    BUBBLES.map((b, i) => bubble(b[0], b[1], b[2], b[3], b[4], b[5], b[6], { d: 0.25 + i * 0.35 })),
  ],
});
scene({
  ch: 1, title: '判断基準はデザイナーの頭の中にしかない', notes: NOTE2,
  P: [headP(1330, 190, 480, 640, { col: warm, alpha: 0.85, size: 2.2 }), pAmbient({ col: warm, alpha: 0.25, weight: 0.3 })],
  A: () => [
    T('big', '判断基準や\n「[[warm!:なぜダメなのか]]」の理由は、', { x: 60, y: 250, size: 80, weight: 800, lh: 1.35, d: 0.5 }),
    T('big2', 'デザイナーの[[warm!:頭の中]]にしかない。', { x: 60, y: 486, size: 80, weight: 800, lh: 1.35, d: 0.75 }),
    head('head', 1330, 190, 480, 640, { d: 0.2, dur: 1.6 }),
    // 吹き出しは頭の中へ吸い込まれて消える（中心が頭の中に来るよう x を合わせる）
    BUBBLES.map((b, i) => bubble(b[0], 1570 + i * 24 - b[3] / 2, 400 + i * 40, b[3], b[4], b[5], [1570, 460], { alpha: 0, s: 0.2, md: i * 0.08 })),
  ],
});

/* ---------- 3. 判断基準は「個人の頭の中」と「散在した議論」にある ---------- */
const ISLANDS = [
  ['GitHub', 'branch', 1010, 200], ['Slack', 'chat', 1490, 176], ['Confluence', 'book', 1210, 360],
  ['Figma', 'pen', 1610, 400], ['議事録', 'clip', 1040, 540],
];
function islands(o = {}) {
  return ISLANDS.map(([name, ic, x, y], i) => {
    const w = 116 + tw(name, 34, 700);
    return [
      B('is' + i, { x, y, w, h: 84, r: 42, fill: panel2, stroke: line, d: 0.1 + i * 0.1, in: { alpha: 0, s: 0.6 }, ...o }),
      I('is' + i + 'i', ic, { x: x + 46, y: y + 42, size: 34, color: cool, d: 0.1 + i * 0.1, ...o }),
      T('is' + i + 't', name, { x: x + 82, y: y + 17, size: 34, weight: 700, d: 0.1 + i * 0.1, ...o }),
    ];
  });
}
const H3 = () => Hd('判断基準は「個人の頭の中」と「散在した議論」にある');
const NOTE3 = 'デザイナー個人としては「判断を言語化しきれない」という悩みがあり、チームとしては「過去の経緯が散乱している」という悩みがあります。形は違いますが、どちらも「判断基準が外部から参照できない」という本質的な課題は共通しています。';
const P1 = o => [
  T('p1', '[[warm!:個人の課題]]　判断基準の未言語化', { x: 60, y: 710, size: 44, weight: 700, ...o }),
  T('p1q', '「どれも妥当に見えてしまい、\n自分の意見を言い切れない」[N1]', { x: 60, y: 786, size: 34, color: ink2, maxW: 920, d: 0.15, ...o }),
];
const P2 = o => [
  T('p2', '[[cool!:チームの課題]]　判断経緯・文脈の散在', { x: 1000, y: 710, size: 44, weight: 700, ...o }),
  T('p2q', '「なぜ最小幅 `210px` なのか」を知るのは古参メンバーのみ\n[Z1]', { x: 1000, y: 786, size: 34, color: ink2, maxW: 920, d: 0.15, ...o }),
];
const HEAD3 = [110, 170, 380, 490];
const islandP = (w, a = 0.8) => pClusters({ weight: w, alpha: a, list: ISLANDS.map(([, , x, y]) => ({ x: x + 100, y: y + 42, r: 110, col: cool, sq: 0.6 })) });
scene({
  ch: 1, title: '判断基準は「個人の頭の中」にある', notes: NOTE3,
  P: [headP(...HEAD3, { col: warm, alpha: 0.85 }), pAmbient({ weight: 0.25, alpha: 0.25 })],
  A: () => [H3(), head('head', ...HEAD3), P1({})],
});
scene({
  ch: 1, title: '…と「散在した議論」にある', notes: NOTE3,
  P: [headP(...HEAD3, { col: warm, alpha: 0.85, weight: 0.45 }), islandP(0.55)],
  A: () => [H3(), head('head', ...HEAD3), P1({}), islands(), P2({})],
});
scene({
  ch: 1, title: 'どちらも AI から参照できない', notes: NOTE3,
  P: [headP(...HEAD3, { col: warm, alpha: 0.55, weight: 0.45 }), islandP(0.55, 0.5)],
  A: () => [
    H3(), head('head', ...HEAD3, { alpha: 0.7 }), P1({ alpha: 0.45 }), islands({ alpha: 0.7 }), P2({ alpha: 0.45 }),
    L('ai-l', [[690, 420], [500, 420]], { color: red, lw: 3.5, dash: 12, flow: 30, d: 0.3 }),
    L('ai-r', [[870, 420], [1000, 420]], { color: red, lw: 3.5, dash: 12, flow: 30, d: 0.3 }),
    C('ai', { x: 780, y: 420, r: 80, fill: panel2, stroke: cool, lw: 3.5, d: 0.1 }),
    I('ai-i', 'bot', { x: 780, y: 416, size: 72, color: cool, d: 0.15 }),
    T('ai-t', 'AI エージェント', { x: 780, y: 512, size: 28, font: 'mono', color: cool, align: 'center', d: 0.2 }),
    I('ai-x1', 'x', { x: 595, y: 420, size: 52, color: red, lw: 4.5, d: 0.8, in: { alpha: 0, s: 1.8 } }),
    I('ai-x2', 'x', { x: 935, y: 420, size: 52, color: red, lw: 4.5, d: 0.9, in: { alpha: 0, s: 1.8 } }),
    T('p3', 'どちらも暗黙知のまま → AI から[[red!:参照できない]]', { x: 960, y: 950, size: 56, weight: 800, align: 'center', d: 1.0 }),
  ],
});

/* ---------- 4. エンジニアには見覚えがある構造 ---------- */
const ROWS4 = [
  ['コーディング規約はシニアの頭の中', '判断基準はデザイナーの頭の中'],
  ['レビューで毎回同じ書き方の指摘', 'デザインレビューで毎回同じ指摘'],
  ['「なぜこの実装なのか」は Slack にある', '「なぜこの余白なのか」は Slack にある'],
];
const NOTE4 = '私たちエンジニアは、かつて暗黙知だったルールを「明文化し、機械に自動検査させ、変更をレビューする」という仕組みで解決してきました。全く同じアプローチをデザインの領域にも適用しよう、というのが「デザインハーネス」の考え方です。';
function table4(dim) {
  const a = dim ? 0.45 : 1;
  return [
    T('th-l', 'かつてのコード開発', { x: 900, y: 180, size: 38, weight: 800, color: cool, align: 'right' }),
    T('th-r', 'いまのデザイン・UI 生成', { x: 1020, y: 180, size: 38, weight: 800, color: warm }),
    L('th-line', [[60, 256], [1860, 256]], { color: line, lw: 2, d: 0.1 }),
    ROWS4.map(([l, r], i) => [
      T('r' + i + 'l', l, { x: 900, y: 296 + i * 128, size: 44, weight: 600, align: 'right', d: 0.25 + i * 0.3, in: { alpha: 0, dx: -50 }, alpha: a }),
      T('r' + i + 'm', '≈', { x: 960, y: 290 + i * 128, size: 50, color: ink3, align: 'center', d: 0.4 + i * 0.3, alpha: a }),
      T('r' + i + 'r', r, { x: 1020, y: 296 + i * 128, size: 44, weight: 600, d: 0.4 + i * 0.3, in: { alpha: 0, dx: 50 }, alpha: a }),
    ]),
  ];
}
scene({
  ch: 1, title: 'エンジニアには見覚えがある構造', notes: NOTE4,
  P: [pAmbient({ alpha: 0.3 })],
  A: () => [Hd('エンジニアには見覚えがある構造'), table4(false)],
});
scene({
  ch: 1, title: 'エンジニアには見覚えがある構造 — → ？', notes: NOTE4,
  P: [pText({ str: '?', x: 1150, y: 790, size: 260, col: warm, psize: 1.9, weight_: 0.75 }), pAmbient({ alpha: 0.25, weight: 0.25 })],
  A: () => [
    Hd('エンジニアには見覚えがある構造'), table4(true),
    L('r3line', [[60, 680], [1860, 680]], { color: line, lw: 2 }),
    T('r3l', '→ [[cool!:linter, CI, ADR]] で解決', { x: 900, y: 716, size: 56, weight: 800, align: 'right', d: 0.2, in: { alpha: 0, dx: -50 } }),
    T('r3r', '→', { x: 1020, y: 716, size: 56, weight: 800, d: 0.4 }),
  ],
});

/* ---------- 5. デザインハーネスとは ---------- */
const NOTE5 = 'デザインガイドライン自体は昔から存在していました。決定的な違いは「運用」にあります。ドキュメントを書いて終わりにせず、AI の生成プロンプトやチェック処理、そしてその後の改善サイクルの中で実際に使われ続ける状態を目指します。';
const BEATS = [['pen', '書ける'], ['eye', 'レビューできる'], ['diff', '差分が残る'], ['share', '全員に配れる']];
function beats() {
  const widths = BEATS.map(([, t]) => 76 + tw(t, 40, 700) + 44);
  const total = widths.reduce((a, b) => a + b, 0) + 28 * (BEATS.length - 1);
  let x = 960 - total / 2;
  return BEATS.map(([ic, t], i) => {
    const w = widths[i], out = [
      B('bt' + i, { x, y: 730, w, h: 84, r: 42, fill: panel2, stroke: cool, strokeA: 0.5, d: 0.9 + i * 0.22 }),
      I('bt' + i + 'i', ic, { x: x + 46, y: 772, size: 32, color: cool, d: 0.9 + i * 0.22 }),
      T('bt' + i + 't', t, { x: x + 78, y: 743, size: 40, weight: 700, d: 0.9 + i * 0.22 }),
    ];
    x += w + 28;
    return out;
  });
}
const FLOW5 = bez([420, 300], [640, 150], [780, 480], [1000, 330], 40);
scene({
  ch: 2, title: 'デザインハーネスとは', notes: NOTE5,
  P: [
    headP(110, 150, 300, 390, { col: warm, alpha: 0.8, weight: 0.22 }),
    pFlow({ paths: [FLOW5], speed: 170, col: u => mixc(warm, cool, u), spread: 12, weight: 0.2 }),
    pLines({ x: 1050, y: 244, w: 740, rows: 10, lh: 28, col: cool, weight: 0.58, size: 2 }),
  ],
  A: () => [
    Hd('デザインハーネスとは'),
    head('head', 110, 150, 300, 390, { d: 0.1 }),
    B('ed', { x: 1000, y: 160, w: 860, h: 380, r: 18, fill: panel, fillA: 0.3, stroke: line, d: 0.2 }),
    T('ed-t', 'DESIGN.md · tokens.json · rules/', { x: 1030, y: 180, size: 24, font: 'mono', color: ink3, d: 0.3 }),
    T('q1', '専門職の判断基準を[[warm!:頭の外に出し]]、[[cool!:コードのように運用する]]。', { x: 960, y: 590, size: 62, weight: 800, align: 'center', d: 0.5 }),
    beats(),
    T('q-src', '— 橋本 哲勇（LayerX）[P1] p.12 ／ nicotomo さんの要約:「デザイナーの判断基準を頭の外に出し、コード同様に運用する仕組み」[N1]', { x: 960, y: 866, size: 26, color: ink3, align: 'center', maxW: 1800, d: 1.8 }),
  ],
});
const RING5 = { x: 1370, y: 600, r: 290 };
const ringPt = deg => [RING5.x + Math.cos((deg * Math.PI) / 180) * RING5.r, RING5.y + Math.sin((deg * Math.PI) / 180) * RING5.r];
scene({
  ch: 2, title: 'ポイントは「書き出し」ではなく「運用」', notes: NOTE5,
  P: [pRing({ x: RING5.x, y: RING5.y, r: RING5.r, w: 30, speed: 0.35, col: cool, size: 2.2, alpha: 0.9, weight: 0.8 }), pAmbient({ weight: 0.2, alpha: 0.25 })],
  A: () => [
    Hd('デザインハーネスとは'),
    T('k1', 'ポイントは', { x: 60, y: 160, size: 46, color: ink2 }),
    T('k2', '書き出し', { x: 60, y: 220, size: 128, weight: 800, color: ink3, d: 0.1 }),
    L('k2s', [[48, 313], [584, 313]], { color: red, lw: 9, d: 0.6, dur: 0.5 }),
    T('k3', 'ではなく', { x: 60, y: 420, size: 46, color: ink2, d: 0.8 }),
    T('k4', '運用', { x: 48, y: 470, size: 230, weight: 900, color: cool, glow: 24, d: 1.0, in: { alpha: 0, s: 0.9 } }),
    T('k5', 'ドキュメントの増量ではなく、\n実参照・自動検査・継続更新の[[cool!:仕組み化]]', { x: 60, y: 850, size: 40, color: ink2, lh: 1.5, d: 1.3 }),
    C('ring', { x: RING5.x, y: RING5.y, r: RING5.r, stroke: cool, strokeA: 0.25, lw: 2, in: { reveal: 0 }, dur: 1.4, d: 0.4 }),
    I('ring-i', 'loop', { x: RING5.x, y: RING5.y, size: 100, color: cool, lw: 1.8, d: 0.7 }),
    [[-90, '実参照', '生成プロンプトで使われる'], [30, '自動検査', 'チェック処理で使われる'], [150, '継続更新', '改善サイクルで使われる']].map(([deg, t, sub], i) => {
      const [x, y] = ringPt(deg);
      return [
        B('rn' + i, { x: x - 190, y: y - 62, w: 380, h: 124, r: 20, fill: panel2, stroke: cool, d: 0.9 + i * 0.25 }),
        T('rn' + i + 't', t, { x, y: y - 54, size: 44, weight: 800, align: 'center', d: 0.9 + i * 0.25 }),
        T('rn' + i + 's', sub, { x, y: y + 10, size: 27, color: ink2, align: 'center', d: 0.95 + i * 0.25 }),
      ];
    }),
  ],
});

/* ---------- 6. 「コード同様に運用する」とは ---------- */
const MAP6 = [
  ['バージョン管理（Git）', '`DESIGN.md`・トークン・コンポーネント契約を Git 管理'],
  ['ルールへの ID 付与', '`HTML-BUTTON-TYPE` 等、ルール ID と検査ロジックを紐付け'],
  ['lint / 自動テスト', 'UI の自動チェッカー（違反時は `exit 1`）'],
  ['CI による継続的検証', 'CLI / MCP / CI パイプラインで共通チェッカーを実行'],
  ['ドリフト（乖離）検知', '再生成した成果物と実ファイルの差分検知（ビルド失敗）'],
  ['ADR / PR レビュー', '判断背景の記録、ルール変更の「提案 → 承認 → 適用」'],
];
const NOTE6 = 'エンジニアから見れば、実は新しい概念はほとんどありません。管理の対象が「プログラムのソースコード」から「デザインの判断基準」に置き換わっただけです。';
const rowY6 = i => 204 + i * 126;
function map6(full) {
  return [
    T('mh-l', 'コード運用の仕組み', { x: 60, y: 150, size: 26, font: 'mono', color: cool }),
    MAP6.map(([l, r], i) => {
      const y = rowY6(i);
      const out = card('m' + i, { x: 60, y, w: 600, h: 100, fill: panel2, stroke: cool, strokeA: 0.4, d: 0.1 + i * 0.08 }, l, { size: 38, weight: 700 });
      if (full) out.push(
        L('m' + i + 'a', [[678, y + 50], [770, y + 50]], { color: ink3, lw: 3, head: 14, d: 0.2 + i * 0.16, dur: 0.5 }),
        T('m' + i + 'r', r, { x: 796, y: y + 24, size: 36, weight: 600, d: 0.3 + i * 0.16, in: { alpha: 0, dx: -30 } }),
      );
      return out;
    }),
    full ? T('mh-r', 'デザインハーネスでの対応物', { x: 796, y: 150, size: 26, font: 'mono', color: warm }) : null,
  ];
}
scene({
  ch: 2, title: '「コード同様に運用する」とは', notes: NOTE6,
  P: [pAmbient({ alpha: 0.3, col: cool })],
  A: () => [Hd('「コード同様に運用する」とは'), map6(false)],
});
scene({
  ch: 2, title: '「コード同様に運用する」とは — 対応物', notes: NOTE6,
  P: [pFlow({ paths: MAP6.map((_, i) => [[640, rowY6(i) + 50], [796, rowY6(i) + 50]]), speed: 120, col: u => mixc(cool, warm, u), spread: 5, weight: 0.5, size: 2 }), pAmbient({ weight: 0.3, alpha: 0.25 })],
  A: () => [
    Hd('「コード同様に運用する」とは'), map6(true),
    T('m-note', '新しい概念はほとんどない。管理対象が「ソースコード」から「[[warm!:デザインの判断基準]]」に置き換わっただけ。', { x: 60, y: 976, size: 32, color: ink2, d: 1.4 }),
  ],
});

/* ---------- 7. ハーネスが担う4つの責務 ---------- */
const DUTIES = [
  ['制約', cool, '何を使ってよいか、何が必須か', 'デザイントークン、コンポーネント API、ルール定義', 60, 150],
  ['文脈', violet, '誰のために、なぜ作るのか', '開発ブリーフ、ユースケースシナリオ、設計判断の背景', 1040, 150],
  ['検証', green, '成果物が基準を満たしているか', '自動チェックログ、レンダリング結果、人間によるレビュー', 1040, 610],
  ['フィードバック', yellow, '次に何を変えるべきか', '不具合修正、ルール・チェックロジック自体の継続的更新', 60, 610],
];
const NOTE7 = 'デザインシステムを導入済みのチームであれば、制約と文脈はある程度揃っています。しかし、検証とフィードバック、つまり「機械的に検査し、得られた学びを次の生成に活かす」という後半のサイクルが圧倒的に不足しているのが現状です。';
const LOOP7 = rp([[470, 320], [1450, 320], [1450, 780], [470, 780], [470, 320]], 80);
function duties(gap) {
  return DUTIES.map(([t, c, q, a, x, y], i) => {
    const weak = gap && i >= 2;
    return [
      B('du' + i, { x, y, w: 820, h: 340, r: 22, fill: panel, fillA: 0.94, stroke: weak ? red : c, strokeA: weak ? 0.9 : 0.5, dash: weak ? 12 : 0, lw: 2.5, d: i * 0.15 }),
      T('du' + i + 't', t, { x: x + 40, y: y + 28, size: 56, weight: 800, color: c, d: i * 0.15 + 0.1 }),
      T('du' + i + 'q', q, { x: x + 40, y: y + 128, size: 38, weight: 600, maxW: 740, d: i * 0.15 + 0.15 }),
      T('du' + i + 'a', a, { x: x + 40, y: y + 204, size: 29, color: ink2, maxW: 760, d: i * 0.15 + 0.2 }),
      gap ? T('du' + i + 'b', i < 2 ? '[[green!:✓]] 既存のデザインシステムで保証' : '[[red!:!]] 不足しがち', {
        x: x + 784, y: y + 42, size: 28, weight: 700, align: 'right', color: i < 2 ? green : red, d: 0.3 + i * 0.12,
      }) : null,
    ];
  });
}
const loopArrows = () => [
  L('dl0', [[892, 320], [1028, 320]], { color: ink3, lw: 3, head: 14, d: 0.6 }),
  L('dl1', [[1450, 500], [1450, 598]], { color: ink3, lw: 3, head: 14, d: 0.75 }),
  L('dl2', [[1028, 780], [892, 780]], { color: ink3, lw: 3, head: 14, d: 0.9 }),
  L('dl3', [[470, 598], [470, 500]], { color: ink3, lw: 3, head: 14, d: 1.05 }),
  I('dl-i', 'loop', { x: 960, y: 520, size: 46, color: ink2, d: 1.1 }),
  T('dl-t', '相互連動', { x: 960, y: 554, size: 30, color: ink2, align: 'center', d: 1.1 }),
];
scene({
  ch: 2, title: 'ハーネスが担う4つの責務', notes: NOTE7,
  P: [pFlow({ paths: [LOOP7], speed: 170, col: u => [cool, violet, green, yellow][Math.floor(u * 4) % 4], spread: 9, weight: 0.8 }), pAmbient({ weight: 0.2, alpha: 0.2 })],
  A: () => [
    Hd('ハーネスが担う4つの責務'), duties(false), loopArrows(),
    T('du-foot', '単なる4フォルダの作成ではなく、[[cool!:4責務の相互連動]]が肝要 [C1][C2]', { x: 60, y: 978, size: 32, color: ink2, d: 1.3 }),
  ],
});
scene({
  ch: 2, title: '検証とフィードバックが不足しがち', notes: NOTE7,
  P: [
    pFlow({ paths: [rp([[470, 780], [470, 320], [1450, 320], [1450, 550]], 80)], speed: 140, col: cool, spread: 9, weight: 0.45 }),
    pClusters({ list: [{ x: 1450, y: 550, r: 64, col: red }], weight: 0.35, swirl: 1.4, size: 2.4 }),
    pAmbient({ weight: 0.2, alpha: 0.2 }),
  ],
  A: () => [
    Hd('ハーネスが担う4つの責務'), duties(true), loopArrows(),
    T('du-foot', '「制約」（デザインシステム）は既存でも、「[[red!:検証]]」「[[red!:フィードバック]]」が不足しがち [C2]', { x: 60, y: 978, size: 32, color: ink2 }),
  ],
});

/* ---------- 8. 知識の種類を混ぜない ---------- */
const KINDS = [
  ['事実', cool, 'ボタンの variant は\n2 種類', '実装コードを信頼できる\n情報源（SSOT）として参照'],
  ['要件', green, '送信失敗時も\n入力フォーム値を保持', 'テスト・検査可能な\n判定条件として定義'],
  ['好み', warm, '根拠提示を\nオファーより前に配置', '理由と適用スコープを\nセットで記録'],
  ['未決', gray, '配信媒体向け\nブランドルール未策定', '「未決」と明示し、\nAI の勝手な推測を遮断'],
];
const NOTE8 = 'AI を活用する上で最も危険なのは、個人の好みや未決の暫定仕様が、厳格なルールと同列に扱われてしまうことです。だからこそ、知識の種類ごとに扱いを明確に区別します。';
const kx = i => 60 + i * 456;
const JUMBLE = [[700, 330, -0.12], [1000, 430, 0.08], [800, 540, 0.16], [1080, 290, -0.06]];
function kinds(state) {
  return KINDS.map(([t, c, ex, how], i) => {
    const out = [];
    if (state === 'mix') {
      const [x, y, rot] = JUMBLE[i];
      out.push(card('kt' + i, { x, y, w: 240, h: 96, r: 48, fill: panel2, stroke: c, lw: 3, rot, d: i * 0.1, dash: i === 3 ? 10 : 0 }, t, { size: 44, weight: 800, color: c }));
    } else {
      out.push(card('kt' + i, { x: kx(i), y: 160, w: 432, h: 96, r: 20, fill: panel2, stroke: c, lw: 3, rot: 0, md: i * 0.06, dash: i === 3 ? 10 : 0 }, t, { size: 44, weight: 800, color: c }));
      out.push(
        T('ke' + i + 'l', '具体例', { x: kx(i) + 8, y: 282, size: 24, font: 'mono', color: ink3, d: 0.5 + i * 0.1 }),
        T('ke' + i, ex, { x: kx(i) + 8, y: 320, size: 36, weight: 700, maxW: 416, d: 0.55 + i * 0.1 }),
        T('kh' + i + 'l', '扱い方', { x: kx(i) + 8, y: 450, size: 24, font: 'mono', color: ink3, d: 0.65 + i * 0.1 }),
        T('kh' + i, how, { x: kx(i) + 8, y: 488, size: 31, color: ink2, maxW: 416, d: 0.7 + i * 0.1 }),
      );
    }
    return out;
  });
}
const binsP = () => KINDS.map(([, c], i) => pGrid({ x: kx(i) + 10, y: 660, w: 412, h: 170, cols: 26, rows: 9, col: c, alpha: 0.75, size: 2, weight: 0.18, wob: 0.6 }));
scene({
  ch: 2, title: '知識の種類を混ぜない — 混ざると危険', notes: NOTE8,
  P: [pCloud({ x: 960, y: 450, rx: 520, ry: 250, swirl: 0.7, size: 2.4, alpha: 0.85, col: u => [cool, green, warm, gray][Math.floor(hash(u * 997) * 4)] })],
  A: () => [
    Hd('知識の種類を混ぜない'), kinds('mix'),
    T('k-warn', '危険: [[warm!:好み]]や[[gray!:未決の暫定仕様]]が、厳格なルールと同列に扱われること', { x: 960, y: 830, size: 46, weight: 700, align: 'center', d: 0.6 }),
  ],
});
scene({
  ch: 2, title: '知識の種類を混ぜない — 4 種類に分ける', notes: NOTE8,
  P: binsP(),
  A: () => [Hd('知識の種類を混ぜない'), kinds('sorted')],
});
scene({
  ch: 2, title: 'nicotomo さんの個人ハーネスでの実践原則', notes: NOTE8,
  P: [pAmbient({ alpha: 0.25, h: 620 })],
  A: () => [
    Hd('知識の種類を混ぜない'), kinds('sorted'),
    B('np', { x: 60, y: 630, w: 1800, h: 400, r: 22, fill: panel, stroke: line, d: 0.1 }),
    T('np-t', 'nicotomo さんの個人ハーネスでの実践原則 [N1]', { x: 104, y: 658, size: 28, font: 'mono', color: ink3, d: 0.2 }),
    T('np1', '① 実際に下した判断のみを記録', { x: 104, y: 724, size: 42, weight: 700, d: 0.35 }),
    T('np2', '② 迷ったものは「未決」とし、判断材料（実測値・検証結果）とセットで保留', { x: 104, y: 818, size: 42, weight: 700, d: 0.5 }),
    T('np3', '③ 固定の「~~正解集~~」ではなく、検証を重ねる「[[warm!:仮説集]]」として運用', { x: 104, y: 912, size: 42, weight: 700, d: 0.65 }),
  ],
});
