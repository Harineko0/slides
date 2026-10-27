'use strict';
/* =========================================================================
 * scenes-outro.js — 土台（Cloudflare）/ 伏線回収 / 実践の急所 / まとめ / 参考資料
 * まとめの後半は全体像の右隣（x + 1920）へ、参考資料はその下へカメラがパンする。
 * ========================================================================= */

/* ---------- 14. 土台としての Cloudflare ---------- */
const CF_ROWS = [
  ['CRUD', 'D1・R2・KV', 'ほぼすべて（D1 は12アプリ）'],
  ['リアルタイム', 'Durable Objects・WebSocket', '`ost` `mc` `screen` `wiki`'],
  ['映像・音声の配信', 'Realtime SFU', '`screen`'],
  ['Worker 間通信', 'Service Bindings', '13アプリ（`accounts` 連携など）'],
  ['非同期処理', 'Queues・Cron', '`wiki` `connpass` `sns`'],
  ['o11y', 'Workers Logs・Analytics Engine', '13アプリで有効化'],
  ['AI と検索', 'Workers AI・Vectorize 他', '`wiki` `connpass`'],
];
const CFX = [60, 470, 1180], cfY = k => 232 + k * 86;
const O11Y = 5; // CF_ROWS のうち o11y の行。stage 2 ではこの行だけが上へ移って見出しになる
const OBS = { x: 60, y: 268, w: 1000 }, ok_ = OBS.w / 2000;
const OBS_PTS = [
  'ログをダッシュボードで\n検索・ライブ表示',
  '`wrangler.toml` で\n有効にするだけ',
  'Analytics Engine で\n独自の指標も計測',
  '監視 SaaS の契約・連携が不要',
];
function cfObs() {
  const r = CF_ROWS[O11Y];
  return [
    zk('zf-k', 'FOUNDATION · OBSERVABILITY', ink2),
    zh('zf-h', '土台としての Cloudflare: Observability も最初から付いてくる'),
    B('zf-hl', { x: 40, y: 160, w: 1840, h: 76, r: 16, fill: pGreen, stroke: ink, lw: 2, in: { alpha: 0 }, d: 0.6 }),
    T('zf-a' + O11Y, r[0], { x: CFX[0] + 30, y: 174, size: 38, weight: 800, mdur: 1.2 }),
    T('zf-b' + O11Y, r[1], { x: CFX[1], y: 176, size: 34, weight: 700, color: blueInk, mdur: 1.2 }),
    T('zf-c' + O11Y, r[2], { x: CFX[2], y: 176, size: 34, weight: 600, color: ink2, mdur: 1.2 }),
    IMG('zf-obs', IMGP('14-cf-observability.webp'), { ...OBS, h: OBS.w * 1237 / 2000, r: 18, d: 0.8 }),
    // 画面右上の「93 Success / 0 Errors」
    B('zf-obs-hl', { x: OBS.x + 1618 * ok_, y: OBS.y + 372 * ok_, w: 272 * ok_, h: 50 * ok_, r: 8, stroke: green, lw: 4, fill: green, fillA: 0.1, d: 1.6, in: { alpha: 0, s: 1.6 } }),
    T('zf-obs-c', '`gdgjp-accounts` の Workers Observability', { x: OBS.x, y: OBS.y + OBS.w * 1237 / 2000 + 14, size: 28, color: ink3, d: 1.0 }),
    OBS_PTS.map((t, i) => dot('zf-p' + i, 1110, 276 + i * 146, t, { size: 42, weight: 700, lh: 1.35, maxW: 760, dot: green, d: 1.2 + i * 0.2 })),
    T('zf-foot2', '→ [[greenInk!:Datadog などがなくても]]、\nObservability を担保しやすい', { x: 1110, y: 870, size: 46, weight: 900, lh: 1.4, d: 2.2 }),
  ];
}
CONTENT.cf = (stage = 1) => stage === 2 ? cfObs() : [
  zk('zf-k', 'FOUNDATION', ink2),
  zh('zf-h', '土台としての Cloudflare: インフラ構築時間をゼロにする'),
  ['やりたいこと', 'Cloudflare の機能', '使っているアプリ'].map((t, i) => lab('zf-th' + i, t, CFX[i], 174, { d: 0.2 })),
  CF_ROWS.map((r, k) => {
    const y = cfY(k), d = 0.3 + k * 0.12;
    return [
      L('zf-l' + k, [[60, y - 10], [1860, y - 10]], { color: line, lw: 2, d }),
      T('zf-a' + k, r[0], { x: CFX[0], y: y + 6, size: 38, weight: 800, d }),
      T('zf-b' + k, r[1], { x: CFX[1], y: y + 8, size: 34, weight: 700, color: blueInk, d: d + 0.05 }),
      T('zf-c' + k, r[2], { x: CFX[2], y: y + 8, size: 34, weight: 600, color: ink2, d: d + 0.1 }),
    ];
  }),
  L('zf-le', [[60, cfY(7) - 10], [1860, cfY(7) - 10]], { color: line, lw: 2, d: 1.2 }),
  T('zf-foot', 'どれも `wrangler.toml` に[[blueInk!:数行書くだけ]] → インフラ構築が[[redInk!:ほぼゼロ]]', { x: 60, y: 878, size: 50, weight: 900, maxW: 1800, d: 1.4 }),
];
const NOTE14 = 'そして、これら3つの軸を下から支えているのが Cloudflare です。DB やストレージだけでなく、WebSocket のリアルタイム通信、映像配信の SFU、Worker 間通信まで、すべて wrangler.toml に数行書くだけで立ち上がります。インフラ構築の時間がゼロだからこそ、コードを書くことだけに集中できます。';
const ALL = { apps: 4, pil: ['on', 'on', 'on'], slab: 'on' };
scene({
  ch: 6, title: '3つの軸を下から支える Cloudflare', notes: NOTE14,
  P: mapP(ALL),
  A: () => map({ hd: 'そして、3つの軸を下から支える土台', ...ALL }),
});
scene({
  ch: 6, title: '土台としての Cloudflare: インフラ構築時間をゼロにする', notes: NOTE14, cam: CF_FRAME,
  P: { frame: CF_FRAME, parts: [pAmbient({ weight: 0.6, col: u => GDG4[Math.floor(u * 4) % 4], alpha: 0.3 })] },
  A: () => map({ ...ALL, slab: 'focus' }),
});
scene({
  ch: 6, title: '土台としての Cloudflare: Datadog などがなくても Observability を担保しやすい', cam: CF_FRAME,
  notes: 'もう1つ、地味ですが効いているのが Observability です。Workers Logs を有効にしておけば、リクエストごとのログがダッシュボードでそのまま検索でき、ライブで流れを追うこともできます。これは accounts の画面で、エラーが0件なのもひと目でわかります。wrangler.toml で observability を有効にするだけで、今は13アプリで有効にしています。Datadog のような監視 SaaS を別途契約・連携しなくても、最初から「何が起きたか」を追える状態になっています。',
  P: { frame: CF_FRAME, parts: [pRects({ rects: [{ x: OBS.x, y: OBS.y, w: OBS.w, h: OBS.w * 1237 / 2000 }], speed: 220, col: green, size: 2, alpha: 0.8, weight: 0.5 }), pAmbient({ weight: 0.4, alpha: 0.2 })] },
  A: () => map({ ...ALL, slab: 'focus', slabStage: 2 }),
});

/* ---------- 15. 伏線回収: screen.gdgs.jp ---------- */
const NOTE15 = 'ここで冒頭の話に戻ります。DevFest 当日に3時間で作った mc に続き、2日後には WebRTC の SFU とノイズ抑制を使ったリモート登壇者システム screen も、深夜0時48分から4時28分までの約3時間半で完成しました。なぜこれが可能だったかというと、認証は accounts に、UI はデザインシステムに、インフラは Cloudflare に、品質検査は1分の pre-commit CI にすべて任せて、私と AI は「このアプリ固有のロジック」だけを書いたからです。';
const SCR = { x: 560, y: 128, w: 800, h: 180 };
const SCR_I = appIdx('screen');
const PAY = [
  ['ログイン・権限', '`initializeRpAuth` を\n呼ぶだけ'],
  ['コントロールルームの UI', 'コンポーネントを\n並べるだけ'],
  ['品質保証', '1分以内の CI が\n自動で担保'],
];
const PAY_PATHS = [
  ...PIL.map(p => bez([960, SCR.y + SCR.h], [960, 350], [p.cx, 300], [p.cx, 420], 20)),
  rp([[SCR.x + SCR.w, 290], [1880, 290], [1880, 860], [1740, 860]], 30),
];
function payoff(final) {
  return [
    Hd('伏線回収: だから「数時間」で複雑なアプリが立ち上がる'),
    B('app' + SCR_I, { ...SCR, r: 24, fill: panel, stroke: red, lw: 4, glow: final ? 18 : 0, pulse: final ? 1 : 0 }),
    IMG('sc-img', IMGP('15-screen-control-room.jpg'), { x: SCR.x + 14, y: SCR.y + 14, w: 236, h: 152, r: 12, d: 0.4 }),
    T('app' + SCR_I + '_t', 'screen.gdgs.jp', { x: SCR.x + 280, y: SCR.y + 30, size: 44, font: 'mono', weight: 700, color: redInk }),
    T('sc-sub', 'リモート登壇者フィード', { x: SCR.x + 282, y: SCR.y + 100, size: 32, weight: 700, color: ink2, d: 0.3 }),
    T('sc-t0', '[[redInk!:00:48]] 最初のコミット\n91ファイル・約8千行', { x: 60, y: 140, size: 34, weight: 800, lh: 1.4, d: 0.5 }),
    T('sc-t1', '[[redInk!:04:28]] ノイズ抑制・\nチャットまで完成', { x: 1400, y: 140, size: 34, weight: 800, lh: 1.4, d: 0.7 }),
    PAY_PATHS.map((pts, i) => L('pay-l' + i, pts, { color: i < 3 ? PIL[i].color : ink, lw: 3, dash: 8, flow: 30, head: 12, d: 0.8 + i * 0.15 })),
    PIL.map((p, i) => card('pay' + i, { x: p.cx - 230, y: 410, w: 460, h: 220, r: 20, fill: panel, stroke: p.color, lw: 3, d: 1.0 + i * 0.15 }, `[[ink2:${PAY[i][0]}]]\n${PAY[i][1]}`, { size: 36, lh: 1.45 })),
    card('pay3', { x: 520, y: 816, w: 1200, h: 88, r: 44, fill: '#3a3a3a', stroke: null, d: 1.5 }, 'Realtime SFU と Durable Objects を呼ぶだけ', { size: 38, color: '#ffffff' }),
    final ? T('sc-q', '人間と AI が考えたのは「[[redInk!:登壇者と配信オペレーターの体験]]」だけ', { x: 960, y: 944, size: 52, weight: 900, align: 'center', maxW: 1840, d: 0.2 }) : null,
  ];
}
const payMap = () => map({ apps: 4, only: [], noKick: 1, pil: ['on', 'on', 'on'], slab: 'on', caps: false, namesA: 0, noMini: 1 });
scene({
  ch: 6, title: '伏線回収: screen.gdgs.jp を約3時間半で', notes: NOTE15,
  P: [pFlow({ paths: PAY_PATHS, speed: 200, col: (u, j) => (j < 3 ? PIL[j].color : ink2), spread: 4, weight: 0.6 }), pAmbient({ weight: 0.3, alpha: 0.18 })],
  A: () => [payMap(), payoff(false)],
});
scene({
  ch: 6, title: '伏線回収: 考えたのは「体験」だけ', notes: NOTE15,
  P: [
    pFlow({ paths: PAY_PATHS.map(p => p.slice().reverse()), speed: 200, col: (u, j) => (j < 3 ? PIL[j].color : ink2), spread: 4, weight: 0.5 }),
    pClusters({ list: [{ x: 960, y: 218, r: 90, col: red, sq: 0.25 }], weight: 0.25, swirl: 0.8 }),
    pAmbient({ weight: 0.2, alpha: 0.18 }),
  ],
  A: () => [payMap(), payoff(true)],
});

/* ---------- 16. 注意①: 最初から基盤を作るのはアンチパターン ---------- */
const NOTE16 = 'ここまで聞くと、「よし、うちも最初にこの3つの基盤を全部作ろう！」と思うかもしれません。でも、それは最大のアンチパターンです。私も最初からこれを作ったわけではなく、すべて「困ってから」作りました。何を共通化すべきかは、実際にアプリを2つ3つ作ってみるまでわかりません。最初から基盤を作ると、基盤づくりで力尽きて肝心のアプリが出てこなくなります。';
const H16 = () => Hd('注意①: 最初から基盤を作るのはアンチパターン');
scene({
  ch: 7, title: '「まず最強の基盤を作ろう！」', notes: NOTE16,
  P: [pClusters({ list: PIL.map(p => ({ x: p.cx, y: 560, r: 200, col: p.color, sq: 1.4 })), weight: 0.6, swirl: 0.15, size: 1.8, alpha: 0.5 }), pAmbient({ weight: 0.2, alpha: 0.2 })],
  A: () => [
    H16(),
    T('ab-q', '「よし、明日からまず[[blueInk!:最強の基盤]]を作ろう！」', { x: 60, y: 150, size: 54, weight: 800 }),
    T('ab-apps', 'アプリ: [[redInk!:0 個]]', { x: 1860, y: 158, size: 44, weight: 800, align: 'right', d: 0.8 }),
    PIL.map((p, i) => [
      B('pl' + i, { x: p.cx - 250, y: 260, w: 500, h: 620, r: 22, fill: p.pastel, stroke: ink, lw: 3, jit: 1.5 }),
      pilName(p, i, { y: 290, size: 40 }),
      pilGain(p, i, '設計中…\n設計中…\n設計中…', { y: 420, size: 40, color: ink3, lh: 1.8, d: 0.4 }),
    ]),
    T('yagni', 'YAGNI', { x: 960, y: 440, size: 230, weight: 900, color: red, align: 'center', rot: -0.14, glow: 20, d: 1.2, in: { alpha: 0, s: 2.4 }, dur: 0.5 }),
    T('ab-f', '絶対に失敗する ── 過剰設計で[[redInk!:肝心のアプリが1つも出てこない]]', { x: 960, y: 930, size: 52, weight: 800, align: 'center', d: 1.6 }),
  ],
});
const PAIN = [
  ['2つ目のアプリで、\nログインの重複に困ってから', '① 認証基盤'],
  ['10個を超えて、見た目のバラつきと\nプロンプトに疲れてから', '② デザインシステム'],
  ['遅さのせいで、\nフックを飛ばしたくなってから', '③ CI の高速化'],
];
const pnY = k => 220 + k * 180;
scene({
  ch: 7, title: '基盤はすべて「実際に困ってから」作った', notes: NOTE16,
  P: [pFlow({ paths: PAIN.map((_, k) => [[1130, pnY(k) + 65], [1250, pnY(k) + 65]]), speed: 140, col: (u, j) => PIL[j].color, spread: 5, weight: 0.4 }), pAmbient({ weight: 0.3, alpha: 0.2 })],
  A: () => [
    H16(),
    T('pn-k', '私の基盤もすべて「[[redInk!:実際に困ってから]]」作った', { x: 60, y: 126, size: 52, weight: 800 }),
    PAIN.map(([pain, base], k) => {
      const y = pnY(k), p = PIL[k], d = 0.3 + k * 0.25;
      return [
        iconLine('pn' + k, 'alert', yellowInk, 60, y + 6, pain, { size: 44, maxW: 1000, d, lh: 1.35 }),
        arrow('pn-a' + k, 1130, y + 65, 1240, y + 65, { d: d + 0.15 }),
        B('pl' + k, { x: 1260, y, w: 600, h: 130, r: 22, fill: p.pastel, stroke: ink, lw: 3, md: k * 0.08 }),
        T('pl' + k + 'l', base, { x: 1560, y: y + 36, size: 44, weight: 800, align: 'center', md: k * 0.08 }),
      ];
    }),
    dot('pn-b0', 60, 790, '何が共通になるかは、2〜3個作るまで[[redInk!:絶対にわからない]]', { size: 48, weight: 800, d: 1.2 }),
    dot('pn-b1', 60, 900, '最初から作ると過剰設計で、肝心のアプリが出てこない', { size: 42, color: ink2, d: 1.4 }),
  ],
});

/* ---------- 17. 注意②: 最初のコードは汚くていい ---------- */
const NOTE17 = 'もう1つ伝えたいのは、「最初のコードは汚くて構わない」ということです。デザインシステムも最初は1つのアプリに shadcn を入れただけでしたし、後から別リポジトリに切り出して5つのアプリを一気に移行しました。AI エージェントがいる今、後からコードを綺麗にするコストは劇的に下がっています。ただし、安心して大改造できるのは、壊した瞬間に気づけるテストと高速な CI というハーネスがあるからです。';
const H17 = () => Hd('注意②: 最初のコードは汚くていい（後から綺麗にする）');
const EVO = [
  ['2026-04', '`accounts` に\n`shadcn/ui` を入れただけ'],
  ['2026-07', 'ナビやテーマ切り替えを\nアプリ間で少しずつ共有'],
  ['2026-10-05', '独立リポジトリに切り出し\n5アプリを一度に移行'],
];
const evX = i => 60 + i * 620;
function evoDiagram(i) {
  const x = evX(i), y = 230, d = 0.3 + i * 0.5, o = { d };
  if (i === 0) return [
    B('ev0-a', { x: x + 60, y: y + 30, w: 440, h: 230, r: 20, fill: panel, stroke: ink, lw: 2.5, ...o }),
    T('ev0-at', 'accounts', { x: x + 90, y: y + 50, size: 34, font: 'mono', weight: 700, ...o }),
    card('ev0-s', { x: x + 90, y: y + 140, w: 240, h: 76, r: 16, fill: pYellow, stroke: ink, lw: 2, d: d + 0.2 }, 'shadcn/ui', { size: 30, font: 'mono' }),
  ];
  if (i === 1) return [
    [0, 1, 2].map(k => card('ev1-a' + k, { x: x + 20 + k * 180, y: y + 30, w: 160, h: 230, r: 18, fill: panel, stroke: ink, lw: 2, d: d + k * 0.08 }, '', {})),
    [0, 1, 2].map(k => B('ev1-s' + k, { x: x + 40 + k * 180, y: y + 150, w: 120, h: 44, r: 10, fill: pYellow, stroke: ink, lw: 1.5, d: d + 0.3 + k * 0.08 })),
    [0, 1].map(k => L('ev1-l' + k, [[x + 160 + k * 180, y + 172], [x + 220 + k * 180, y + 172]], { color: yellowInk, lw: 3, dash: 6, d: d + 0.5 })),
    T('ev1-t', 'ナビ・テーマ', { x: x + 290, y: y + 204, size: 28, align: 'center', color: ink2, d: d + 0.5 }),
  ];
  const cx = x + 280, cy = y + 145;
  return [
    [0, 1, 2, 3, 4].map(k => {
      const a = -Math.PI / 2 + (k - 2) * 0.62, ax = cx + Math.cos(a + Math.PI) * 0 + Math.cos(a) * 210, ay = cy + 60 + Math.sin(a) * 150;
      return [
        L('ev2-l' + k, [[cx, cy + 30], [ax, ay + 18]], { color: ink, lw: 2.5, d: d + 0.3 + k * 0.08 }),
        B('ev2-a' + k, { x: ax - 40, y: ay, w: 80, h: 36, r: 10, fill: panel, stroke: ink, lw: 2, d: d + 0.3 + k * 0.08 }),
      ];
    }),
    card('ev2-ds', { x: cx - 160, y: cy, w: 320, h: 84, r: 20, fill: pYellow, stroke: ink, lw: 3, d }, 'design-system', { size: 32, font: 'mono' }),
    T('ev2-t', '独立リポジトリ', { x: cx, y: cy + 100, size: 28, align: 'center', color: ink2, d: d + 0.2 }),
  ];
}
function evo() {
  return [
    EVO.map(([date, t], i) => [
      T('ev-d' + i, date, { x: evX(i) + 10, y: 160, size: 38, font: 'mono', weight: 700, color: yellowInk, d: 0.2 + i * 0.5 }),
      evoDiagram(i),
      T('ev-t' + i, t, { x: evX(i) + 10, y: 520, size: 40, weight: 800, lh: 1.4, d: 0.4 + i * 0.5 }),
      i < 2 ? arrow('ev-a' + i, evX(i) + 560, 375, evX(i) + 620, 375, { d: 0.6 + i * 0.5 }) : null,
    ]),
  ];
}
scene({
  ch: 7, title: 'design-system も最初は shadcn/ui を入れただけ', notes: NOTE17,
  P: [pFlow({ paths: [[[620, 375], [680, 375]], [[1240, 375], [1300, 375]]], speed: 120, col: yellow, spread: 6, weight: 0.3 }), pAmbient({ weight: 0.4, alpha: 0.2 })],
  A: () => [
    H17(), evo(),
    dot('ev-b', 60, 676, 'ディレクトリ構成も、後から feature-first に作り直した', { size: 42, d: 1.8 }),
  ],
});
scene({
  ch: 7, title: 'リファクタリングは安い。ただしハーネスが前提', notes: NOTE17,
  P: [pRects({ rects: [{ x: 60, y: 790, w: 1800, h: 230 }], speed: 220, col: green, size: 2, alpha: 0.8, weight: 0.5 }), pAmbient({ weight: 0.3, alpha: 0.2 })],
  A: () => [
    H17(), evo(),
    dot('ev-b', 60, 676, 'ディレクトリ構成も、後から feature-first に作り直した', { size: 42 }),
    B('ev-box', { x: 60, y: 790, w: 1800, h: 230, r: 26, fill: pGreen, stroke: ink, lw: 3, d: 0.1 }),
    T('ev-m', 'AI がいる今、後から綺麗にするコストは[[greenInk!:圧倒的に安い]]', { x: 110, y: 816, size: 54, weight: 900, maxW: 1700, d: 0.3 }),
    iconLine('ev-m2', 'shield', ink, 110, 920, 'ただし「[[redInk!:壊したら1分で気づけるテストと CI]]」が大前提', { size: 44, maxW: 1680, d: 0.7 }),
  ],
});

/* ---------- 18. まとめ ---------- */
const NOTE18 = 'まとめです。認証認可基盤、デザインシステム、そして高速な CI と Skills というハーネスを整えると、新しいアプリは2〜3時間で本番品質になります。でも、最初から全部を作る必要はありません。まずは目の前の「困った」を解決する1つ目のアプリを作り、痛みがわかってから1つずつ基盤にしていく。皆さんの身の回りの「困った」も、ぜひこのサイクルで内製化して解決してみてください。ありがとうございました！';
const SUM_GAIN = [
  'ログインと権限が\n数行で手に入る',
  '注文しなくても\n統一された UI に',
  '壊れたコードは\nコミットできない',
];
const SUM_CAPS = [
  '`accounts.gdgs.jp`\n`initializeRpAuth`',
  '`DESIGN.md`\nUI 規約チェッカー',
  '1秒〜1分の pre-commit CI\nAgent Skills',
];
scene({
  ch: 8, title: 'まとめ: 持ち帰ってほしい3つの軸', notes: NOTE18,
  P: mapP(ALL),
  A: () => [
    map({ hd: 'まとめ: 持ち帰ってほしい3つの軸', ...ALL, noMini: 1, capText: SUM_CAPS }),
    PIL.map((p, i) => pilGain(p, i, SUM_GAIN[i], { size: 44, d: 0.4 + i * 0.15 })),
  ],
});
// 右隣の領域（カメラがパンする）
const OX = 1920;
const CYC = [
  ['目の前の「困った」を解決する1つ目を\n[[redInk!:汚くてもいいから作る]]', red],
  ['2個目、10個目で痛みがわかってから\n[[blueInk!:基盤（ハーネス）として切り出す]]', cool],
  ['すると次のアプリは\n「[[greenInk!:2〜3時間で本番品質]]」になる', green],
];
const RING = { x: OX + 1560, y: 470, r: 190 };
const RING_N = [['1つ目を作る', red, -90], ['基盤に切り出す', cool, 30], ['次は2〜3時間', green, 150]];
scene({
  ch: 8, title: 'まとめ: 「困った」から始めるサイクル', notes: NOTE18, cam: { x: OX + 960, y: 540, z: 1 },
  P: [
    pRing({ x: RING.x, y: RING.y, r: RING.r, w: 24, speed: 0.4, size: 2.4, alpha: 0.9, weight: 0.7, col: u => [red, cool, green][Math.floor(((u + 0.25) % 1) * 3)] }),
    pAmbient({ x: OX, weight: 0.3, alpha: 0.2 }),
  ],
  A: () => [
    Hd('まとめ: 「困った」から始めるサイクル'),
    CYC.map(([t, c], i) => {
      const y = 190 + i * 190, d = 0.5 + i * 0.3;
      return [
        C('cy' + i + 'c', { x: OX + 110, y: y + 50, r: 50, fill: c, stroke: ink, lw: 3, d }),
        T('cy' + i + 'n', String(i + 1), { x: OX + 110, y: y + 20, size: 44, weight: 900, color: '#ffffff', align: 'center', d }),
        T('cy' + i, t, { x: OX + 190, y: y - 8, size: 44, weight: 800, lh: 1.4, d: d + 0.05 }),
      ];
    }),
    C('ring', { x: RING.x, y: RING.y, r: RING.r, stroke: ink, strokeA: 0.25, lw: 2, in: { reveal: 0 }, dur: 1.4, d: 0.3 }),
    I('ring-i', 'loop', { x: RING.x, y: RING.y, size: 80, color: ink2, lw: 1.8, d: 0.6 }),
    RING_N.map(([t, c, deg], i) => {
      const a = (deg * Math.PI) / 180;
      return pill('rn' + i, RING.x + Math.cos(a) * RING.r, RING.y + Math.sin(a) * RING.r - 30, t, { align: 'center', fill: panel, stroke: c, lw: 3, d: 0.8 + i * 0.2 }, { size: 34 });
    }),
    T('thx', 'ありがとうございました！', { x: OX + 960, y: 830, size: 68, weight: 900, align: 'center', d: 1.6 }),
    T('thx-s', '皆さんの「困った」も、ぜひこのサイクルで内製化してみてください', { x: OX + 960, y: 940, size: 42, weight: 700, color: ink2, align: 'center', d: 1.8 }),
  ],
});

/* ---------- 参考資料 ---------- */
const REFS = [
  ['gdg-jp/design-system', 'https://github.com/gdg-jp/design-system'],
  ['mattpocock/skills（wayfinder、grilling、grill-with-docs）', 'https://github.com/mattpocock/skills'],
  ['Cloudflare workers-oauth-provider', 'https://github.com/cloudflare/workers-oauth-provider'],
  ['Cloudflare Realtime', 'https://developers.cloudflare.com/realtime/'],
  ['dub.co', 'https://dub.co/pricing'],
];
const OY = 1080;
scene({
  ch: 8, title: '参考資料', notes: '', cam: { x: OX + 960, y: OY + 540, z: 1 },
  P: [pRing({ x: OX + 1640, y: OY + 820, r: 130, w: 44, speed: 0.07, size: 2.4, alpha: 0.9, col: u => GDG4[Math.floor(u * 4) % 4] }), pAmbient({ x: OX, y: OY, weight: 0.3, alpha: 0.2 })],
  A: () => [
    Hd('参考資料'),
    REFS.map(([t, url], i) => {
      const y = OY + 160 + i * 150, d = 0.1 + i * 0.08;
      return [
        T('rf' + i + 't', t, { x: OX + 60, y, size: 42, weight: 800, d }),
        T('rf' + i + 'u', url, { x: OX + 60, y: y + 62, size: 32, font: 'mono', color: blueInk, d }),
      ];
    }),
    IMG('gdg', ASSET('gdg.svg'), { x: OX + 1580, y: OY + 760, w: 120, h: 120, r: 0, bare: 1, d: 0.4 }),
    T('rf-me', 'ゆにねこ / GDG Greater Kwansai', { x: OX + 1860, y: OY + 980, size: 34, font: 'mono', color: ink2, align: 'right', d: 0.5 }),
  ],
});

/* ---------- お知らせ: DevFest GDGoC Japan Hackathon 2026（参考資料の右隣へパン） ---------- */
const HX = OX + 1920, HY = OY;
const HACK_FACTS = [['18歳以上の学生', 'コーディング経験は不問'], ['2〜4名のチーム（1人でもOK）', 'Google Cloud / Gemini'], ['東京・大阪・名古屋 + オンライン']];
const HACK_DAYS = [
  ['11.01', 'キックオフ', pBlue],
  ['11.05–10', '開発期間', pGreen],
  ['11.14', 'Regional Day', pYellow],
  ['11.27', 'Demo Day', pRed],
];
const QR = { x: HX + 1490, y: HY + 120, s: 340 };
img(ASSET('qr-hackathon.png')); img(IMGP('19-hackathon.webp'));
scene({
  ch: 9, title: 'お知らせ: DevFest GDGoC Japan Hackathon 2026', cam: { x: HX + 960, y: HY + 540, z: 1 },
  notes: '最後に、学生の方へお知らせです。11月に DevFest GDGoC Japan Hackathon 2026 を開催します。日本国内の大学・大学院・高専・専門学校に在籍する18歳以上の学生なら、2〜4名のチームでも、1人でも応募でき、コーディング経験は問いません。Google Cloud と Gemini を使って6日間でプロダクトをつくります。11月14日の Regional Day は東京・大阪・名古屋とオンラインで同日開催、予選を勝ち抜いた Top 10 チームは、11月27日に Google 渋谷オフィスで開かれる Demo Day に進みます。優勝チームは11月29日の GDG DevFest Tokyo で LT 登壇と展示ができます。参加受付は11月4日（水）までです。ぜひ QR から応募してください。',
  P: [
    pRects({ rects: [{ x: QR.x - 20, y: QR.y - 20, w: QR.s + 40, h: QR.s + 40 }], speed: 200, col: u => GDG4[Math.floor(u * 4) % 4], size: 2.4, alpha: 0.9, weight: 0.5 }),
    pAmbient({ x: HX, y: HY, weight: 0.35, alpha: 0.22 }),
  ],
  A: () => [
    Hd('お知らせ: 学生向けハッカソンの参加者を募集中！'),
    pill('hk-k', HX + 60, HY + 134, 'STUDENT HACKATHON · NOV 2026', { fill: COL.yellow, d: 0.2 }, { size: 30, font: 'mono' }),
    T('hk-t0', 'DevFest', { x: HX + 52, y: HY + 200, size: 150, weight: 900, color: cool, d: 0.3, in: { alpha: 0, dx: -60 } }),
    T('hk-t1', 'GDGoC Japan Hackathon 2026', { x: HX + 60, y: HY + 386, size: 64, weight: 800, d: 0.45 }),
    HACK_FACTS.map((row, r) => pillRow('hk-f' + r + '_', row, HX + 60, HY + 500 + r * 76, { d: 0.6 + r * 0.15, gap: 12 }, { size: 32 })),
    HACK_DAYS.map(([date, name, fill], i) => {
      const x = HX + 60 + i * 290, y = HY + 748, d = 1.0 + i * 0.12;
      return [
        B('hk-d' + i, { x, y, w: 274, h: 140, r: 20, fill, stroke: ink, lw: 2.5, d, in: { alpha: 0, dy: 40 } }),
        T('hk-d' + i + 'd', date, { x: x + 22, y: y + 14, size: 46, weight: 900, d }),
        T('hk-d' + i + 't', name, { x: x + 22, y: y + 82, size: 34, weight: 800, d }),
      ];
    }),
    T('hk-top', '予選を勝ち抜いた Top 10 は [[blueInk!:Google 渋谷オフィス]]の Demo Day へ', { x: HX + 60, y: HY + 910, size: 40, weight: 900, d: 1.6 }),
    T('hk-win', '優勝チームは 11.29 GDG DevFest Tokyo で LT 登壇・展示', { x: HX + 60, y: HY + 984, size: 36, weight: 700, color: ink2, d: 1.8 }),
    B('hk-qrb', { x: QR.x - 20, y: QR.y - 20, w: QR.s + 40, h: QR.s + 40, r: 28, fill: panel, stroke: ink, lw: 3, d: 0.6, in: { alpha: 0, s: 0.7 } }),
    IMG('hk-qr', ASSET('qr-hackathon.png'), { x: QR.x, y: QR.y, w: QR.s, h: QR.s, r: 0, bare: 1, d: 0.7, in: { alpha: 0, s: 0.7 } }),
    T('hk-url', 'df-hack26.gdgs.jp', { x: QR.x + QR.s / 2, y: QR.y + QR.s + 34, size: 36, font: 'mono', weight: 700, align: 'center', d: 0.9 }),
    T('hk-dl', '参加受付 11.04（水）まで', { x: QR.x + QR.s / 2, y: QR.y + QR.s + 90, size: 40, weight: 900, color: redInk, align: 'center', d: 1.1 }),
    IMG('hk-site', IMGP('19-hackathon.webp'), { x: HX + 1340, y: HY + 670, w: 530, h: 530 * 1305 / 2000, r: 0, bare: 1, d: 0.4 }),
  ],
});
