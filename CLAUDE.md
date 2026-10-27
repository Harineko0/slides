# slides

Motion-graphics presentation decks drawn on a `<canvas>` by a shared, build-free slide engine. Slide text, comments and speaker notes are written in Japanese.

## Layout

```
engine/            Shared engine. Nothing deck-specific goes here.
  engine.css       Styles for the stage, speaker notes and help overlay
  engine-core.js   Drawing primitives, text layout, particle shapes, scene registry
  kit.js           Shared scene helpers (Hd / card / pill / iconLine / tw)
  engine-run.js    Transitions, camera, particles, input, presenter window, main loop
  README.md        Full API reference (Japanese)
template/          Starter deck: copy it to start a new deck
design-harness/    Deck
product-harness/   Deck
images/<deck>/     Large photos and screenshots, referenced as ../images/<deck>/...
*.md (root)        Talk manuscripts that the decks are based on
```

## Running

There is no build step. Serve the repo root and open a deck folder:

- In this app, use `preview_start` with the `slides` config from `.claude/launch.json` (python http.server on port 8765), then open `http://localhost:8765/<deck>/`.
- `#N` in the URL starts at scene N.
- The http.server responses get cached. After editing a script, refetch it with `fetch(url, { cache: 'reload' })` before reloading, or you will be testing the old file.

## Creating a deck

1. `cp -R template <deck>`.
2. In `<deck>/index.html`, set `<title>`, the Google Fonts `<link>`, the canvas `aria-label` and `window.ENGINE_THEME`.
3. Write scenes in `<deck>/scenes.js`. When a deck grows, split it into `scenes-*.js` files.

The scripts are classic scripts that share one global scope. Load them in this exact order:

1. `../engine/engine.css`, then an inline `<script>` that defines `window.ENGINE_THEME` (in `<head>`)
2. `../engine/engine-core.js`
3. `../engine/kit.js`
4. The deck's `scenes-*.js`, in presentation order
5. `../engine/engine-run.js`

The engine creates `#notes` and `#help` itself. Keep `<canvas id="stage" aria-label="…">` in the HTML.

## ENGINE_THEME

Every key is optional. The defaults are a light theme with Inter + JetBrains Mono.

- `col`: color overrides (`bg ink ink2 ink3 line panel panel2 code warmBg warm cool green red yellow gray violet`). Extra keys are allowed and can be used as `COL.x` or as `[[x:text]]` in text.
- `fs` / `fm`: sans / mono font stacks.
- `fonts`: fonts to preload, as `[[family, [weights]], …]`. Keep it in sync with the Google Fonts link. Noto Sans JP is always preloaded.
- `chapters`: chapter names. A scene's `ch` is an index into this array.
- `kit`: defaults for kit.js, as `{ heading: { x, y, size, weight }, cardSize, iconTint }`.

To restyle the notes and help overlay, override the CSS variables `--ui-bg --ui-border --ui-shadow --ui-blur --ui-muted` in the deck's `<style>`.

## Writing scenes

```js
scene({
  ch: 0, title: 'タイトル', notes: 'speaker notes',
  cam: { x: 960, y: 540, z: 1 },          // optional camera; z > 1 zooms in
  P: [pRing({ … }), pAmbient()],          // particle parts (optional)
  A: () => [T('id', 'text', { x, y }), …], // actors
});
```

- Coordinates are a 1920×1080 design space. Margins are 60 px left and right, the heading sits at about y 36, and the body runs from y 150 to 1040.
- A scene is a declarative snapshot of the screen. **Actors that share an `id` across consecutive scenes morph** (position, size, color, points, text). New ids enter, and missing ids exit. Plan your ids so that the motion tells the story.
- Actor constructors: `T` text, `B` box, `L` polyline, `C` circle, `I` icon (keys of `ICON_D`), `IMG` image, `CODE` code (build lines with `json()` / `sh()`), `POLY` polygon. The defaults are in `DEF` in `engine-core.js`.
- Timing props: `d` / `dur` / `in` control entry, `md` / `mdur` / `mease` control morphing, `out` / `odur` control exit. `hud: true` pins an actor to the screen instead of the camera.
- Text markup: `**bold accent**`, `` `chip` ``, `~~strike~~`, `[[red:colored]]`, `[[red!:bold colored]]`.
- Particle parts: `pRing pCloud pGrid pText pPoly pFlow pAmbient pClusters pLines pRects`. They share 1100 particles in proportion to `weight`.
- `inFrame(frame, actors)` places actors in a zoomed sub-frame, and `scaleG(...)` scales a group of actors.
- `kit.js` declares `tw Hd card pill iconLine KIT_CFG` and the color shorthands `ink ink2 ink3 warm cool green red yellow gray violet line panel panel2`. **Do not redeclare these names in a deck**: redeclaring one is a SyntaxError that breaks the whole deck. Destructure extra theme colors yourself, for example `const { blueInk } = COL;`.
- Top-level names are shared across all of a deck's scene files, so other helper names must be unique within the deck too.

## Changing the engine

- The engine is shared by every deck. Put deck-specific values (copy, colors, chapter names, assets) in the deck's `ENGINE_THEME` or its scene files, never in `engine/`.
- After changing `engine/` or `kit.js`, check every deck for regressions. Hash `JSON.stringify(buildScene(n))` for each scene in the browser before and after the change, then compare. Actor lists are deterministic, whereas screenshots are not, because particles and the clock vary.
- Keep `engine/README.md` and this file in sync with API changes.

## Controls

`→` / Space / click: next. `←` / Shift+click: previous. `N`: notes. `P`: presenter window. `F`: fullscreen. `Home` / `End`: first / last scene. `?`: help.
