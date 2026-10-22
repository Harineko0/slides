'use strict';
/* =========================================================================
 * scenes-2.js — 事例: LayerX
 * 引用スライド画像はカード 1 枚（id: cite）で持ち回り、src の差し替えはクロスフェードする。
 * ========================================================================= */
const SPK = n => `https://files.speakerdeck.com/presentations/eb69dc3445db4a84b586a93baf79e8b5/slide_${n - 1}.jpg`;
const P1_TITLE = '橋本 哲勇（LayerX）「デザインハーネス：専門職の判断基準をコードのように運用する」Bet AI Day 2026';
function cite(page, big) {
  return big
    ? [
      IMG('cite', SPK(page), { x: 60, y: 200, w: 880, h: 495, r: 16, d: 0.1 }),
      T('cite-cap', `出典: ${P1_TITLE}, p.${page}`, { x: 60, y: 712, size: 22, color: ink3, maxW: 880, lh: 1.55, d: 0.3 }),
    ]
    : [
      IMG('cite', SPK(page), { x: 1480, y: 796, w: 380, h: 214, r: 12 }),
      T('cite-cap', `出典: 橋本 哲勇（LayerX）Bet AI Day 2026, p.${page}`, { x: 1860, y: 1018, size: 18, color: ink3, align: 'right' }),
    ];
}

/* ---------- 9. 事例: LayerX のデザインハーネス ---------- */
const TRIAD = [
  ['判断', warm, 'pen', 'Markdown で記述した判断基準\n（ルール ID・重要度付き）', '≒ 制約・文脈'],
  ['事実', cool, 'plug', 'デザインシステム MCP\n（公式コンポーネント・既定値を AI が直接参照）', '≒ 制約'],
  ['改善', green, 'chart', '採点基準とテストケースで、\n回答品質を継続的に再測定', '≒ 検証・フィードバック'],
];
const triY = i => 200 + i * 282;
scene({
  ch: 3, title: '事例: LayerX のデザインハーネス',
  notes: 'ここからは、先行してデザインハーネスを本格運用している LayerX さんの事例をご紹介します。この「判断・事実・改善」という3要素は、先ほど説明した4つの責務と綺麗に対応しています。',
  P: [pClusters({ list: TRIAD.map(([, c], i) => ({ x: 1066, y: triY(i) + 131, r: 64, col: c })), weight: 0.55, swirl: 0.6 }), pAmbient({ weight: 0.3, alpha: 0.2 })],
  A: () => [
    Hd('事例: LayerX のデザインハーネス'),
    T('case-k', 'CASE STUDY — LayerX（バクラク）DesignOps の実践事例 [P1]', { x: 990, y: 150, size: 24, font: 'mono', color: cool }),
    cite(13, true),
    TRIAD.map(([t, c, ic, desc, map], i) => {
      const y = triY(i), d = 0.4 + i * 0.2;
      return [
        B('tr' + i, { x: 990, y, w: 870, h: 262, r: 20, fill: panel, fillA: 0.85, stroke: c, strokeA: 0.45, lw: 2.5, d }),
        I('tr' + i + 'i', ic, { x: 1066, y: y + 131, size: 48, color: c, d }),
        T('tr' + i + 't', t, { x: 1136, y: y + 28, size: 52, weight: 800, color: c, d }),
        T('tr' + i + 'm', map, { x: 1830, y: y + 42, size: 26, font: 'mono', color: ink2, align: 'right', d: d + 0.2 }),
        T('tr' + i + 'd', desc, { x: 1136, y: y + 116, size: 30, color: ink, maxW: 700, lh: 1.5, d: d + 0.05 }),
      ];
    }),
  ],
});

/* ---------- 10. 事例: 感覚をルールに翻訳する ---------- */
const NOTE10 = 'エンジニアから見れば、これはまさに lint ルールの定義そのものです。各ルールに固有の ID があることで、コードレビューでの指摘がどの規約に基づいているのかを一意に追跡できるようになります。';
function rule10(on) {
  const a = on ? 1 : 0;
  return [
    B('rule', { x: 60, y: 350, w: 1300, h: 310, r: 22, fill: panel, stroke: cool, lw: 3, alpha: a, d: 0.4 }),
    T('rule-id', on ? 'DSU-COLOR-001' : '#############', { x: 108, y: 386, size: 52, weight: 700, font: 'mono', color: cool, alpha: a, fxs: 'scramble', mdur: 1.4, md: 0.4 }),
    card('rule-sev', { x: 1150, y: 390, w: 164, h: 66, r: 33, fill: red, fillA: 0.12, stroke: red, alpha: a, d: 1.2 }, 'MUST', { size: 30, font: 'mono', color: red, weight: 700 }),
    T('rule-d', 'カラーコードのベタ書き禁止、定義トークンで指定', { x: 108, y: 480, size: 50, weight: 800, alpha: a, d: 0.9 }),
    T('rule-ex', nolig('color: #3B82F6;  →  color: var(--color-primary);'), { x: 108, y: 580, size: 30, font: 'mono', color: ink3, alpha: a, d: 1.1 }),
  ];
}
scene({
  ch: 3, title: '事例: 感覚をルールに翻訳する — 感覚のまま', notes: NOTE10,
  P: [pCloud({ x: 800, y: 400, rx: 700, ry: 190, col: warm, swirl: 0.5, size: 2.2, alpha: 0.6, weight: 0.8 }), pAmbient({ weight: 0.2, alpha: 0.2 })],
  A: () => [
    Hd('事例: 感覚をルールに翻訳する'),
    T('sense', '×「なんか色が合っていない気がする」', { x: 800, y: 330, size: 80, weight: 800, color: warm, align: 'center', jit: 3 }),
    T('sense-s', 'デザイナーの感覚のまま ── 観察も再現もできない', { x: 800, y: 470, size: 36, color: ink3, align: 'center', d: 0.4 }),
    rule10(false),
    cite(14, false),
  ],
});
scene({
  ch: 3, title: '事例: 感覚をルールに翻訳する — ID と強度', notes: NOTE10,
  P: [pRects({ rects: [{ x: 60, y: 350, w: 1300, h: 310 }], speed: 180, col: cool, size: 2, alpha: 0.8, weight: 0.7 }), pAmbient({ weight: 0.3, alpha: 0.2 })],
  A: () => [
    Hd('事例: 感覚をルールに翻訳する'),
    T('sense', '×「なんか色が合っていない気がする」', { x: 710, y: 158, size: 44, weight: 700, color: ink3, align: 'center' }),
    L('tr-a', [[710, 238], [710, 336]], { color: cool, lw: 3.5, head: 16, d: 0.2 }),
    T('tr-l', '観察できる条件に翻訳', { x: 740, y: 266, size: 28, font: 'mono', color: cool, d: 0.3 }),
    rule10(true),
    [['tg0', 'ルール ID を付与', cool], ['tg1', '重要度 MUST / SHOULD / MAY を明示', cool], ['tg2', '≒ lint ルールの定義そのもの', warm]].map(([id, t, c], i, arr) => {
      const x = 60 + arr.slice(0, i).reduce((s, e) => s + tw(e[1], 34, 700) + 68, 0);
      return card(id, { x, y: 700, w: tw(t, 34, 700) + 48, h: 76, r: 38, fill: panel2, stroke: c, strokeA: 0.6, d: 1.4 + i * 0.15 }, t, { size: 34, color: c });
    }),
    cite(14, false),
  ],
});

/* ---------- 11. 事例: 根拠がなければ「評価不可」と答える ---------- */
const EVAL = [
  ['色の指定', '根拠: `DSU-COLOR-001`', '✓ 評価済み', green],
  ['余白の取り方', '根拠: 該当ルールなし', '評価不可', gray],
  ['一般的な UX 論での補完', '勝手に隙間を埋めない', 'しない', red],
];
scene({
  ch: 3, title: '事例: 根拠がなければ「評価不可」と答える',
  notes: 'AI がもっともらしい一般論で勝手に隙間を埋めてしまうと、どこまで AI に任せて安全なのかが分からなくなります。「評価不可」として記録された項目こそが、チームが次に整備すべきルールのバックログになります。',
  P: [pClusters({ list: [{ x: 1560, y: 305, r: 84, col: warm, sq: 0.4 }], weight: 0.3, swirl: 0.5 }), pAmbient({ weight: 0.4, alpha: 0.2 })],
  A: () => [
    Hd('事例: 根拠がなければ「評価不可」と答える'),
    B('rp', { x: 60, y: 160, w: 1160, h: 500, r: 22, fill: panel, stroke: line }),
    T('rp-t', 'AI デザインレビュー結果', { x: 96, y: 182, size: 24, font: 'mono', color: ink3 }),
    EVAL.map(([k, basis, st, c], i) => {
      const y = 250 + i * 134, d = 0.2 + i * 0.3, sw = tw(st, 30, 800) + 56;
      return [
        L('ev' + i + 'l', [[96, y - 16], [1184, y - 16]], { color: line, lw: 1.5, d }),
        T('ev' + i + 'k', k, { x: 96, y: y + 2, size: 40, weight: 700, d }),
        T('ev' + i + 'b', basis, { x: 96, y: y + 64, size: 30, color: ink2, d: d + 0.1 }),
        card('ev' + i + 's', { x: 1184 - sw, y: y + 26, w: sw, h: 68, r: 34, fill: c, fillA: 0.12, stroke: c, d: d + 0.2 }, st, { size: 30, weight: 800, color: c }),
      ];
    }),
    B('bl', { x: 1260, y: 160, w: 600, h: 500, r: 22, fill: panel, fillA: 0.6, stroke: line, dash: 8, d: 0.6 }),
    T('bl-t', 'ルール整備のバックログ', { x: 1294, y: 182, size: 24, font: 'mono', color: ink3, d: 0.6 }),
    card('bl-c', { x: 1294, y: 240, w: 532, h: 130, r: 16, fill: COL.warmBg, stroke: warm, d: 1.3, in: { alpha: 0, dx: -560 }, dur: 1.0 }, '不足ルール候補:\n余白トークン規定の未整備', { size: 32, color: warm, y: 260 }),
    B('bl-c1', { x: 1294, y: 394, w: 532, h: 96, r: 16, fill: panel2, alpha: 0.6, d: 0.8 }),
    B('bl-c2', { x: 1294, y: 510, w: 532, h: 96, r: 16, fill: panel2, alpha: 0.35, d: 0.9 }),
    T('ev-b0', '該当ルールが無い観点は「評価不可」── 一般的な UX 論で勝手に補完しない', { x: 60, y: 700, size: 36, weight: 600, maxW: 1390, d: 1.6 }),
    T('ev-b1', '不足しているルールの候補を同時に提示（例: 余白トークン規定の未整備）', { x: 60, y: 776, size: 36, weight: 600, maxW: 1390, d: 1.75 }),
    T('ev-b2', '回答の放棄ではなく、ハーネス自身の[[cool!:カバレッジの限界]]を明示する仕組み', { x: 60, y: 852, size: 36, weight: 600, maxW: 1390, d: 1.9 }),
    cite(18, false),
  ],
});

/* ---------- 12. 事例: 知識はコードと同じように動く ---------- */
const NOTE12 = 'これこそが「知識をコードのように運用する」運用の実態です。ここまでの思想を踏まえて、自分たちのプロジェクトでどのようにこの仕組みを構築できるのか、具体的なアーキテクチャを見ていきましょう。';
const PIPE = [['chart', '利用ログ分析'], ['gap', 'ギャップ検出'], ['pr', '改善 PR 作成'], ['eye', '人間レビュー'], ['merge', 'マージ']];
const pipeX = i => 172 + i * 295;
const PY = 360, TMX = 1720;
const TEAM = [230, 330, 430, 530];
const PIPE_PATHS = [
  [[pipeX(0), PY], [pipeX(4), PY]],
  ...TEAM.map(y => bez([pipeX(4), PY], [pipeX(4) + 170, PY], [TMX - 150, y], [TMX, y], 16)),
  rp([[TMX, 566], [TMX, 640], [pipeX(0), 640], [pipeX(0), 434]], 30),
];
function pipeline(dim) {
  const a = dim ? 0.75 : 1;
  return [
    L('pp-main', [[pipeX(0) + 72, PY], [pipeX(4) - 72, PY]], { color: ink3, lw: 3, alpha: a, d: 0.1, dur: 1.4, ease: 'inout' }),
    PIPE.map(([ic, t], i) => [
      C('pp' + i, { x: pipeX(i), y: PY, r: 70, fill: panel2, stroke: i === 3 ? yellow : cool, lw: 3, alpha: a, d: 0.15 + i * 0.22 }),
      I('pp' + i + 'i', ic, { x: pipeX(i), y: PY, size: 52, color: i === 3 ? yellow : cool, alpha: a, d: 0.15 + i * 0.22 }),
      T('pp' + i + 't', t, { x: pipeX(i), y: PY + 86, size: 34, weight: 700, align: 'center', alpha: a, d: 0.2 + i * 0.22 }),
    ]),
    TEAM.map((y, i) => [
      L('tm' + i + 'l', PIPE_PATHS[1 + i], { color: ink3, lw: 2.5, alpha: a, d: 1.3 + i * 0.06 }),
      C('tm' + i, { x: TMX, y, r: 36, fill: panel2, stroke: green, lw: 2.5, alpha: a, d: 1.5 + i * 0.08 }),
      I('tm' + i + 'i', 'bot', { x: TMX, y, size: 34, color: green, alpha: a, d: 1.5 + i * 0.08 }),
    ]),
    T('tm-t', 'チーム全員の AI', { x: TMX, y: 150, size: 28, font: 'mono', color: green, align: 'center', alpha: a, d: 1.7 }),
    L('pp-back', PIPE_PATHS[5], { color: ink3, lw: 2.5, dash: 9, flow: 24, head: 14, alpha: a * 0.8, d: 1.8, dur: 1.2 }),
    T('pp-back-t', '使われるほどログが貯まり、次の改善へ', { x: 900, y: 654, size: 28, font: 'mono', color: ink3, align: 'center', alpha: a, d: 2.0 }),
  ];
}
scene({
  ch: 3, title: '事例: 知識はコードと同じように動く', notes: NOTE12,
  P: [pFlow({ paths: PIPE_PATHS, speed: 220, col: (u, j) => (j >= 1 && j <= 4 ? green : cool), spread: 5, weight: 0.75 }), pAmbient({ weight: 0.25, alpha: 0.2 })],
  A: () => [
    Hd('事例: 知識はコードと同じように動く'), pipeline(false),
    T('kx', 'ルールがマージされた瞬間、[[green!:チーム全員の AI の挙動]]に反映される', { x: 60, y: 730, size: 46, weight: 700, d: 2.2 }),
    cite(19, false),
  ],
});
const STATS = [
  ['ルール定義', '{n} ファイル', 5, '約 1,600 行'],
  ['判定単位', '約 {n}', 37, ''],
  ['AI レビュー付き PR', '{n} 件', 339, '累計'],
  ['AI 指摘で修正・再パス', '{n}%', 37, '直近 111 件中'],
];
scene({
  ch: 3, title: '事例: 登壇時点での運用規模', notes: NOTE12,
  P: [pFlow({ paths: PIPE_PATHS, speed: 220, col: (u, j) => (j >= 1 && j <= 4 ? green : cool), spread: 5, weight: 0.6 }), pAmbient({ weight: 0.25, alpha: 0.2 })],
  A: () => [
    Hd('事例: 知識はコードと同じように動く'), pipeline(true),
    T('kx', 'ルールがマージされた瞬間、[[green!:チーム全員の AI の挙動]]に反映される', { x: 60, y: 712, size: 38, weight: 700 }),
    T('st-l', '登壇時点での運用規模 [P1]', { x: 60, y: 776, size: 24, font: 'mono', color: ink3, d: 0.1 }),
    STATS.map(([k, v, n, sub], i) => {
      const x = 60 + i * 350, d = 0.2 + i * 0.15;
      return [
        B('st' + i, { x, y: 816, w: 330, h: 214, r: 20, fill: panel, stroke: line, d }),
        T('st' + i + 'k', k, { x: x + 26, y: 834, size: 26, color: ink2, d }),
        T('st' + i + 'v', v, { x: x + 26, y: 874, size: 62, weight: 800, font: 'sans', color: i === 3 ? green : ink, num: n, in: { alpha: 0, num: 0 }, dur: 1.6, d }),
        T('st' + i + 's', sub, { x: x + 26, y: 980, size: 24, color: ink3, d: d + 0.3 }),
      ];
    }),
    cite(19, false),
  ],
});
