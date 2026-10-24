# Scale Shift / קנה מידה

A guided first-person spatial puzzle. **Drag one handle. Release to connect. Click the footprints to walk.** The opening starts directly in the world; mouse-look, keyboard movement, selection modes and a separate commit control are not required.

This rebuild follows the owner's play feedback that the previous controls and repeated corridors were confusing and boring. The new interaction was storyboarded with imagegen before implementation. It is ready for human play feedback; automated checks do not establish enjoyment or learning gains.

## Play locally

```sh
npm ci
npm run dev      # http://localhost:5181
npm test
npm run build
npm run preview  # http://localhost:4181
```

Node 22+; strict ports. The production build uses relative assets and requires no backend, account, API key, remote font/model request or saved browser state.

## The playable route

- **A bridge of light:** one short gallery, one visible handle, a clear six-metre gap. Release a valid uniform enlargement, then click to walk through the deck you created.
- **The balcony staircase:** shrink a twelve-step staircase to half size; its two-metre run and one-metre rise join the actual balcony. Walking up reveals the museum from above.
- **Two shores:** shrink one frame and enlarge another around two sides of the light well. New dimensions and new viewpoints use the same gesture.

All five stone platforms and four structures share one continuous 3D world. A preview never supports a walk. Invalid release preserves committed geometry and leaves the handle usable. Pause, drag cancellation, active-structure undo, safe walking stop/resume and entrance retry are included. A destination click starts the whole crossing; another click in the world stops safely. No repeated clicking is needed to move.

The learner UI is Hebrew, with local Heebo fonts and isolated LTR quantities. Touch uses the same handle and destination, with drag sensitivity adapted to the space available inside the screen. Keyboard alternatives: focus the handle and use arrows, Escape cancels/pauses, F toggles fullscreen. Help, undo, pause and sound controls remain visible. Reduced motion disables the handle pulse, water motion and connection wash; essential walking stays continuous and has no head bob.

Session state stays in memory. Reloading starts a new route; no student data or analytics is transmitted.

## Checks and evidence

```sh
npm test
npm run test:browser
TEST_URL=http://localhost:4181 node tests/touch.mjs
TEST_URL=http://localhost:4181 node tests/capture.mjs
```

Browser scripts use a fresh installed Chrome profile, never the owner's authentication profile. They read `render_game_to_text()` and use normal mouse/touch events; `advanceTime(ms)` runs the same fixed-step simulation and respects pause. The installed develop-web-game action client supplements these checks for its supported input subset.

See [PLAYTEST.md](PLAYTEST.md), [docs/QA_V2.md](docs/QA_V2.md), and [docs/VISUAL_REVIEW_V2.md](docs/VISUAL_REVIEW_V2.md). Generated targets under `docs/visual-targets/rebuild-v2/` are clearly separate from actual captures under `evidence/v2/`. Target bitmaps are never displayed as the game. The actual renderer is simpler and less detailed than the generated art; it does not claim photoreal water/reflections.

## Sources and original assets

[CURRICULUM.md](CURRICULUM.md) maps uniform scale, inverse scale and the new rise/run witnesses to the saved Workbook sources. [ASSETS.md](ASSETS.md) records the original sculpture generated through the owner's Chrome Tripo UI: one displayed 45-credit task, normal GLB export, hashes and reduction to 31,022 triangles/about 1 MB. This rebuild reuses that asset and spends no further Tripo credits. Exact platforms, galleries and steps use authored geometry independent of the decorative model.

## Vercel readiness

Import the public repository into the chosen Vercel project with build command `npm run build`, output `dist`, framework Vite. `vercel.json` supplies these settings. No environment variables are needed. No public deployment has been made.

The previous version is recoverable in Git at `4d4beb2`; the approved replan and image workflow are documented in [docs/REBUILD_V2.md](docs/REBUILD_V2.md).
