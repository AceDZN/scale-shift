# Scale Shift — BUILD_HANDOFF

Build the newly approved **Scale Shift**: a slow first-person architectural puzzle about uniform scale and proportion. Reuse its prepared standalone repository `/Users/acedzn/dev/AceDZN-exp/scale-shift`, public origin `AceDZN/scale-shift`, on **main**. Dev **5181**, preview **4181**; strict ports, no unrelated process termination. Read [CREW_COMMON.md](CREW_COMMON.md), including its three roles, actual delegation, Hebrew/RTL, touch controls, assets, tests and delivery requirements. Give every delegate this exact user instruction:

```text
Don't forget to build it as a real 3d fun game. use my chrome browser tripo.ai to create the 3d models ([https://studio.tripo3d.ai/workspace/generate/](https://studio.tripo3d.ai/workspace/generate/) ).
btw,create it as a new public repo on my github (AceDZN). I think that I'll deploy it to one of our vercel servers soon because its pretty fun.. you can use my chrome browser for that as well . don't forget to commit your changes from time to time all to the same main branch for now (or open prs for side-tracks)
```

This requires real 3D, original Chrome/Tripo art, regular commits/pushes on main and Vercel readiness. Root already created the repo; do not duplicate it. Prepare deployment; no deployment is requested now. Withdrawn Pocket Port/courier designs stay withdrawn.

## Identity and rules

Walk through a monumental museum, select architecture, resize it uniformly, test clearance and enter the route created. Spatial realization is the reward. No cargo, harbor, robot, delivery, combat or third-person avatar.

- One world unit is one metre. Author measured structures and colliders from explicit primitives. Tripo art never supplies mathematical dimensions, openings or guessed collision surfaces.
- A module has fixed baseline dimensions, an authored pivot and rational factor `s = new length / baseline length`. Apply `(s,s,s)` to the entire structure and corresponding colliders. Never stretch one axis independently.
- Preview scale in `1/20` steps over `1/2 ≤ s ≤ 3`; show fraction and decimal. Snapping aligns deck and centreline to an authored dock. Rotation uses supported 90-degree orientations without changing proportions.
- Commit only when the real span, width, height and capsule clearance fit. Mark the conflicting surface and dimension on rejection; retain the previous valid structure. Document alignment tolerance separately from collision skin.
- A committed module creates an actual walkable path. No correct-answer flag unlocks unrelated movement. Do not manipulate an occupied module. Undo restores rendering and colliders together. Falling returns to the current chamber entrance within one second; no lives or full restart.

## First minute: fit several dimensions

A gap is **6 m** long; available width is **1.8 m**, ceiling **3.2 m above deck**. Player height is **1.65 m**. Module dimensions below are travel length × outer height above deck × outer width:

- Tall arch: `3×1.8×1 m`. Spanning requires `s=2`, producing `6×3.6×2 m`: ceiling and width both fail.
- Low gallery: `4×1.6×1 m`. At `s=3/2`, dimensions are `6×2.4×1.5 m`. Its baseline internal opening is 1.4 m high, hence 2.1 m after scaling: genuinely traversable.

**0–10 s:** walk toward the gap and see the far light. **10–25 s:** enlarge the tall arch; its preview physically conflicts with walls/ceiling. **25–45 s:** choose the gallery and use `6/4=3/2`, checking all dimensions. **45–60 s:** commit and physically cross it. Structural sound and shifting light confirm the connection; no quiz modal.

## Five-to-ten-minute structure

One continuous museum, five connected chambers; no mission board or timers:

1. Span/clearance: the exact opening example.
2. Inverse gallery: shrink a 4 m baseline span into a 2 m socket (`s=1/2`); author sufficient final internal height.
3. Wrong family: one component's aspect ratio cannot satisfy all constraints at any supported factor; select the appropriate proportional component/orientation.
4. Drawing/building: an explicitly calibrated `1:50` plan shows 8 cm, representing 400 cm = 4 m. Resize a 2 m baseline by two. Screen pixels are not measurements.
5. Independent transfer: combine shrink and enlargement with new dimensions and no highlighted answer.

Win by physically traversing all five spaces and entering the final light well. Earlier rooms remain visible through apertures. Every chamber needs a verified geometric solution. Optional area-grid inspection may show `s²`; keep it outside the required path.

## Math, interface and visual thesis

Sources are the read-only snapshots under `/Users/acedzn/idea-plotter/reports/math-games-2026-10-24/curriculum/`: `scale.json`, `ratio-meaning.json`, `proportion-equations.json` (grade 8 chapter 2); optional `perimeter-area-ratio.json` (chapter 6). Scale source: https://math.workbook.co.il/grade-8/chapter-2/scale.

Counter reversed ratios, mixed units, `1:n` enlargement confusion, additive resizing, and fitting length while ignoring proportional height/width. Distinguish drawing/real scale from the module resize factor; lengths/perimeters change by `s`, areas by `s²`.

WASD walk, mouse look, G select/release, wheel or Q/E while selected resize, left-click commit, right-click rotate, R undo, Tab measurements, Escape pause/pointer release. No jumping around puzzles. Touch: movement stick, drag look and explicit select/scale/commit controls. Measurements attach to world edges; optional help explains calculations without revealing every solution. Use Hebrew labels with LTR formula/unit spans.

Monumental concrete, sharp sunlight, long shadow, ivory dust, restrained ultramarine. Quiet resonance and footsteps; no toy-industrial ornaments. Generate a distinctive concrete light-well sculpture/aperture through Chrome Tripo, visibly integrate it, and preserve provenance. Calibrated decks/frames remain authored geometry.

## Acceptance proof

Test uniform render/collider transforms, the exact gallery/arch witnesses, reciprocal scale, unit conversion, impossible aspect ratio, rotation, undo and safe rejection. Perform an actual browser traverse of all chambers, including an incorrect fit and recovery, using normal controls. Record moving first-person gameplay with genuine depth/parallax. Verify production preview 4181, fresh-cache asset loading, mixed-direction text, touch, resizing, pause and console cleanliness. Deliver common proof files, measured size/performance, repository URL and main commit. Report awkward manipulation or unreadable clearance even when numerical tests pass; no automated claim of fun or learning mastery.
