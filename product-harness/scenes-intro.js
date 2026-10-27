'use strict';
/* =========================================================================
 * scenes-intro.js — 共通ヘルパー / イントロ / 背景 / 主張
 * 同じ id のアクターは次のシーンへモーフィングで引き継がれる。
 * 例: 発端のツールの吹き出し（app0..7）→ 20以上のアプリのタイル、
 *     3つの壁（pl0..2）→ プロダクトハーネスの3本柱。
 * ========================================================================= */
const { blueInk, greenInk, redInk, yellowInk, pBlue, pGreen, pYellow, pRed } = COL; // 基本色の短縮名は engine/kit.js
const GDG4 = [cool, red, yellow, green];
const IMGP = f => '../images/product-harness/' + f;
const ASSET = f => 'img/' + f;

/* ---------- 共通ヘルパー（tw / Hd / card / pill / iconLine は engine/kit.js） ---------- */
const dot = (id, x, y, text, o = {}) => [
  C(id + '_d', { x: x + 11, y: y + (o.size || 40) * 0.725, r: 8, fill: o.dot || ink, d: o.d, alpha: o.alpha }),
  T(id, text, { x: x + 40, y, size: 40, weight: 600, maxW: o.maxW || 1760, ...o }),
];
const kick = (id, t, o = {}) => T(id, t, { x: 60, y: 150, size: 30, font: 'mono', weight: 700, color: blueInk, ...o });
const sticker = (id, file, x, y, w, h, o = {}) => IMG(id, ASSET(file), { x, y, w, h, r: 0, bare: 1, in: { alpha: 0, s: 0.6 }, ...o });

// 先読み
[
  '02-avatar.png', '02-devfest-kansai.jpg', '03-dub-links.webp', '14-mc-controller.jpg', ...['url', 'img', 'screen', 'accounts', 'wiki', 'mc'].map(k => `03-app-${k}.webp`),
  '06-accounts-dashboard.jpg', '08-design-system-catalog.jpg', '08-design-system-admin-light.jpg', '14-cf-observability.webp', '15-screen-control-room.jpg', '19-hackathon.webp',
].forEach(f => img(IMGP(f)));

/* ---------- 1. タイトル ---------- */
scene({
  ch: 0, title: '内製化で全てを解決するためのプロダクトハーネス',
  notes: '今日は、コミュニティ運営のあらゆる「困った」を、自分でアプリを作って解決してきた話をします。ただし、今日の主役は個々のアプリではありません。新しいアプリをわずか2〜3時間で、しかも使い捨てではなく「本番品質」で作れるようにしてくれる「基盤」の話をします。',
  P: [
    pRing({ x: 1640, y: 250, r: 130, w: 56, speed: 0.08, size: 2.6, alpha: 0.9, col: u => GDG4[Math.floor(u * 4) % 4] }),
    pAmbient({ weight: 0.25, alpha: 0.2 }),
  ],
  A: () => [
    IMG('gdg', ASSET('gdg.svg'), { x: 60, y: 70, w: 110, h: 110, r: 0, bare: 1, d: 0.05 }),
    T('t-pre', '内製化で全てを解決するための', { x: 64, y: 290, size: 72, weight: 700, d: 0.1 }),
    T('t-main', 'プロダクトハーネス', { x: 50, y: 390, size: 172, weight: 900, d: 0.2 }),
    T('t-sub', '〜コミュニティ運営の「困った」を、\n　2〜3時間で本番品質のアプリにする〜', { x: 64, y: 650, size: 50, weight: 700, lh: 1.4, color: ink2, d: 0.35 }),
    T('t-meta', 'ゆにねこ / GDG Greater Kwansai / 2026-xx-xx', { x: 64, y: 950, size: 36, font: 'mono', color: ink2, d: 0.5 }),
    sticker('stk-a', '02-square-brackets-filled-pastel-yellow.svg', 1590, 740, 262, 231, { rot: 0.12, d: 0.6 }),
    sticker('stk-b', '39-plus-blue.svg', 1440, 820, 101, 95, { rot: -0.2, d: 0.7 }),
  ],
});

/* ---------- 2. 自己紹介 ---------- */
const AV = { x: 1500, y: 250, r: 165 };
scene({
  ch: 0, title: '自己紹介',
  notes: 'ゆにねこです。GDG Greater Kwansai のオーガナイザーと AIAU のスタッフをしていて、大阪大学に在籍しています。先日も関西で大規模なカンファレンス DevFest Kansai を開催したのですが、そうしたコミュニティ運営のかたわら、今日お話しする gdgs.jp の20以上のアプリ群を、ほぼ1人で作って運用しています。',
  P: [
    pRing({ x: AV.x, y: AV.y, r: AV.r + 48, w: 36, speed: 0.06, size: 2.2, alpha: 0.85, col: u => GDG4[Math.floor(u * 4) % 4] }),
    pAmbient({ weight: 0.2, alpha: 0.2 }),
  ],
  A: () => [
    Hd('自己紹介'),
    T('me-name', 'ゆにねこ', { x: 54, y: 150, size: 130, weight: 900, d: 0.1 }),
    iconLine('me-a0', 'user', cool, 60, 330, 'Google Developer Group\nGreater Kwansai Organizer', { size: 48, maxW: 900, d: 0.25 }),
    iconLine('me-a1', 'spark', red, 60, 500, 'AIAU staff', { size: 48, d: 0.35 }),
    iconLine('me-a2', 'book', green, 60, 590, '大阪大学', { size: 48, d: 0.45 }),
    iconLine('me-a3', 'layers', yellowInk, 60, 680, '`gdgs.jp` のアプリ群（**20以上**）を\nほぼ1人で作っている', { size: 48, maxW: 900, d: 0.55, accent: redInk }),
    C('me-ring', { x: AV.x, y: AV.y, r: AV.r + 10, stroke: ink, lw: 3, d: 0.15 }),
    IMG('me-av', IMGP('02-avatar.png'), { x: AV.x - AV.r, y: AV.y - AV.r, w: AV.r * 2, h: AV.r * 2, r: AV.r, fit: 'cover', d: 0.2 }),
    IMG('me-photo', IMGP('02-devfest-kansai.jpg'), { x: 1060, y: 470, w: 800, h: 533, r: 22, fit: 'cover', d: 0.45 }),
    pill('me-cap', 1084, 926, 'DevFest Kansai', { d: 0.7 }, { size: 30 }),
  ],
});

/* ---------- 3. 発端: SaaS 課金の壁 ---------- */
const H3 = () => Hd('発端: コミュニティ運営の「困った」と SaaS 課金の壁');
const NOTE3 = 'きっかけはお金とツールの悩みでした。たとえば告知用の短縮リンクに dub.co を使っていましたが、クリック分析や独自ドメインを使うには月30ドルの Pro プランが必要でした。他にも Wiki や日程調整、経費精算など欲しいものは山ほどありますが、ボランティア運営で SaaS に毎月課金し続けるのは無理があります。そこで「全部内製しよう」と振り切りました。今では20以上のアプリすべてが、Cloudflare Workers Paid の月5ドルだけで動いています。';
const DUB = { x: 1000, y: 170, w: 860, h: 512 };
const dk = DUB.w / 2000;
scene({
  ch: 1, title: '発端: dub.co の Pro プランは月 $30', notes: NOTE3,
  P: [pClusters({ list: [{ x: DUB.x + 222 * dk, y: DUB.y + 1152 * dk, r: 70, col: red, sq: 0.4 }], weight: 0.35, swirl: 0.8 }), pAmbient({ weight: 0.4, alpha: 0.2 })],
  A: () => [
    H3(),
    iconLine('dub-l', 'share', cool, 60, 170, '告知用の短縮リンクに\n`dub.co` を使っていた', { size: 54, maxW: 860 }),
    T('dub-k', 'クリック分析と独自ドメインには', { x: 60, y: 400, size: 44, weight: 700, color: ink2, d: 0.3 }),
    T('dub-v', 'Pro プラン 月 ${n}', { x: 56, y: 470, size: 100, weight: 900, color: red, num: 30, in: { alpha: 0, num: 0 }, dur: 1.4, d: 0.5 }),
    IMG('dub', IMGP('03-dub-links.webp'), { ...DUB, r: 18, d: 0.2 }),
    // 左下の「Upgrade plan」（無料プランのままでは足りない）を囲む
    B('dub-hl', { x: DUB.x + 80 * dk, y: DUB.y + 1120 * dk, w: 284 * dk, h: 64 * dk, r: 10, stroke: red, lw: 4, fill: red, fillA: 0.08, d: 1.1, in: { alpha: 0, s: 1.6 } }),
  ],
});

// 欲しいツール。最後の「短縮リンク」が dub.co の分。app0..7 は次のシーンでアプリのタイルになる
const TOOLS = [
  ['Wiki', 110, 300, -0.06], ['画像置き場', 470, 250, 0.05], ['日程調整', 900, 320, -0.03], ['SNS 予約投稿', 1290, 250, 0.06],
  ['経費精算', 180, 520, 0.04], ['シフト表', 600, 560, -0.07], ['受付チェックイン', 980, 520, 0.03], ['短縮リンク', 1460, 470, -0.04],
];
const toolW = t => tw(t, 44, 700) + 70;
const drain = [960, 1160];
const TOOL_PATHS = TOOLS.map(([t, x, y]) => bez([x + toolW(t) - 30, y + 8], [x + toolW(t), y + 200], [drain[0], drain[1] - 400], drain, 24));
scene({
  ch: 1, title: '発端: 欲しいツールは山ほどある', notes: NOTE3,
  P: [pFlow({ paths: TOOL_PATHS, speed: 160, col: red, spread: 6, weight: 0.6, size: 2, alpha: 0.6 }), pAmbient({ weight: 0.3, alpha: 0.2 })],
  A: () => [
    H3(),
    T('tl-k', 'ほかにも運営で欲しいツールは山ほどある', { x: 60, y: 140, size: 52, weight: 800 }),
    TOOLS.map(([t, x, y, rot], i) => {
      const w = toolW(t), d = 0.15 + i * 0.1;
      return [
        card('app' + i, { x, y, w, h: 96, r: 48, fill: panel, stroke: ink, lw: 2.5, rot, d, in: { alpha: 0, s: 0.5 } }, t, { size: 44, weight: 800 }),
        i < 7 ? card('tp' + i, { x: x + w - 90, y: y - 40, w: 150, h: 60, r: 30, fill: pRed, stroke: red, lw: 2, rot: -rot, d: d + 0.3, jit: 2, in: { alpha: 0, s: 1.6 } }, '$?/月', { size: 30, color: redInk, font: 'mono', weight: 700 }) : null,
      ];
    }),
    T('dub-v', '$30/月', { x: TOOLS[7][1] + toolW(TOOLS[7][0]) - 90, y: TOOLS[7][2] - 64, size: 42, weight: 900, color: red, jit: 2 }),
    T('tl-b', 'ボランティア運営で、SaaS の月額を\n[[red!:ツールごとに払い続ける]]のはつらい', { x: 960, y: 760, size: 56, lh: 1.4, weight: 800, align: 'center', d: 1.3 }),
  ],
});

// 内製したアプリのスクリーンショット。大きく並べてから縮み、月 $5 の話へつなぐ。
// wiki・img・url はツールの吹き出しの位置から飛んでくる（[キー, ラベル, TOOLS の添字]）
const SHOTS = [['url', 'url', 7], ['img', 'img', 1], ['screen', 'screen'], ['accounts', 'accounts'], ['wiki', 'wiki', 0], ['mc', 'mc']];
const SHOT_AR = 1305 / 2000;
const WIN = { x0: 0.034, y0: 0.035, x1: 0.966, y1: 0.93 }; // 影を除いたウィンドウ部分（画像に対する割合）
const shotLay = big => {
  const w = big ? 620 : 330, h = w * SHOT_AR, oy = big ? 205 : 215;
  return SHOTS.map((_, i) => ({ x: 30 + (i % 3) * w, y: oy + Math.floor(i / 3) * h, w, h }));
};
const shotRects = big => shotLay(big).map(r => ({ x: r.x + r.w * WIN.x0, y: r.y + r.h * WIN.y0, w: r.w * (WIN.x1 - WIN.x0), h: r.h * (WIN.y1 - WIN.y0) }));
function shots(big) {
  return shotLay(big).map(({ x, y, w, h }, i) => {
    const [k, label, from] = SHOTS[i], d = big ? 0.3 + i * 0.12 : 0, ls = big ? 34 : 26;
    const src = from != null ? TOOLS[from] : null;
    return [
      IMG('shot-' + k, IMGP(`03-app-${k}.webp`), {
        x, y, w, h, r: 0, bare: 1, d, md: i * 0.05, dur: 1.0, ease: 'drawer',
        in: src ? { alpha: 0, x: src[1], y: src[2], w: 140, h: 140 * SHOT_AR } : { alpha: 0, s: 0.7 },
      }),
      pill('shot-' + k + '-l', x + w * WIN.x0 + 16, y + h * WIN.y1 - Math.round(ls * 2.1) - 14, label, { d: d + 0.4, md: i * 0.05 }, { size: ls, font: 'mono' }),
    ];
  });
}
const Q3 = '「ないなら、[[blueInk!:全部自分で作れば]]いいのでは？」';
scene({
  ch: 1, title: '発端: 全部自分で作ればいいのでは？', notes: NOTE3,
  P: [pRects({ rects: shotRects(true), speed: 220, col: u => GDG4[Math.floor(u * 4) % 4], size: 2, alpha: 0.8, weight: 0.7 }), pAmbient({ weight: 0.2, alpha: 0.2 })],
  A: () => [
    H3(),
    T('q-big', Q3, { x: 960, y: 120, size: 64, weight: 900, align: 'center' }),
    shots(true),
  ],
});
scene({
  ch: 1, title: '発端: 20以上のアプリが月 $5 に収まる', notes: NOTE3,
  P: [pRects({ rects: shotRects(false), speed: 160, col: u => GDG4[Math.floor(u * 4) % 4], size: 1.8, alpha: 0.7, weight: 0.5 }), pAmbient({ weight: 0.3, alpha: 0.2 })],
  A: () => [
    H3(),
    shots(false),
    T('n-apps', '→ 内製した20以上のアプリ（一部）', { x: 70, y: 660, size: 40, weight: 800, d: 0.6 }),
    T('dub-v', '月 ${n}', { x: 1080, y: 200, size: 200, weight: 900, color: cool, num: 5, in: { alpha: 0, num: 30 }, dur: 1.6, d: 0.5 }),
    T('five-s', 'Cloudflare Workers Paid', { x: 1090, y: 480, size: 52, weight: 800, color: blueInk, d: 0.8 }),
    T('five-d', '20以上のアプリすべてが\nこれに収まっている', { x: 1090, y: 560, size: 44, weight: 700, lh: 1.4, color: ink2, d: 1.0 }),
    T('five-q', '→「[[blueInk!:全部内製しよう]]」と振り切った', { x: 960, y: 850, size: 64, weight: 900, align: 'center', d: 1.4 }),
  ],
});

/* ---------- 4. いま起きていること: 深夜0時から3時間で本番投入 ---------- */
const NOTE4 = 'しかも、ただ安上がりなだけではありません。開発スピードが劇的に変わりました。これは先日の DevFest Kansai 2026 当日の実話ですが、深夜0時に「リモートMCの音声を会場のOBSに流すアプリが必要だ」となり、そこから作り始めました。午前3時14分には認証・管理画面・リアルタイム通信を備えた本番品質のアプリが完成し、その日のイベントで実際に稼働しました。なぜ1人で、たった3時間でこんなことができるのでしょうか？';
const TY4 = 560, tx4 = h => 140 + (h / 6.5) * 1640;
// [時刻, 時間, 上(-1)/下(1), 本文, 本文の左端（時刻位置からのずれ）]
const EV4 = [
  ['00:00', 0, -1, '「MC の音声を OBS に\n流したい」と着手', 0],
  ['01:59', 1.9833, 1, '最初のコミット\n116ファイル・約1.1万行', -340],
  ['02:50', 2.8333, -1, 'トラックごとに\nDurable Object で分割', -200],
  ['03:14', 3.2333, 1, 'カウントダウン実装\n→ [[greenInk!:本番の機能が揃う]]', -120],
  ['06:11', 6.1833, -1, 'クリップの\nアップロード・編集・削除', -330],
];
const H4 = () => Hd('いま起きていること: 深夜0時から3時間で本番投入');
function mcTrack(upto, o = {}) {
  const a = o.alpha ?? 1, end = EV4[upto][1];
  return [
    L('mc-track', [[tx4(0), TY4], [tx4(6.5), TY4]], { color: line, lw: 4, alpha: a, dur: 1.2, ease: 'inout' }),
    L('mc-prog', [[tx4(0), TY4], [tx4(end), TY4]], { color: upto >= 4 ? cool : green, lw: 7, alpha: a, dur: 1.6, mdur: 1.6, d: 0.3 }),
    EV4.slice(0, upto + 1).map(([t, h, side, desc, off], i) => {
      const x = tx4(h), d = o.texts === false ? 0 : 0.5 + i * 0.35, bx = Math.max(60, Math.min(1400, x + off)), hot = i === 3;
      const ty = side < 0 ? 280 : 612, sy = side < 0 ? [478, 546] : [574, 606];
      return [
        C('mc-e' + i, { x, y: TY4, r: hot ? 16 : 12, fill: hot ? green : panel, stroke: hot ? green : ink, lw: 3, alpha: a, d, pulse: hot && o.texts !== false ? 1 : 0 }),
        o.texts === false ? null : [
          L('mc-s' + i, [[x, sy[0]], [x, sy[1]]], { color: ink3, lw: 2, d }),
          T('mc-t' + i, t, { x: bx, y: ty, size: 46, font: 'mono', weight: 700, color: hot ? greenInk : ink, d }),
          T('mc-d' + i, desc, { x: bx, y: ty + 64, size: 36, weight: 600, lh: 1.4, color: ink2, d: d + 0.05 }),
        ],
      ];
    }),
  ];
}
const mcKick = () => kick('mc-k', '例: `mc.gdgs.jp`（リモート MC 音声プレイヤー）／ DevFest Kansai 2026 当日', { y: 140, size: 36, color: ink2, weight: 600, font: 'sans' });
scene({
  ch: 1, title: '深夜0時に着手 → 03:14 に本番で使う機能が揃う', notes: NOTE4,
  P: [pFlow({ paths: [[[tx4(0), TY4], [tx4(EV4[3][1]), TY4]]], speed: 160, col: green, spread: 4, weight: 0.35 }), pAmbient({ weight: 0.35, alpha: 0.2 })],
  A: () => [
    H4(), mcKick(), mcTrack(3),
    T('mc-el', '着手から **{n} 分**で、認証・管理画面・リアルタイム通信を備えた本番品質に', { x: 60, y: 850, size: 48, weight: 700, accent: greenInk, num: 194, in: { alpha: 0, num: 0 }, dur: 2.0, d: 1.9 }),
  ],
});
scene({
  ch: 1, title: '06:11 まで機能追加 / 2日後には screen も', notes: NOTE4,
  P: [pFlow({ paths: [[[tx4(0), TY4], [tx4(EV4[4][1]), TY4]]], speed: 200, col: u => (u < 0.5 ? green : cool), spread: 4, weight: 0.35 }), pAmbient({ weight: 0.35, alpha: 0.2 })],
  A: () => [
    H4(), mcKick(), mcTrack(4),
    T('mc-el', '着手から **{n} 分**で本番品質に', { x: 60, y: 820, size: 48, weight: 700, accent: greenInk, num: 194 }),
    T('sc-2', '2日後には登壇者映像システム `screen.gdgs.jp` も\n[[blueInk!:約3時間半]]で本番品質に', { x: 60, y: 906, size: 42, weight: 700, lh: 1.4, d: 0.8 }),
    IMG('mc-img', IMGP('14-mc-controller.jpg'), { x: 1400, y: 770, w: 460, h: 296, r: 14, d: 0.5 }),
  ],
});
scene({
  ch: 1, title: 'なぜ1人で、たった3時間で？', notes: NOTE4,
  P: [pText({ str: '?', x: 1560, y: 760, size: 300, col: cool, psize: 2, weight_: 0.75 }), pAmbient({ weight: 0.25, alpha: 0.2 })],
  A: () => [
    H4({ alpha: 0.4 }), mcTrack(4, { alpha: 0.3, texts: false }),
    T('why', 'なぜ1人で、たった3時間で\nこんなことができるのか？', { x: 60, y: 160, size: 96, weight: 900, lh: 1.3, d: 0.2 }),
  ],
});

/* ---------- 5. 今日の主張 ---------- */
const NOTE5 = '「AI に丸投げしているから速いんでしょ？」と思われるかもしれませんが、違います。1個目のアプリなら AI だけで作れますが、10個、20個と増やすと「認証の重複」「UIのバラつき」「AIがコードを壊す問題」に必ずぶつかります。今日の主張はシンプルです。認証認可、デザインシステム、ハーネスという3つの基盤を整えれば、考えるべきことが「そのアプリ固有のロジック」だけになり、新規開発は驚くほど速く、手軽で、高品質になります。';
const H5 = () => Hd('なぜ2〜3時間で「本番品質」になるのか？');
const Q5 = ['AI に「アプリを作って」と', '丸投げしているから？'];
scene({
  ch: 2, title: 'AI に丸投げしているから？', notes: NOTE5,
  P: [pCloud({ x: 960, y: 380, rx: 760, ry: 200, col: u => GDG4[Math.floor(hash(u * 991) * 4)], swirl: 0.6, size: 2.2, alpha: 0.5, weight: 0.8 }), pAmbient({ weight: 0.2, alpha: 0.2 })],
  A: () => [
    H5(),
    T('c-q', Q5.join('\n'), { x: 960, y: 230, size: 88, weight: 800, lh: 1.3, align: 'center', d: 0.1 }),
    Q5.map((s, i) => {
      const w = tw(s, 88, 800), y = 230 + 88 * 1.3 * (i + 0.5);
      return L('c-s' + i, [[960 - w / 2 - 16, y], [960 + w / 2 + 16, y]], { color: red, lw: 9, d: 1.0 + i * 0.25, dur: 0.5 });
    }),
    T('c-no', 'ではない。', { x: 960, y: 520, size: 80, weight: 900, color: red, align: 'center', d: 1.6, in: { alpha: 0, s: 1.3 } }),
    T('c-n2', '1個目のアプリなら AI だけで作れる。\nでも10個、20個と増やすと、[[redInk!:必ず壁にぶつかる]]。', { x: 960, y: 700, size: 52, weight: 700, lh: 1.5, align: 'center', color: ink2, d: 2.0 }),
  ],
});

// 3つの壁 → 3本柱。中心 x は全体像（scenes-map.js の PIL）と同じ
const WALLS = [
  ['① 認証・権限の壁', '毎回ログインと\n運営権限を作るのが手間'],
  ['② UI と\nプロンプト疲れの壁', '画面がバラバラで\n毎回 AI への指示が長い'],
  ['③ 品質崩壊と\nCI 待ちの壁', 'AI が既存を壊す・\nCI が遅いと飛ばされる'],
];
const WX = [500, 960, 1420];
scene({
  ch: 2, title: 'アプリ量産の「3つの壁」', notes: NOTE5,
  P: [
    pFlow({ paths: [[[270, 720], [440, 720]]], speed: 260, col: cool, spread: 30, weight: 0.4 }),
    pClusters({ list: [{ x: 425, y: 720, r: 55, col: red, sq: 2.6 }], weight: 0.3, swirl: 1.2, size: 2.2 }),
    pAmbient({ weight: 0.25, alpha: 0.2 }),
  ],
  A: () => [
    H5(),
    T('w-t', '10個、20個と増やすと必ずぶつかる「3つの壁」', { x: 60, y: 132, size: 52, weight: 800 }),
    card('w-a', { x: 40, y: 676, w: 220, h: 88, r: 44, fill: pBlue, stroke: ink, lw: 2.5, d: 0.2 }, 'アイデア', { size: 36 }),
    card('w-b', { x: 1660, y: 676, w: 220, h: 88, r: 44, fill: panel, stroke: ink3, lw: 2, dash: 8, d: 0.2 }, '本番品質', { size: 36, color: ink3 }),
    L('flow', [[1470, 720], [1650, 720]], { color: ink3, lw: 3, dash: 10, head: 14, d: 1.5 }),
    WALLS.map(([t, sub], i) => [
      B('pl' + i, { x: WX[i] - 30, y: 540, w: 60, h: 420, r: 12, fill: pRed, stroke: red, lw: 3, d: 0.4 + i * 0.25, in: { alpha: 0, h: 0, y: 960 }, dur: 0.9 }),
      T('pl' + i + 'l', t, { x: WX[i], y: 232, size: 48, weight: 800, lh: 1.25, align: 'center', color: redInk, d: 0.5 + i * 0.25 }),
      T('pl' + i + 'g', sub, { x: WX[i], y: 378, size: 36, weight: 600, color: ink2, align: 'center', lh: 1.4, d: 0.55 + i * 0.25 }),
    ]),
  ],
});

// 全体像と同じ柱の配置・色（scenes-map.js で使う）
const PIL = [
  { k: 'auth', cx: 420, color: cool, ink: blueInk, pastel: pBlue, name: '① 認証認可基盤', gain: '関数を1つ呼ぶだけで\nログインと権限が揃う' },
  { k: 'ds', cx: 960, color: yellow, ink: yellowInk, pastel: pYellow, name: '② デザインシステム', gain: '注文しなくても\nGDG らしい画面が出る' },
  { k: 'ci', cx: 1500, color: green, ink: greenInk, pastel: pGreen, name: '③ ハーネス', gain: '1分以内のチェックで\n壊れたコードを弾く' },
];
const PCARD = { y: 380, w: 480, h: 270 };
const pilBox = (p, o = {}) => ({ x: p.cx - PCARD.w / 2, y: PCARD.y, w: PCARD.w, h: PCARD.h, r: 22, fill: panel, stroke: p.color, lw: 3, ...o });
const pilName = (p, i, o = {}) => T('pl' + i + 'l', p.name, { x: p.cx, y: 304, size: 42, weight: 800, align: 'center', color: ink, ...o });
const pilGain = (p, i, text, o = {}) => T('pl' + i + 'g', text, { x: p.cx, y: PCARD.y + PCARD.h / 2 - 58, size: 40, weight: 800, lh: 1.45, align: 'center', ...o });
const CAPS = [
  '`accounts.gdgs.jp`\nOIDC IdP・チャプター権限',
  '`packages/design-system`\n約80コンポーネント',
  '高速 pre-commit CI\nAgent Skills',
];
const pilCap = (p, i, text = CAPS[i], o = {}) => T('pl' + i + 'c', text, { x: p.cx, y: 664, size: 30, weight: 600, lh: 1.45, align: 'center', color: ink2, ...o });
scene({
  ch: 2, title: '3つの壁を基盤（プロダクトハーネス）が吸収する', notes: NOTE5,
  P: [
    pFlow({ paths: [[[270, 194], [1650, 194]]], speed: 420, col: u => GDG4[Math.floor(u * 4) % 4], spread: 5, weight: 0.55, size: 2.2 }),
    pAmbient({ weight: 0.3, alpha: 0.2 }),
  ],
  A: () => [
    Hd('今日の主張: 3つの壁を「基盤」が吸収する'),
    card('w-a', { x: 40, y: 150, w: 220, h: 88, r: 44, fill: pBlue, stroke: ink, lw: 2.5 }, 'アイデア', { size: 36 }),
    card('w-b', { x: 1660, y: 150, w: 220, h: 88, r: 44, fill: pGreen, stroke: ink, lw: 2.5 }, '本番品質', { size: 36, color: ink }),
    L('flow', [[270, 194], [1650, 194]], { color: ink, lw: 3, head: 16, md: 0.4 }),
    PIL.map((p, i) => [
      B('pl' + i, { ...pilBox(p), md: 0.1 * i }),
      T('pl' + i + 'x', '~~' + WALLS[i][0].slice(2).replace('\n', '') + '~~', { x: p.cx, y: 252, size: 28, weight: 600, color: ink3, align: 'center', d: 0.6 }),
      pilName(p, i, { md: 0.1 * i }),
      pilGain(p, i, p.gain, { md: 0.1 * i }),
      pilCap(p, i, CAPS[i].split('\n')[0], { d: 0.8 }),
    ]),
    T('cl-c', '基盤（[[blueInk!:プロダクトハーネス]]）を整えれば、人間も AI も\n「[[redInk!:そのアプリ固有のロジック]]」だけに集中できる。', { x: 960, y: 790, size: 54, weight: 800, lh: 1.45, align: 'center', d: 1.0 }),
  ],
});
