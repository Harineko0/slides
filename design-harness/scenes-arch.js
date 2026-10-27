'use strict';
/* =========================================================================
 * scenes-arch.js — ハーネスの作り方
 * 全体像のノード（16:9 のカード）の中に各詳細が縮小して入っており、
 * カメラがノードへズームインすると、そのカードがそのまま画面になる
 * （CW × ZZ = 1920、CH × ZZ = 1080 なので、ズーム後のカードは画面ちょうど）。
 * ========================================================================= */
const CW = 256, CH = 144, ZZ = 7.5;
const NODES = {
  ssot: { x: 260, y: 520, color: cool, label: '信頼できる情報源（SSOT）', cap: 'DESIGN.md · tokens\n契約 · ルール' },
  mcp: { x: 990, y: 520, color: cool, label: 'MCP', cap: '知識取得・検査の\nインターフェース' },
  skills: { x: 1350, y: 520, color: violet, label: 'Agent Skills', cap: '作業手順のパッケージ\n（作成 / レビュー / 改善）' },
  wiki: { x: 1170, y: 820, color: violet, label: 'レポート + 判断の経緯', cap: 'LLM Wiki: 設計判断の経緯・\n背景理由のナレッジベース' },
  fb: { x: 700, y: 820, color: yellow, label: '提案 → 人間の判断 → 更新', cap: '承認された更新だけが\n情報源へ戻る' },
};
const frameOf = k => ({ x: NODES[k].x, y: NODES[k].y, z: ZZ });
// [id, 文言, 中心 x, 中心 y, 幅]
const PILLS = [
  ['pv', '人が読むビュー（カタログ・テーマ）', 740, 250, 470],
  ['pc', 'カタログ + 依存解決', 620, 520, 280],
  ['pd', '成果物', 1730, 520, 140],
  ['pk', '共通チェッカー（CLI / MCP / CI）', 1630, 820, 450],
];
const EDGES = [
  ['e1', rp([[394, 470], [482, 470], [482, 250], [499, 250]], 14), cool],
  ['e2', [[394, 520], [474, 520]], cool],
  ['e3', [[766, 520], [854, 520]], cool],
  ['e4', [[1124, 520], [1214, 520]], cool],
  ['e5', [[1484, 520], [1652, 520]], cool],
  ['e6', [[1730, 558], [1730, 782]], cool],
  ['e7', [[1399, 820], [1306, 820]], violet, 'レポート', 1352],
  ['e8', [[1036, 820], [836, 820]], violet, '提案', 936],
  ['e9', rp([[566, 820], [80, 820], [80, 520], [124, 520]], 24), yellow, '承認された更新', 330],
];

/* ---------- 各ノードの詳細（フレーム内の 1920x1080 座標） ---------- */
const kick = (id, t) => T(id, t, { x: 60, y: 30, size: 24, font: 'mono', color: cool });
const zhead = (id, t) => T(id, t, { x: 60, y: 62, size: 56, weight: 800 });
const dot = (id, x, y, text, o = {}) => [
  C(id + '_d', { x: x + 10, y: y + (o.size || 34) * 0.725, r: 7, fill: o.dot || cool, d: o.d }),
  T(id, text, { x: x + 36, y, size: 34, weight: 600, maxW: o.maxW || 1760, ...o }),
];
const RULE_JSON = `{
  "id": "HTML-BUTTON-TYPE",
  "kind": "required-attribute",
  "scope": ["component.button"],
  "selector": "button",
  "attribute": "type",
  "values": ["button", "submit", "reset"]
}`;
const FILES = [
  ['DESIGN.md', '全体のエントリーポイント\n（役割分担・作業手順・実行コマンド）'],
  ['design/tokens.json', 'テーマを自動生成\n（手動編集禁止・ドリフト検知で不整合を防ぐ）'],
  ['design/catalog.json › documents', 'コンポーネント / パターン / シナリオの契約'],
  ['design/catalog.json › rules', 'ルール ID・適用スコープ・自動検査ロジック'],
];
function zSSOT() {
  return [
    kick('zs-k', 'SOURCE OF TRUTH'),
    zhead('zs-h', '土台: 信頼できる情報源（SSOT）をリポジトリで管理する'),
    FILES.map(([f, desc], i) => {
      const y = 176 + i * 150, d = 0.3 + i * 0.12;
      return [
        I('zs-f' + i + 'i', i === 0 ? 'book' : 'file', { x: 82, y: y + 25, size: 36, color: cool, d }),
        T('zs-f' + i, f, { x: 120, y, size: 34, font: 'mono', weight: 700, color: cool, d }),
        T('zs-f' + i + 'd', desc, { x: 120, y: y + 54, size: 28, color: ink2, maxW: 780, d: d + 0.05 }),
      ];
    }),
    B('zs-ed', { x: 940, y: 170, w: 920, h: 540, r: 18, fill: COL.code, stroke: line, d: 0.3 }),
    T('zs-tab', 'design/catalog.json › rules[0]', { x: 972, y: 190, size: 24, font: 'mono', color: ink3, d: 0.35 }),
    CODE('zs-code', json(RULE_JSON), { x: 976, y: 262, size: 30, in: { reveal: 0 }, dur: 2.4, ease: 'linear', d: 0.9, noMini: 1 }),
    T('zs-n1', '定性ルールにも ID を付与し、`manual` として「未評価」を明示', { x: 60, y: 800, size: 42, weight: 700, d: 1.3 }),
    T('zs-n2', 'ID と重要度 → レビュー指摘の根拠を追跡できる　／　合致するルールがなければ推測せず「評価不可」を返す [P1]', { x: 60, y: 884, size: 32, color: ink2, maxW: 1800, d: 1.5 }),
  ];
}
const CLIENTS = [['Cursor', 'spark'], ['Claude Code', 'bot'], ['CLI', 'terminal']];
const TOOLS = [
  ['search_design({query})', '設計知識・ルールの検索'],
  ['resolve_design_context({scenarioId})', 'タスクに必要な契約・パターン・Skill の依存解決'],
  ['check_design({source})', '成果物の自動検査（CLI と完全に共通のチェッカーを実行）'],
];
const cliY = i => 196 + i * 116, toolY = i => 180 + i * 136;
const MCP_PATHS = [
  ...CLIENTS.map((_, i) => bez([380, cliY(i) + 42], [430, cliY(i) + 42], [420, 350], [470, 350], 20)),
  ...TOOLS.map((_, i) => bez([870, 350], [910, 350], [900, toolY(i) + 24], [944, toolY(i) + 24], 20)),
];
function zMCP() {
  return [
    kick('zm-k', 'INTERFACE'),
    zhead('zm-h', 'MCP: 必要な知識だけを取り出し、共通基準で検査する'),
    CLIENTS.map(([t, ic], i) => [
      card('zm-c' + i, { x: 60, y: cliY(i), w: 320, h: 84, r: 42, fill: panel2, stroke: line, d: 0.3 + i * 0.1 }, t, { size: 32, x: 240, align: 'center' }),
      I('zm-c' + i + 'i', ic, { x: 106, y: cliY(i) + 42, size: 34, color: cool, d: 0.3 + i * 0.1 }),
      L('zm-c' + i + 'l', MCP_PATHS[i], { color: ink3, lw: 2.5, d: 0.5 + i * 0.1 }),
    ]),
    B('zm-srv', { x: 470, y: 200, w: 400, h: 300, r: 22, fill: panel2, stroke: cool, lw: 3, d: 0.4 }),
    I('zm-srv-i', 'plug', { x: 670, y: 276, size: 64, color: cool, d: 0.45 }),
    T('zm-srv-t', 'design-harness-mcp', { x: 670, y: 330, size: 30, font: 'mono', weight: 700, color: cool, align: 'center', d: 0.5 }),
    T('zm-srv-s', '原則 読み取り専用', { x: 670, y: 394, size: 28, color: ink2, align: 'center', d: 0.55 }),
    TOOLS.map(([sig, role], i) => [
      L('zm-t' + i + 'l', MCP_PATHS[3 + i], { color: ink3, lw: 2.5, d: 0.7 + i * 0.1 }),
      T('zm-t' + i, sig, { x: 950, y: toolY(i), size: 32, font: 'mono', weight: 700, color: cool, d: 0.8 + i * 0.12 }),
      T('zm-t' + i + 'd', role, { x: 950, y: toolY(i) + 50, size: 28, color: ink2, d: 0.85 + i * 0.12 }),
    ]),
    dot('zm-b0', 60, 604, '全ルールを詰め込まず、タスクに必要なコンテキストだけを動的に注入', { d: 1.3 }),
    dot('zm-b1', 60, 676, 'CLI と MCP でチェッカーを完全共有 → 検証結果が乖離しない', { d: 1.45 }),
    dot('zm-b2', 60, 748, '原則読み取り専用（不要な書き込み・任意コマンド実行の権限を持たない）', { d: 1.6 }),
    card('zm-tag', { x: 60, y: 870, w: tw('≒ デザインシステムの API サーバー', 38, 800) + 64, h: 88, r: 44, fill: panel2, stroke: cool, d: 1.8 }, '≒ デザインシステムの API サーバー', { size: 38, weight: 800, color: cool }),
  ];
}
const SKILLS = [
  ['design-build', '画面の新規作成・改修', ['シナリオ解決', '実装', '自動チェック', '修正', '検証ログ記録'], null],
  ['design-review', '既存コードのレビュー', ['機械的な違反', '文脈的な指摘', '未評価の項目'], 'を分離して報告'],
  ['design-improve', '同じ指摘が頻発したとき', ['ルール更新案を作成', '承認後に適用', '次のタスクで効果検証'], null],
];
function zSkills() {
  return [
    kick('zk-k', 'WORKFLOW'),
    zhead('zk-h', 'Agent Skills: 作業手順をパッケージ化する'),
    SKILLS.map(([name, when, steps, tail], i) => {
      const x = 60 + i * 610, y = 170, d = 0.3 + i * 0.18;
      return [
        B('zk' + i, { x, y, w: 580, h: 520, r: 22, fill: panel, stroke: violet, strokeA: 0.5, lw: 2.5, d }),
        T('zk' + i + 'n', name, { x: x + 36, y: y + 30, size: 38, font: 'mono', weight: 700, color: violet, d }),
        T('zk' + i + 'w', when, { x: x + 36, y: y + 94, size: 30, color: ink2, d }),
        steps.map((s, j) => [
          T('zk' + i + 's' + j + 'm', tail ? '・' : j === 0 ? '　' : '↓', { x: x + 40, y: y + 170 + j * 62, size: 32, color: violet, d: d + 0.15 + j * 0.07 }),
          T('zk' + i + 's' + j, s, { x: x + 84, y: y + 170 + j * 62, size: 34, weight: 700, d: d + 0.15 + j * 0.07 }),
        ]),
        tail ? T('zk' + i + 'tail', tail, { x: x + 84, y: y + 170 + steps.length * 62 + 8, size: 30, color: ink2, d: d + 0.4 }) : null,
      ];
    }),
    iconLine('zk-r1', 'ban', red, 60, 730, 'トークン値や仕様はハードコードしない（「参照先」と「実行コマンド」だけを書く）', { size: 36, maxW: 1700, d: 1.2 }),
    iconLine('zk-r2', 'loop', yellow, 60, 808, '自動修正ループは最大 2 回程度 → 判断が難しければ人間へエスカレーション', { size: 36, maxW: 1700, d: 1.35 }),
    [['Skill = 作業手順書', violet], ['MCP = 知識の参照と検査のインターフェース', cool], ['DESIGN.md = それらを束ねる全体インデックス', ink2]].map(([t, c], i, arr) => {
      const x = 60 + arr.slice(0, i).reduce((s, e) => s + tw(e[0], 30, 700) + 68, 0);
      return card('zk-role' + i, { x, y: 920, w: tw(t, 30, 700) + 48, h: 76, r: 38, fill: panel2, stroke: c, strokeA: 0.6, d: 1.5 + i * 0.12 }, t, { size: 30, color: c });
    }),
  ];
}
const OPS = ['Ingest: 一次資料を取り込む', 'Query: 回答を Wiki に蓄積', 'Lint: 矛盾・古さを検知'];
const TRUST = ['マージ済 PR', 'デザインガイドライン', 'ADR', 'Discussion', '議事録'];
function zWiki(stage) {
  return [
    kick('zw-k', 'KNOWLEDGE BASE'),
    zhead('zw-h', 'LLM Wiki: 判断の「経緯と背景」を育てる'),
    T('zw-s', 'Karpathy 提唱の「Wiki の保守・整理を LLM に委ねる」設計パターン ／ kintone Design System での構成 [Z1]', { x: 60, y: 160, size: 28, color: ink2, maxW: 1800, d: 0.2 }),
    B('zw-raw', { x: 60, y: 222, w: 470, h: 230, r: 18, fill: panel2, stroke: ink3, d: 0.3 }),
    T('zw-raw-t', 'raw/', { x: 92, y: 244, size: 38, font: 'mono', weight: 700, d: 0.3 }),
    T('zw-raw-d', '一次資料（PR・Issue・議事録…）\n人間 / bot が配置・手動編集不可', { x: 92, y: 318, size: 25, color: ink2, lh: 1.55, d: 0.35 }),
    L('zw-arr', [[542, 337], [634, 337]], { color: violet, lw: 3.5, head: 14, d: 0.5 }),
    T('zw-arr-t', 'LLM', { x: 588, y: 290, size: 24, font: 'mono', color: violet, align: 'center', d: 0.55 }),
    B('zw-wiki', { x: 648, y: 222, w: 470, h: 230, r: 18, fill: panel2, stroke: violet, d: 0.6 }),
    T('zw-wiki-t', 'wiki/', { x: 680, y: 244, size: 38, font: 'mono', weight: 700, color: violet, d: 0.6 }),
    T('zw-wiki-d', '一次資料を出典に要約・統合\nLLM が継続的に保守', { x: 680, y: 318, size: 25, color: ink2, lh: 1.55, d: 0.65 }),
    card('zw-ag', { x: 60, y: 476, w: 1058, h: 84, r: 14, fill: panel2, stroke: line, d: 0.75 }, '`AGENTS.md`　引用ポリシー・運用ルールを定義', { size: 30, align: 'left', x: 92 }),
    OPS.map((t, i, arr) => {
      const x = 60 + arr.slice(0, i).reduce((s, e) => s + tw(e, 24, 700) + 60, 0);
      return card('zw-op' + i, { x, y: 584, w: tw(t, 24, 700) + 44, h: 64, r: 32, fill: panel, stroke: violet, strokeA: 0.5, d: 0.9 + i * 0.1 }, t, { size: 24 });
    }),
    B('zw-cmp', { x: 1150, y: 222, w: 710, h: 430, r: 18, fill: panel, stroke: line, d: 0.5 }),
    T('zw-c1', '通常の RAG', { x: 1186, y: 248, size: 34, weight: 800, color: ink3, d: 0.6 }),
    T('zw-c1d', '検索 → 回答 → その場で流れて消える', { x: 1186, y: 306, size: 30, color: ink2, d: 0.65 }),
    L('zw-cl', [[1186, 380], [1824, 380]], { color: line, lw: 1.5, d: 0.7 }),
    T('zw-c2', 'LLM Wiki', { x: 1186, y: 404, size: 34, weight: 800, color: violet, d: 0.8 }),
    T('zw-c2d', '検索 → 回答 → [[violet!:Wiki ページとして蓄積]]\n→ 使うほど知識が洗練される', { x: 1186, y: 462, size: 30, lh: 1.55, d: 0.85 }),
    stage >= 2 ? [
      T('zw-tr-l', '出典の信頼度', { x: 60, y: 688, size: 24, font: 'mono', color: ink3, d: 0.1 }),
      TRUST.map((t, i) => [
        B('zw-tr' + i, { x: 60, y: 730 + i * 60, w: 740 - i * 110, h: 50, r: 10, fill: violet, fillA: 0.32 - i * 0.055, in: { reveal: 0 }, d: 0.2 + i * 0.1 }),
        T('zw-tr' + i + 't', (i ? '> ' : '') + t, { x: 80, y: 735 + i * 60, size: 28, weight: 700, d: 0.3 + i * 0.1 }),
      ]),
      B('zw-ef', { x: 880, y: 690, w: 980, h: 340, r: 20, fill: panel2, stroke: green, strokeA: 0.5, lw: 2.5, d: 0.8 }),
      T('zw-ef-k', '導入効果', { x: 916, y: 716, size: 24, font: 'mono', color: green, d: 0.85 }),
      T('zw-ef-q', '「なぜ最小幅 `210px` なのか」', { x: 916, y: 760, size: 48, weight: 800, d: 0.95 }),
      T('zw-ef-a', '→ 一次資料の出典・時系列付きで、\n[[green!:数分で]]背景を抽出できる', { x: 916, y: 866, size: 34, maxW: 900, lh: 1.5, d: 1.2 }),
    ] : null,
  ];
}
const FB = ['観察', '改善提案', '人間の判断', '適用', '再生成', '次のタスクで効果確認'];
function fbLayout() {
  const ws = FB.map((t, i) => tw(t, 34, 700) + 60 + (i === 2 ? 46 : 0));
  const total = ws.reduce((a, b) => a + b, 0) + 72 * (FB.length - 1);
  let x = 960 - total / 2;
  return ws.map(w => { const r = { x, w }; x += w + 72; return r; });
}
function zFB() {
  const lay = fbLayout(), g = lay[2], gx = g.x + g.w / 2;
  const SC = ['全体ルール', 'パターン', 'コンポーネント', 'タスク固有'];
  const TAG = '≒ 本番ルールの変更には、必ず PR レビューを通す';
  return [
    kick('zf-k', 'FEEDBACK LOOP'),
    zhead('zf-h', 'フィードバック: レビュー指摘を次のタスクへ還元する'),
    FB.map((t, i) => {
      const { x, w } = lay[i], gate = i === 2, d = 0.3 + i * 0.16;
      return [
        card('zf' + i, { x, y: 178, w, h: 92, r: 18, fill: gate ? yellow : panel2, fillA: gate ? 0.12 : 1, stroke: gate ? yellow : line, lw: gate ? 3 : 2, d }, t, { size: 34, x: x + w / 2 + (gate ? 22 : 0), color: gate ? yellow : ink }),
        gate ? I('zf-gi', 'shield', { x: x + 40, y: 224, size: 34, color: yellow, d }) : null,
        i < FB.length - 1 ? L('zf' + i + 'a', [[x + w + 10, 224], [x + w + 62, 224]], { color: ink3, lw: 3, head: 12, d: d + 0.1 }) : null,
      ];
    }),
    T('zf-gs', '承認 / 却下と理由', { x: gx, y: 284, size: 26, color: yellow, align: 'center', d: 0.7 }),
    L('zf-rl', [[gx, 326], [gx, 384]], { color: gray, lw: 2.5, dash: 7, head: 12, d: 1.2 }),
    card('zf-rej', { x: gx - 380, y: 394, w: 760, h: 80, r: 16, fill: panel, stroke: gray, dash: 8, d: 1.3 }, '却下も理由付きで保存 → 同じ提案の再発を防ぐ', { size: 30, color: ink2 }),
    dot('zf-b0', 60, 540, '人間が承認する前の改善提案は、本番の知識ベースへ混入させない', { d: 1.5, maxW: 1090, dot: yellow }),
    dot('zf-b1', 60, 622, 'ルール更新の影響範囲を局所化\n（タスク固有 / コンポーネント / パターン / 全体）', { d: 1.65, maxW: 1090, dot: yellow }),
    dot('zf-b2', 60, 752, 'ログ収集で終わらせず、\n人間のトリアージとルール反映の意思決定が不可欠 [P3]', { d: 1.8, maxW: 1090, dot: yellow }),
    SC.map((t, i) => [
      B('zf-sc' + i, { x: 1220 + i * 44, y: 520 + i * 84, w: 640 - i * 88, h: 500 - i * 126, r: 18, fill: yellow, fillA: 0.03 + i * 0.03, stroke: yellow, strokeA: 0.25 + i * 0.2, d: 1.4 + i * 0.12 }),
      T('zf-sc' + i + 't', t, { x: 1244 + i * 44, y: 536 + i * 84, size: 26, weight: 700, color: i === 3 ? yellow : ink2, d: 1.45 + i * 0.12 }),
    ]),
    card('zf-tag', { x: 60, y: 916, w: tw(TAG, 34, 800) + 64, h: 88, r: 44, fill: panel2, stroke: yellow, d: 2.0 }, TAG, { size: 34, weight: 800, color: yellow }),
  ];
}
const CONTENT = { ssot: zSSOT, mcp: zMCP, skills: zSkills, wiki: zWiki, fb: zFB };

/* ---------- 全体像（ノード・エッジ・各ノード内の縮小コンテンツ） ---------- */
function arch(focus, wikiStage = 1) {
  const out = [];
  if (!focus) out.push(Hd('全体像'));
  EDGES.forEach(([id, pts, c, lab, lx], i) => {
    out.push(L(id, pts, { color: c, lw: 2.5, head: 11, alpha: focus ? 0.35 : 0.8, d: 0.4 + i * 0.14 }));
    if (lab) out.push(T(id + '-t', lab, { x: lx, y: 778, size: 22, font: 'mono', color: c, align: 'center', d: 0.6 + i * 0.14 }));
  });
  PILLS.forEach(([id, t, x, y, w], i) => out.push(card(id, { x: x - w / 2, y: y - 32, w, h: 64, r: 32, fill: panel2, stroke: line, lw: 1.5, d: 0.3 + i * 0.15 }, t, { size: 24 })));
  Object.entries(NODES).forEach(([k, n], i) => {
    const f = focus === k, d = 0.1 + i * 0.15;
    out.push(
      B('n-' + k, { x: n.x - CW / 2, y: n.y - CH / 2, w: CW, h: CH, r: f ? 0 : 6, fill: panel, fillA: f ? 0.6 : 0.94, stroke: n.color, strokeA: f ? 0.5 : 0.8, lw: f ? 0.3 : 2, d }),
      T('n-' + k + '-l', n.label, { x: n.x, y: n.y - CH / 2 - 50, size: 30, weight: 800, align: 'center', color: n.color, alpha: f ? 0 : 1, d }),
      T('n-' + k + '-c', n.cap, { x: n.x, y: n.y + CH / 2 + 14, size: 21, color: ink2, align: 'center', lh: 1.4, alpha: f ? 0 : 1, d: d + 0.1 }),
    );
    const list = CONTENT[k](k === 'wiki' ? wikiStage : 1).flat(Infinity).filter(Boolean);
    const mini = list.filter(a => !a.noMini).map(a => ({ ...a, alpha: (a.alpha ?? 1) * 0.55, d: 0.8 + i * 0.1, dur: 0.8, in: { alpha: 0 } }));
    out.push(inFrame(frameOf(k), f ? list : mini));
  });
  return out;
}
const archFlow = () => [
  pFlow({ paths: EDGES.slice(0, 6).map(e => e[1]), speed: 120, col: cool, spread: 3, weight: 0.45, size: 2 }),
  pFlow({ paths: EDGES.slice(6, 8).map(e => e[1]), speed: 100, col: violet, spread: 3, weight: 0.12, size: 2 }),
  pFlow({ paths: [EDGES[8][1]], speed: 120, col: yellow, spread: 3, weight: 0.13, size: 2 }),
  pAmbient({ weight: 0.3, alpha: 0.18 }),
];

scene({
  ch: 4, title: '全体像',
  notes: 'Agent Skills は作業手順のパッケージ（作成 / レビュー / 改善）、MCP は知識取得・検査ロジックの提供インターフェース、LLM Wiki は設計判断の経緯・背景理由を蓄積するナレッジベースです。この3つの構成要素について、ここから1つずつ詳しく解説します。',
  P: archFlow(),
  A: () => arch(null),
});
scene({
  ch: 4, title: '土台: 信頼できる情報源（SSOT）をリポジトリで管理する', cam: frameOf('ssot'),
  notes: '各ルールに ID と重要度を持たせることで、レビュー指摘の根拠を明確に追跡できます。また、合致するルールがない場合に勝手な推測をせず「評価不可」と正しく返せることも重要です [P1]。',
  P: { frame: frameOf('ssot'), parts: [pAmbient({ col: cool, alpha: 0.3 })] },
  A: () => arch('ssot'),
});
scene({
  ch: 4, title: 'MCP: 必要な知識だけを取り出し、共通基準で検査する', cam: frameOf('mcp'),
  notes: 'エンジニアの感覚でいえば「デザインシステムの API サーバー」です。エージェントがどのクライアント環境（Cursor、Claude Code、CLI 等）を使っていても、全く同じ知識と検査基準にアクセスできます。',
  P: { frame: frameOf('mcp'), parts: [pFlow({ paths: MCP_PATHS, speed: 170, col: cool, spread: 4, weight: 0.6 }), pAmbient({ weight: 0.4, alpha: 0.2 })] },
  A: () => arch('mcp'),
});
scene({
  ch: 4, title: 'Agent Skills: 作業手順をパッケージ化する', cam: frameOf('skills'),
  notes: 'Skill は「作業手順書」、MCP は「知識の参照と検査のインターフェース」、DESIGN.md は「それらを束ねる全体インデックス」という明確な役割分担になっています。',
  P: { frame: frameOf('skills'), parts: [pAmbient({ col: violet, alpha: 0.3 })] },
  A: () => arch('skills'),
});
const NOTE17 = 'ルールが「どう実装すべきか」を規定するものなら、LLM Wiki は「なぜそのルールになったのか」という歴史や文脈を扱います。背景にある理由が分かれば、AI も人間も例外的なユースケースで適切な判断が下せるようになります。';
const WIKI_FLOW = [[[530, 337], [648, 337]]];
scene({
  ch: 4, title: 'LLM Wiki: 判断の「経緯と背景」を育てる', cam: frameOf('wiki'), notes: NOTE17,
  P: { frame: frameOf('wiki'), parts: [pFlow({ paths: WIKI_FLOW, speed: 120, col: violet, spread: 12, weight: 0.3 }), pAmbient({ weight: 0.5, col: violet, alpha: 0.2 })] },
  A: () => arch('wiki', 1),
});
scene({
  ch: 4, title: 'LLM Wiki: 出典の信頼度と導入効果', cam: frameOf('wiki'), notes: NOTE17,
  P: { frame: frameOf('wiki'), parts: [pFlow({ paths: WIKI_FLOW, speed: 120, col: violet, spread: 12, weight: 0.3 }), pAmbient({ weight: 0.5, col: violet, alpha: 0.2, h: 660 })] },
  A: () => arch('wiki', 2),
});
scene({
  ch: 4, title: 'フィードバック: レビュー指摘を次のタスクへ還元する', cam: frameOf('fb'),
  notes: 'エンジニアの感覚でいえば、本番ルールへの変更には必ず PR レビューを通す、ということです。AI のコンテキストやメモリに無秩序に何でも書き足していくアプローチとは明確に一線を画しています。',
  P: { frame: frameOf('fb'), parts: [pFlow({ paths: [[[140, 224], [1780, 224]]], speed: 200, col: yellow, spread: 6, weight: 0.4 }), pAmbient({ weight: 0.4, alpha: 0.2 })] },
  A: () => arch('fb'),
});
