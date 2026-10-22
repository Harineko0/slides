'use strict';
/* =========================================================================
 * scenes-3.js — スキル紹介 / 使った結果 / まとめ / 参考資料
 * ========================================================================= */

/* ---------- 19. build-design-harness スキルを作った ---------- */
// 4 ステップを時計回りの 2x2 に置き、その周りをパーティクルが巡回する
const G19 = [[900, 310], [1420, 310], [1420, 690], [900, 690]];
const L19 = [
  ['1', '信頼できる情報源', 'DESIGN.md・トークン・\n契約・ルール'],
  ['2', '自動検査', 'CLI / MCP / CI で同一チェッカー'],
  ['3', 'MCP & Skills', 'build / review / improve'],
  ['4', '指摘 → 提案 → 承認', '次のタスクへ即時反映'],
];
const LOOP19 = rp([[1120, 395], [1640, 395], [1640, 775], [1120, 775], [1120, 395]], 90);
scene({
  ch: 5, title: 'build-design-harness スキルを作った',
  notes: '最初から全社展開を目指すのではなく、まずは「1 つのフローを一気通貫で完走させる」ことを最優先に設計しています。PKSHA さんの導入事例 [E1-C] でも、まずは小さく検証してから横展開するアプローチが取られています。',
  P: [pFlow({ paths: [LOOP19], speed: 170, col: u => mixc(cool, green, u), spread: 9, weight: 0.7 }), pAmbient({ weight: 0.3, alpha: 0.2 })],
  A: () => [
    T('sk-k', 'SKILL', { x: 60, y: 36, size: 28, font: 'mono', color: cool }),
    T('sk-t', 'build-design-harness', { x: 56, y: 76, size: 96, font: 'mono', weight: 700, in: { reveal: 0 }, dur: 1.1, ease: 'linear', caret: 1 }),
    T('sk-p', '目的: デザインハーネス・アーキテクチャを手軽に検証・導入する', { x: 60, y: 228, size: 38, color: ink2, d: 0.6 }),
    dot('sk-b0', 60, 320, '既存資産を調査し、\n再利用できる要素・不足している要素を洗い出す', { maxW: 780, d: 0.9 }),
    dot('sk-b1', 60, 440, '1 つの代表的なユースケースで、\nサイクル全体を一気通貫で接続（右図）', { maxW: 780, d: 1.05 }),
    dot('sk-b2', 60, 560, 'すぐ動かせるスターターキット同梱\n（Node.js 22+・公式 MCP SDK 対応）', { maxW: 780, d: 1.2 }),
    dot('sk-b3', 60, 680, '先行事例（登壇・各社の実践記事・\n公開リポジトリ）を設計に集約\n`docs/references/design-harness.md`', { maxW: 780, d: 1.35, lh: 1.5 }),
    L('lp', LOOP19, { color: cool, lw: 2, alpha: 0.35, dur: 1.2, d: 0.4 }),
    [[1346, 395, 1414, 395], [1640, 486, 1640, 684], [1414, 775, 1346, 775], [1120, 684, 1120, 486]].map(([x0, y0, x1, y1], i) =>
      L('lpa' + i, [[x0, y0], [x1, y1]], { color: ink3, lw: 3, head: 13, d: 1.0 + i * 0.25 })),
    T('lp-t', '1 フローを\n一気通貫', { x: 1380, y: 540, size: 30, weight: 800, align: 'center', color: ink2, d: 1.8 }),
    L19.map(([n, t, sub], i) => {
      const [x, y] = G19[i], d = 0.8 + i * 0.25, c = i === 3 ? yellow : cool;
      return [
        B('lp' + i, { x, y, w: 440, h: 170, r: 18, fill: panel2, stroke: c, lw: 2.5, d }),
        T('lp' + i + 'n', n, { x: x + 28, y: y + 24, size: 30, font: 'mono', weight: 700, color: c, d }),
        T('lp' + i + 't', t, { x: x + 70, y: y + 22, size: 34, weight: 800, d }),
        T('lp' + i + 's', sub, { x: x + 70, y: y + 82, size: 24, color: ink2, maxW: 350, lh: 1.4, d: d + 0.05 }),
      ];
    }),
    T('sk-c', 'まず「[[cool!:1 つのフローを一気通貫で完走させる]]」ことを最優先に ── 小さく検証してから横展開 [E1-C]', { x: 60, y: 958, size: 36, weight: 700, maxW: 1800, d: 2.0 }),
  ],
});

/* ---------- 20. 試し方 ---------- */
const CMDS = `# デザインハーネスを導入したいリポジトリで
npx skills add mitame-ai/skills --skill build-design-harness
claude  # Codex などでも可`;
// エージェントへの入力行（sh() は全行に $ を付けるので別途組み立てる）
const TRY_LINES = [...sh(CMDS), [], [
  ['> ', SYN.prompt], ['/build-design-harness', SYN.cmd],
], [
  ['  ', COL.ink2], ['このリポジトリにデザインハーネスを構築して', COL.ink2],
]];
function term(x, y, w, h, title, o = {}) {
  return [
    B('term', { x, y, w, h, r: 18, fill: COL.code, stroke: line, lw: 2, ...o }),
    C('term-d0', { x: x + 34, y: y + 30, r: 8, fill: red, fillA: 0.8, ...o }),
    C('term-d1', { x: x + 62, y: y + 30, r: 8, fill: yellow, fillA: 0.8, ...o }),
    C('term-d2', { x: x + 90, y: y + 30, r: 8, fill: green, fillA: 0.8, ...o }),
    T('term-t', nolig(title), { x: x + w / 2, y: y + 14, size: 22, font: 'mono', color: ink3, align: 'center', ...o }),
    L('term-l', [[x, y + 60], [x + w, y + 60]], { color: line, lw: 1.5, ...o }),
  ];
}
scene({
  ch: 5, title: '試し方',
  notes: 'デザインハーネスを導入したいリポジトリに build-design-harness スキルを追加し、Claude Code や Codex などのエージェントからスキルを実行するだけです。スキルが既存のトークン定義やテスト基盤を調査し、それらを再利用しながら 1 つのフローを一気通貫で構築します。',
  P: [pAmbient({ alpha: 0.25 })],
  A: () => [
    Hd('試し方'),
    term(60, 160, 1240, 560, 'zsh — your-app'),
    CODE('term-code', TRY_LINES, { x: 92, y: 256, size: 26, lh: 2.1, in: { reveal: 0 }, dur: 4.2, ease: 'linear', d: 0.4 }),
    B('try0', { x: 1330, y: 160, w: 530, h: 270, r: 20, fill: panel, stroke: cool, strokeA: 0.5, lw: 2.5, d: 0.3 }),
    T('try0t', 'エージェントから実行', { x: 1364, y: 186, size: 34, weight: 800, color: cool, d: 0.35 }),
    T('try0d', 'Claude Code・Codex などで\nスキルを呼び出す\n（自然文で頼んでも起動）', { x: 1364, y: 248, size: 28, maxW: 462, lh: 1.5, d: 0.4 }),
    B('try1', { x: 1330, y: 450, w: 530, h: 270, r: 20, fill: panel, stroke: violet, strokeA: 0.5, lw: 2.5, d: 0.5 }),
    T('try1t', 'MCP 連携', { x: 1364, y: 476, size: 34, weight: 800, color: violet, d: 0.55 }),
    T('try1d', '各種クライアントから\n`npx design-harness-mcp` で接続', { x: 1364, y: 538, size: 28, maxW: 462, lh: 1.6, d: 0.6 }),
    T('try-n', 'スキルがリポジトリを調査し、既存のトークン定義やテスト基盤を再利用しながら\n1 つのフローを一気通貫で構築する。', { x: 60, y: 770, size: 34, color: ink2, maxW: 1800, lh: 1.55, d: 4.4 }),
  ],
});

/* ---------- 21. 結果①: 機械的チェックの通過と品質の担保を区別する ---------- */
const RES = `"mechanicalPassed": true,
"checks": [
  { "rule": "HTML-BUTTON-TYPE", "status": "pass" },
  { "rule": "TASK-FIT", "status": "not-evaluated",
    "observation": "Rendered evidence and contextual review are required." }
],
"coverage": { "limits": "Static HTML attributes only. No scripts, CSS, ..." }`;
scene({
  ch: 6, title: '結果①: 「機械的チェックの通過」と「品質の担保」を区別する',
  notes: '単にテストがグリーンだからといって、テストされていない部分の品質まで保証されるわけではありません。それと同様に、AI の生成物に対しても「機械的に保証できた範囲」と「未検証の観点」をレポート上で正直に可視化します。',
  P: [
    pGrid({ x: 1310, y: 456, w: 272, h: 176, cols: 17, rows: 11, col: green, alpha: 0.8, size: 1.8, weight: 0.17 }),
    pAmbient({ x: 1284, y: 200, w: 560, h: 460, col: gray, alpha: 0.5, drift: 10, weight: 0.3 }),
    pAmbient({ weight: 0.2, alpha: 0.15 }),
  ],
  A: () => [
    Hd('結果①: 「機械的チェックの通過」と「品質の担保」を区別する'),
    term(60, 150, 1180, 520, 'npm run design:check -- examples/profile.html'),
    CODE('res-code', json(RES), {
      x: 92, y: 236, size: 23, lh: 1.75, d: 0.4, in: { alpha: 0, dy: 10 },
      hl: [[0, green], [2, green], [3, gray], [4, gray], [6, yellow]], hlW: 1150,
    }),
    T('res-cap', '`examples/profile.html` に対するチェック結果（抜粋）', { x: 92, y: 560, size: 26, color: ink3, d: 0.6 }),
    B('cov', { x: 1270, y: 150, w: 590, h: 520, r: 20, fill: null, stroke: gray, dash: 8, d: 0.6 }),
    T('cov-t', '品質の観点（全体）', { x: 1300, y: 172, size: 24, font: 'mono', color: ink3, d: 0.6 }),
    T('cov-u', '[[gray!:未検証の観点]]\n目的適合性（TASK-FIT）・\n見た目・操作感・文脈の妥当性 …', { x: 1300, y: 222, size: 28, color: ink2, lh: 1.5, d: 0.9 }),
    B('cov-m', { x: 1296, y: 440, w: 300, h: 206, r: 14, fill: green, fillA: 0.08, stroke: green, d: 1.1 }),
    T('cov-mt', '機械的に保証できた範囲', { x: 1300, y: 396, size: 26, weight: 700, color: green, d: 1.2 }),
    dot('rs-b0', 60, 704, '静的属性のチェックはパスしても、目的適合性（`TASK-FIT`）は「未評価」と正直に記録', { d: 1.4 }),
    dot('rs-b1', 60, 772, 'カバレッジの限界（機械で検査できる範囲 / 未検証の観点）を明示', { d: 1.55 }),
    dot('rs-b2', 60, 840, 'エージェントの自己申告（「問題なく完成しました」）は鵜呑みにせず、証拠を要求', { d: 1.7 }),
    card('rs-tag', { x: 60, y: 926, w: tw('≒ テストがグリーンでも、テストしていない部分の品質は保証されない', 34, 800) + 64, h: 84, r: 42, fill: panel2, stroke: yellow, d: 1.9 }, '≒ テストがグリーンでも、テストしていない部分の品質は保証されない', { size: 34, weight: 800, color: yellow }),
  ],
});

/* ---------- 22. 結果②: 検査漏れが新たなルールとして定着するまで ---------- */
const STN = [
  ['初回チェック', 0, 'exit 0', yellow, 'ルール未定義のため\n検査をすり抜け'],
  ['feedback propose', 1, 'proposed', yellow, '`HTML-IMAGE-ALT`\nの追加を提案'],
  ['承認前に apply', 0, 'エラーで拒否', red, '未承認の適用を\n防止'],
  ['feedback decide … accepted', 1, 'accepted', green, '承認者・承認理由を\n記録'],
  ['feedback apply', 1, 'applied', cool, 'カタログへ\nルール定義・履歴を反映'],
  ['design:drift', 1, 'build fail', red, 'ルール更新に伴う\nドリフトを検知'],
  ['再生成 →\n再チェック', 0, 'exit 1', red, '新ルールで違反を\n正しく検出'],
  ['alt 付与 →\n再チェック', 0, 'passed', green, '`mechanicalPassed: true`'],
];
const sx = i => 164 + i * 222;
const TY = 470;
const NOTE22 = '注目すべきポイントは3つです。第一に、検査漏れを「exit 0 で通ったからOK」と見過ごさず改善の契機にすること。第二に、未承認の提案が勝手にルール化されない安全弁があること。第三に、更新されたルールが即座に次回の検証に反映されることです。';
function stations(active, focus) {
  const last = active - 1, done = last === STN.length - 1;
  return [
    T('r2-s', '題材: 画像に `alt` 属性がない HTML（実際の実行結果）', { x: 60, y: 150, size: 32, color: ink2 }),
    L('r2-track', [[sx(0), TY], [sx(7), TY]], { color: line, lw: 4, dur: 1.2, ease: 'inout' }),
    L('r2-prog', [[sx(0), TY], [sx(last), TY]], { color: done ? green : cool, lw: 5, dur: 1.2, mdur: 2.2 }),
    STN.map(([t, mono, st, c, desc], i) => {
      const on = i < active, a = on ? (focus && !focus.includes(i) ? 0.35 : 1) : 0.22;
      const d = on ? 0.3 + (i - (active > 4 ? 4 : 0)) * 0.45 : 0;
      const w = tw(st, 24, 800) + 36;
      return [
        C('r2c' + i, { x: sx(i), y: TY, r: 38, fill: panel2, stroke: on ? c : ink3, lw: 3.5, alpha: a, md: d, pulse: focus && focus.includes(i) ? 1 : 0 }),
        T('r2n' + i, String(i + 1), { x: sx(i), y: TY - 22, size: 30, font: 'mono', weight: 700, color: on ? c : ink3, align: 'center', alpha: a, md: d }),
        card('r2k' + i, { x: sx(i) - w / 2, y: TY - 108, w, h: 50, r: 25, fill: c, fillA: 0.12, stroke: c, alpha: on ? a : 0, md: d }, st, { size: 24, weight: 800, color: c }),
        T('r2t' + i, t, { x: sx(i), y: TY + 58, size: mono ? 22 : 25, font: mono ? 'mono' : 'sans', weight: 700, color: mono ? cool : ink, align: 'center', maxW: 215, lh: 1.35, alpha: a, md: d }),
        T('r2d' + i, desc, { x: sx(i), y: TY + 138, size: 22, color: ink2, align: 'center', maxW: 218, lh: 1.45, alpha: a, md: d }),
      ];
    }),
    card('r2-tok', { x: sx(last) - 115, y: TY - 214, w: 230, h: 60, r: 14, fill: panel2, stroke: done ? green : warm, lw: 2.5, mdur: 2.2 }, 'image.html', { size: 24, font: 'mono', color: done ? green : warm, mdur: 2.2 }),
    L('r2-tokl', [[sx(last), TY - 154], [sx(last), TY - 114]], { color: done ? green : warm, lw: 2.5, dash: 5, mdur: 2.2 }),
  ];
}
const trackP = last => [pFlow({ paths: [[[sx(0), TY], [sx(last), TY]]], speed: 180, col: last === 7 ? green : cool, spread: 5, weight: 0.4 }), pAmbient({ weight: 0.3, alpha: 0.2 })];
const H22 = () => Hd('結果②: 検査漏れが新たなルールとして定着するまで');
scene({
  ch: 6, title: '結果②: 検査漏れが新たなルールとして定着するまで（1–4）', notes: NOTE22,
  P: trackP(3),
  A: () => [H22(), stations(4)],
});
scene({
  ch: 6, title: '結果②: 検査漏れが新たなルールとして定着するまで（5–8）', notes: NOTE22,
  P: trackP(7),
  A: () => [H22(), stations(8)],
});
const TAKE = [
  [[0], '「exit 0 で通った」を\n見過ごさず、改善の契機にする'],
  [[2], '未承認の提案が、\n勝手にルール化されない安全弁'],
  [[5, 6], '更新されたルールが、\n即座に次の検証へ反映される'],
];
scene({
  ch: 6, title: '結果②: 注目すべき 3 つのポイント', notes: NOTE22,
  P: trackP(7),
  A: () => [
    H22(), stations(8, [0, 2, 5, 6]),
    TAKE.map(([ids, t], i) => {
      const x = 60 + i * 610, cx = x + 295, d = 0.3 + i * 0.25;
      return [
        // 各ステーションから対応するカードへ引き出し線を下ろす
        ids.map((s, j) => L('tk' + i + 'l' + j, rp([[sx(s), TY + 250], [sx(s), 748], [cx, 748], [cx, 780]], 16), { color: yellow, lw: 2.5, dash: 6, d })),
        B('tk' + i, { x, y: 780, w: 590, h: 200, r: 20, fill: panel, stroke: yellow, strokeA: 0.5, lw: 2.5, d }),
        T('tk' + i + 'n', ['①', '②', '③'][i], { x: x + 26, y: 814, size: 52, weight: 800, color: yellow, d }),
        T('tk' + i + 't', t, { x: x + 94, y: 829, size: 34, weight: 700, lh: 1.5, d: d + 0.05 }),
      ];
    }),
  ],
});

/* ---------- 23. やってみてわかったこと ---------- */
// 右列: 自分のプロダクト（実装中）の画面と、そのデザインシステム（Storybook）
const SHOT = { x: 1190, w: 670, h: 425 }; // スクリーンショットの縦横比 1863:1183 に合わせる
function shot(id, src, y, label, d) {
  const w = tw(label, 22, 700) + 36;
  return [
    IMG(id, src, { x: SHOT.x, y, w: SHOT.w, h: SHOT.h, r: 14, d }),
    card(id + '-k', { x: SHOT.x + SHOT.w - w - 14, y: y + SHOT.h - 58, w, h: 44, r: 22, fill: panel, stroke: line, d: d + 0.15 }, label, { size: 22, color: ink2 }),
  ];
}
scene({
  ch: 6, title: 'やってみてわかったこと',
  notes: 'いろいろな人が提唱しているデザインハーネスを、自分のアプリのデザインシステムに簡単に導入できました。右が実装中の自分のプロダクトの画面と、そのデザインシステムです。一方で課題も 2 つあります。1 つ目は、Storybook だけの場合と比べて、デザインハーネスによって実際に UI が改善したかはまだ確かめられていないこと。業務委託先でもデザインシステムを構築しているので、そこでも使ってみる予定です。2 つ目は、知識をどこに貯めるか。最終的にはデザインシステムのリポジトリに載せたいのですが、AI エージェントが本来のタスクを離れて別リポジトリに pull request を送るのはしんどいので、GitHub Issue を発行するなどで対応したいと考えています。',
  P: [pAmbient({ weight: 0.3, alpha: 0.2 })],
  A: () => [
    Hd('やってみてわかったこと'),
    T('gd-h', '[[green!:✓]]　よかったこと', { x: 60, y: 160, size: 40, weight: 800 }),
    dot('gd0', 60, 236, 'いろいろな人が提唱するデザインハーネスを、\n自分のアプリのデザインシステムに\n[[green!:簡単に導入できた]]', { maxW: 1060, dot: green, lh: 1.5, d: 0.2 }),
    T('lm-h', '[[yellow!:!]]　課題', { x: 60, y: 464, size: 40, weight: 800, d: 0.5 }),
    dot('lm0', 60, 540, 'Storybook だけの場合と比べて、\nUI が実際に改善したかは[[yellow!:まだ確かめられていない]]', { maxW: 1060, dot: yellow, lh: 1.5, d: 0.7 }),
    T('lm0s', '→ 業務委託先でもデザインシステムを構築中。そこでも使ってみる予定', { x: 96, y: 652, size: 26, color: ink2, maxW: 1040, d: 0.8 }),
    dot('lm1', 60, 736, '知識を[[yellow!:どこに貯めるか]]が悩ましい', { maxW: 1060, dot: yellow, d: 0.95 }),
    T('lm1s', '最終的にはデザインシステムの repo に載せたい。でも AI エージェントが\n本来のタスクを離れて別 repo に PR を送るのはしんどい\n→ GitHub Issue の発行などで対応したい', { x: 96, y: 800, size: 26, color: ink2, maxW: 1040, lh: 1.6, d: 1.05 }),
    shot('md-app', 'img/mitame-app.webp', 160, 'プロダクトの画面（実装中）', 0.3),
    shot('md-sb', 'img/mitame-storybook.webp', 612, 'そのデザインシステム（Storybook）', 0.5),
  ],
});

/* ---------- 24. まとめ ---------- */
const SUM = [
  ['コーディング規約', '`DESIGN.md`・コンポーネント契約・ルール ID'],
  ['lint / CI', '共通チェッカー（CLI / MCP / CI パイプライン）'],
  ['開発手順書', 'Agent Skills'],
  ['ADR / 設計経緯', '判断記録と LLM Wiki'],
  ['PR レビュー', '改善提案 → 人間承認 → 本番適用'],
];
const sumY = i => 316 + i * 92;
scene({
  ch: 7, title: 'まとめ',
  notes: 'デザインハーネスの構築や運用において、私たちエンジニアが培ってきた知見が活かせる領域は非常に大きいです。ぜひ身近な 1 画面から、試してみてください。',
  P: [pFlow({ paths: SUM.map((_, i) => [[818, sumY(i) + 29], [904, sumY(i) + 29]]), speed: 100, col: u => mixc(cool, warm, u), spread: 4, weight: 0.3 }), pAmbient({ weight: 0.4, alpha: 0.2 })],
  A: () => [
    T('sum-k', 'まとめ', { x: 960, y: 40, size: 28, font: 'mono', color: cool, align: 'center' }),
    T('sum-d', 'デザインハーネス ＝\nデザイナーの判断基準を頭の外に出し、[[cool!:コード同様に運用する]]仕組み', { x: 960, y: 92, size: 54, weight: 800, align: 'center', lh: 1.35, d: 0.1 }),
    T('sum-hl', 'エンジニアの道具', { x: 790, y: 264, size: 26, font: 'mono', color: cool, align: 'right', d: 0.3 }),
    T('sum-hr', 'デザインハーネス', { x: 930, y: 264, size: 26, font: 'mono', color: warm, d: 0.3 }),
    SUM.map(([l, r], i) => {
      const y = sumY(i), d = 0.4 + i * 0.18;
      return [
        T('sm' + i + 'l', l, { x: 790, y, size: 40, weight: 800, align: 'right', color: ink, d, in: { alpha: 0, dx: -40 } }),
        L('sm' + i + 'a', [[818, y + 29], [902, y + 29]], { color: ink3, lw: 3, head: 13, d: d + 0.1 }),
        T('sm' + i + 'r', r, { x: 930, y, size: 40, weight: 700, d: d + 0.15, in: { alpha: 0, dx: 40 } }),
      ];
    }),
    T('sum-c', 'まずは身近な [[warm!:1 画面]]、[[warm!:1 つのワークフロー]]から。', { x: 960, y: 800, size: 60, weight: 800, align: 'center', d: 1.6 }),
    T('sum-c2', 'スターター `build-design-harness` ですぐに検証できます', { x: 960, y: 920, size: 34, color: ink2, align: 'center', d: 1.8 }),
  ],
});

/* ---------- 参考資料 ---------- */
const REFS = [
  ['N1', 'やしま｜nicotomo「自論に自信がないデザイナーが、『デザインハーネス』を個人で作ってみた」（2026-09-21）', 'https://note.com/nicotomo_jp/n/n7e5b665316ba'],
  ['Z1', 'saku「散らばった議論を LLM-Wiki でフル活用する AI 時代のデザインシステムのカタチ」（2026-08-05）', 'https://zenn.dev/cybozu_frontend/articles/llm-wiki-for-design-systems'],
  ['P1', '橋本 哲勇 / Tetsuo Hashimoto（LayerX）「デザインハーネス：専門職の判断基準をコードのように運用する」Bet AI Day 2026', 'https://speakerdeck.com/layerx/bet-ai-day-2026-session05'],
  ['C1', 'Design Harness', 'https://design-harness.com/'],
  ['C2', 'Kogiso「デザインハーネスとは何か」', 'https://note.com/kgsi/n/n707d989e1a44'],
  ['E1-C', 'Haruka Shimizu（PKSHA Technology）「1000人規模の組織でデザインハーネスを導入するための第一歩」', 'https://speakerdeck.com/pkshadeck/1000ren-gui-mo-nozu-zhi-dedezainhanesuwodao-ru-surutamenodi-bu'],
  ['E2-B', 'Sayaka Kubouchi（SoftBank）「Agentic Design Workflowを育てる『三層デザインハーネス』の現在地」', 'https://speakerdeck.com/sayadesign2/agentic-design-workflow-o-sodateru-sansou-dezain-hanesu-no-genzaichi'],
  ['E2-D', 'Kota Saito（CONCENT）「デザイナーの判断をAIにつなぐ ── 審美眼をハーネスする試み」', 'https://speakerdeck.com/kotasaito_cnt/dezaina-no-handan-o-ai-ni-tsunagu-shinbi-me-o-hanesu-suru-kokoromi'],
  ['P3', 'Sansan「AIプロトタイピングの精度を上げる—デザインハーネスをチームで育てる方法」', 'https://note.com/sansan_cpo/n/n0df771f4ef2f'],
];
scene({
  ch: 7, title: '参考資料', notes: '',
  P: [pRing({ x: 1690, y: 880, r: 150, w: 44, speed: 0.07, size: 2.2, alpha: 0.85, col: u => mixc(warm, cool, 0.5 + 0.5 * Math.cos(u * Math.PI * 2)) })],
  A: () => [
    Hd('参考資料'),
    REFS.map(([k, t, url], i) => {
      const y = 150 + i * 88, d = 0.1 + i * 0.05;
      return [
        T('rf' + i + 'k', `[${k}]`, { x: 60, y: y + 2, size: 22, font: 'mono', color: cool, d }),
        T('rf' + i + 't', t, { x: 170, y, size: 25, weight: 600, maxW: 1690, d }),
        T('rf' + i + 'u', url, { x: 170, y: y + 38, size: 19, font: 'mono', color: ink3, d }),
      ];
    }),
    T('thx', 'Thank you', { x: 1690, y: 851, size: 40, weight: 800, align: 'center', d: 0.6 }),
  ],
});
