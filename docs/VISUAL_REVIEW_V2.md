# Guided rebuild: target versus actual gameplay

24 October 2026. The human approved the revised guided direction after finding the original flow confusing and boring. Generated mockups preceded the rebuild; the later staircase/two-shore mockups preceded their scene implementation. The mockups are design references, never captured-game evidence or runtime backgrounds.

## Matched opening comparison

- Generated arrival: `visual-targets/rebuild-v2/01-drag-v2.png`.
- Generated valid release: `visual-targets/rebuild-v2/02-release.png`.
- Generated failure: `visual-targets/rebuild-v2/01b-overshoot.png`.
- Generated crossing: `visual-targets/rebuild-v2/03-inside-v2.png`.
- Actual: `../evidence/v2/arrival.png`, `gameplay.png`, `overshoot.png`, `connected.png`, `crossing.png` in that same evidence directory.
- Matched viewport: **1672 × 941**. Intro camera eye **(-2, 1.65, 5)**, looking toward **(2.8, 1.05, 0)**. One metre is one world unit. The gallery's near-deck pivot is **(0,0,0)** and its travel axis is world +X.
- Actual valid state: baseline length 4 m, height 1.6 m, width 1 m, opening 1.4 m; factor 3/2 gives length 6 m, height 2.4 m, width 1.5 m, opening 2.1 m. Actual THREE.Box3 checks agree with these above-deck extents; the deck extends 0.225 m below its pivot after scaling.

| Review area | Target and actual comparison | Resolution / remaining difference |
| --- | --- | --- |
| Immediate action | A single handle sits on the gallery; one Hebrew instruction says to drag | Implemented directly in the initial world, without a title screen, selection mode or pointer lock |
| Uniform resize | Height, width, opening and length all change | Entire measured group scales uniformly; actual rendered Box3 extents are tested, not only model output |
| Fit feedback | Valid prompt changes to “מתאים — שחררו” | Implemented during the held drag; no separate commit button or confirmation mode |
| Mistake/recovery | Overshoot intersects the far dock and local hatching marks the conflict | Actual overshoot mesh/plane is independent of support; invalid release leaves a reusable handle and preserves previous geometry |
| Connection | Ghost becomes solid, then a walking destination appears | Material-only blue wash settles to ivory over 0.45 s; geometry never moves independently from collision state. Sound reinforces release. Reduced motion skips the wash |
| Crossing | First-person view goes through the created gallery | One click starts continuous supported walking, with near/far parallax and local footsteps. A real-time video records it |
| Input burden | Structure is the interface | No required WASD, mouse look, family selection, rotation, wheel, inspector, numeric entry or manual commit shortcut |
| Camera/framing | Oblique view reveals span and whole-object growth | Actual camera uses an authored physical eye position; landscape 57° vertical FOV, portrait 90° keeps object/landing context. Resizing changes projection, not progress or camera pose |
| Palette and material | Ivory architecture, blue manipulation, light and negative space | Actual stone joints/grain, shadows, arcades and water are real rendered geometry/materials; detail and vegetation are simpler than the generated references |
| Hebrew and units | Minimal Hebrew and LTR numbers/fractions | Local Heebo, bdi quantities, bounded labels on phones; readable in inspected captures |
| Art landmark | A sculptural destination supplies identity | Original local Chrome-Tripo GLB is visible in the landing and finale; first planter moved to clear its silhouette, final orientation faces the arrival view |

## New spaces and route variety

| Space | Generated target | Actual proof | Mathematical/physical state |
| --- | --- | --- | --- |
| Balcony staircase | `visual-targets/rebuild-v2/staircase.png` | `../evidence/v2/staircase.png`; `chrome-stair-arrival.png` | Exactly 12 treads, scale 1/2, run 2 m, rise 1 m, width 1.5 m. Outer railing height 1.7 m is separate from rise 1 m; the sloping rail is trimmed to agree with the declared height |
| Elevated two-shore view | `visual-targets/rebuild-v2/two-shores.png` | `../evidence/v2/two-shores.png`; `chrome-balcony.png` | First frame 4 → 3 m at 3/4; later frame 3 → 6 m at 2. The camera is physically 1 m higher after climbing |
| Final light court | Same architectural/Tripo language | `../evidence/v2/finish.png` | The final walk turns toward the sculpture before the compact ending UI appears. An earlier empty-sky ending was rejected and repaired |

The renderer builds one persistent world from five explicit platform rectangles; it does not replace the courtyard when stages advance. All committed bridges/steps remain visible. Preview art cannot create support or progress. Every simulation walking step checks an actual supporting platform or committed structure. The generated stair image's illustrative proportions/count do not override the authored 12-step witness.

## Actual input and browser evidence

`../evidence/v2/chrome-production.png`, `chrome-stair-arrival.png`, and `chrome-balcony.png` were captured through the user's ordinary Chrome UI in a dedicated game tab. Native pointer dragging connected the introductory bridge, one destination click walked through it, the same drag shrank the staircase, and walking reached the raised balcony. These are agent-operated browser checks, not a human usability or enjoyment verdict.

`../evidence/v2/phone-arrival.png` and `phone-fit.png` show 390 × 844 portrait touch. All four touch drags and walking destinations were tested; every finger coordinate remained inside the viewport. Labels clamp independently of their handle so long Hebrew feedback stays readable. The wider portrait lens is a deliberate composition adaptation; a slight extreme-edge crop can remain at some factors.

## Deliberate limits and next human check

The runtime uses modest meshes, procedural stone and a normal-mapped blue water plane. It does not match the mockups' photoreal foliage, marble detail or reflected scenery. The route is guided rather than free exploration. This is a short rebuilt slice with four interactions; no human first-play duration, fun, mastery or learning gain has been established.

The useful next human test is the opening minute: whether the first action is obvious, whether a mistake is easy to correct, and whether making/crossing the route feels rewarding. Automated rules and screenshot comparisons do not answer those questions.
