# Scale Shift / קנה מידה

A playable first-person architectural puzzle about uniform scale. Resize measured structures, test the span, width, ceiling and walking opening, commit real geometry, then walk across it. Hebrew interface, monumental concrete, sunlight and ultramarine previews.

## Play locally

```sh
npm ci
npm run dev
# http://localhost:5181
npm test
npm run build
npm run preview
# http://localhost:4181
```

Node 22+ recommended. Both ports are strict: an occupied port fails rather than stopping another process. Runtime is entirely static/local; no account, API key, backend or remote asset request is needed.

## Implemented slice

Five continuous chambers and six physical crossings: the exact 6 m opening puzzle, an inverse gallery, an impossible proportional family with a quarter-turn alternative, a calibrated 1:50 drawing, then an unhinted shrink/enlarge transfer. There are no quiz locks, jumps, lives, collectibles or timers. Rejection preserves valid geometry; occupied structures cannot be edited; undo changes both visual and walkable state. A fall returns to the current entrance in under one simulation second. Reach the final light well by walking through all six spans.

The slice is designed for about 5–10 minutes of deliberate first play. No human play-duration, enjoyment or learning-gain result is claimed. Experienced/automated solvers can finish faster. Session state stays in memory; reloading begins a fresh museum.

## Controls

WASD / arrows walk; drag the canvas or click it for mouse look. G selects/releases; 1/2 chooses a structure; Q/E or wheel resizes by 1/20; left click / Enter commits; right click or the rotation button turns 90°. R / undo button restores the previous structure. Tab / measurements toggles detail. Escape pauses/releases the pointer. F toggles fullscreen. The pause menu offers entrance retry and full restart; sound can be muted.

Touch: movement stick, drag the world to look, explicit selection, factor arrows/range, rotation and commit. The world canvas is genuine Three.js perspective geometry, not the design-reference image.

## Validation

```sh
npm test                 # independent mathematical witnesses/counterexamples
npm run test:browser      # ordinary controls + deterministic time; installed Chrome
TEST_URL=http://localhost:4181 node tests/touch.mjs
```

`tests/browser.mjs` and `tests/touch.mjs` use a fresh headless Chrome profile, never the owner's login profile. The installed develop-web-game action client is also used; it supports only a subset of the game's keys. See [PLAYTEST.md](PLAYTEST.md), [docs/QA_REVIEW.md](docs/QA_REVIEW.md), and [docs/VISUAL_REVIEW.md](docs/VISUAL_REVIEW.md) for actual evidence and limitations. `window.render_game_to_text()` exposes metre coordinates, dimensions, transforms, outcomes and real load/render stats; `window.advanceTime(ms)` steps the same simulation and respects pause.

## Static Vercel readiness

Build command `npm run build`; output directory `dist`; framework Vite. `vite.config.ts` uses relative asset paths. Import this public repository into the chosen Vercel project when a destination is selected. No deployment has been made. `vercel.json` supplies static build/output configuration; no secrets or environment variables are required.

## Sources and art

[CURRICULUM.md](CURRICULUM.md) maps actions to the saved Workbook grade-8 curriculum. [ASSETS.md](ASSETS.md) records the original sculpture generated through the owner's Chrome Tripo UI, its displayed 45-credit task, hashes and reduction from 964,380 to 31,022 triangles. Runtime GLB is about 1 MB. Exact mathematical architecture is authored separately from decorative models. Heebo Hebrew font is bundled under its OFL license.

[docs/visual-targets/gameplay-v1.png](docs/visual-targets/gameplay-v1.png) is an imagegen design target, explicitly not a gameplay capture. Actual evidence lives under `evidence/`; the target never appears as the rendered game. Production comparison and remaining artistic differences are documented in the visual review.
