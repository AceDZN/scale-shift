# Guided Scale Shift verification

24 October 2026. Current guided rebuild; the old five-room free-walk version is retired and recoverable in Git. No user fun/learning claim is inferred from automation.

## Results

- `npm test`: **16/16** independent current-version tests. Four exact geometric witnesses; uniform transforms and endpoint coordinates; inverse and changed-target counterexamples; usable capsule width; valid/invalid release and cancellation; retained geometry; supported movement, stop/resume, occupied guards, pause, retry and active-stage undo.
- `npm run build`: passes TypeScript and static Vite build. Vite emits a chunk-size advisory for the bundled Three.js/loader; no build failure.
- `node tests/browser.mjs`: passes at production port 4181 using ordinary mouse events and observed state. All four crossings, including the actual staircase, complete; no console/page errors or HTTP failures. Actual THREE.Box3 length/width/above-deck-height values are compared with rule dimensions, including exact staircase 1.7 m outer height.
- `node tests/touch.mjs`: all four crossings pass in 390 × 844 portrait with real touch events; all finger start/end/move coordinates remain inside the viewport. Also checks pause and 900 × 650 tablet resizing.
- Installed develop-web-game action client: completed against stable4181 with a handle press/release burst. Its supported action vocabulary cannot express continuous dragging, so the full pointer/touch suites supplement it. Its actual screenshot/text were inspected.
- `node tests/capture.mjs`: saves a genuine real-time walking video and 1672 × 941 screenshots. It does not inject a solution or win state; normal drag/release and destination input perform the action. Pause/time hooks are used only by the separate deterministic suites.
- User's Chrome via cua_repl: native drag/release connected the gallery; one destination click reached the next puzzle. Native drag shrank the stairs and continuous walking reached the raised two-shore view. Actual Chrome screenshots are included; the dedicated tab is left at the first interaction.

The browser suite additionally checks overshoot recovery, Escape cancellation, undo, mid-bridge stopping and exact camera preservation, pause/time freeze, restart, resize, fullscreen entry with F and exit with Escape, reduced-motion behavior, mute, ignored malformed local data and fresh local GLB loading. The final fullscreen regression caught reliance on browser-default Escape handling; the handler now explicitly exits fullscreen, with camera pose checked on entry and exit. Session progress is deliberately not persisted; malformed localStorage never supplies geometry.

## Evidence

- `evidence/v2/arrival.png`: immediate one-handle opening.
- `evidence/v2/gameplay.png`: valid 3/2 preview before release.
- `evidence/v2/overshoot.png`: localized failed fit and usable handle.
- `evidence/v2/connected.png`, `crossing.png`: solid route and first-person traversal.
- `evidence/v2/staircase.png`, `two-shores.png`, `finish.png`: changed elevation, changed scale and final reveal.
- `evidence/v2/phone-arrival.png`, `phone-fit.png`: portrait touch/readability.
- `evidence/v2/chrome-production.png`, `chrome-stair-arrival.png`, `chrome-balcony.png`: direct user-Chrome production checks.
- `evidence/v2/walkthrough.webm`: actual real-time input/depth/parallax.
- `evidence/v2/capture-state.json`: observed state and render statistics for the recording.
- `evidence/v2/browser-report.json`, `touch-report.json`: saved successful input checks and actual mesh bounds.
- `docs/VISUAL_REVIEW_V2.md`: generated-target comparison, repairs and remaining differences.

Additional test reports and captures are emitted under ignored `playtest-output/`. For recording on a fresh development machine, Playwright may need `npx playwright install ffmpeg`; this is a development-only video dependency and not a runtime requirement.

## Measured size and rendering sample

The verified `dist` contains **1,705,364 bytes** including the 1,023,788-byte optimized local Tripo GLB, bundled Hebrew fonts, script and CSS. Main JS is approximately 646.5 kB raw / 171.2 kB gzip. The GLB is fetched once and instantiated twice; no remote runtime service is needed.

At 1672 × 941 with DPR 1, the observed valid preview submitted **69 draw calls  / 79,690 triangles**, and the inside-gallery view 66 calls / 78,110 triangles. CPU render submission samples were 0.3 ms at those points; these do not measure GPU completion. During the real-time crossing the recorded RAF callback sample averaged 17.30 ms over 379 callbacks, with a 183.3 ms maximum including startup. The renderer is scheduled at up to 30 Hz, simulation 60 Hz; RAF intervals are not reported as measured render FPS. The capture includes startup shader/asset work and host load, so it is not a device benchmark.

## Limits

Mouse/touch automation verifies mechanics and observable feedback. The owner still needs to judge whether the rebuilt first minute feels clear and enjoyable. The art is simpler than generated mockups, the camera follows a supported guided route, and the slice is short. No public deployment, human play-duration study or educational effectiveness claim is made.
