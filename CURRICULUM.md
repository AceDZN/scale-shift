# Curriculum and mathematical contract

The current guided Scale Shift uses four architectural puzzles across three spaces to apply Workbook's grade-8 ratio, proportion and uniform-scale material. Its actions are drag, release and click to walk. The museum, dimensions, stair construction and examples are original game content, not quoted Workbook exercises.

## Sources actually reviewed

The reviewer read the saved public curriculum snapshots supplied with the handoff at `/Users/acedzn/idea-plotter/reports/math-games-2026-10-24/curriculum/`. Runtime gameplay does not fetch these files or require Workbook authentication.

| Snapshot | Workbook source | Relationship used |
|---|---|---|
| `ratio-meaning.json` | [מהו יחס — grade 8, chapter 2](https://math.workbook.co.il/grade-8/chapter-2/ratio-meaning) | Ratio compares multiplicatively, preserves the stated order, and is preserved by multiplying both corresponding quantities by the same positive factor. Adding the same amount is not uniform scaling. |
| `proportion-equations.json` | [פרופורציה ומשוואות יחס — grade 8, chapter 2](https://math.workbook.co.il/grade-8/chapter-2/proportion-equations) | Equal corresponding ratios determine an unknown length; substitute the result into the original relation. |
| `scale.json` | [קנה מידה במפה ובדגם — grade 8, chapter 2](https://math.workbook.co.il/grade-8/chapter-2/scale) | Scaling a model compares corresponding measurements in consistent units. Its drawing/reality conversion material was reviewed, but a `1:n` drawing-conversion puzzle is not part of the current guided flow. |
| `perimeter-area-ratio.json` | [יחס היקפים ויחס שטחים — grade 8, chapter 6](https://math.workbook.co.il/grade-8/chapter-6/perimeter-area-ratio) | Reviewed background: corresponding lengths/perimeters scale by `s`, areas by `s²`. Area/perimeter inspection is not currently implemented. |

The primary reading was the explanatory and worked-example blocks: `ratio-meaning` blocks 5, 19, 28–29; `proportion-equations` blocks 5, 12, 26; `scale` blocks 5, 19–20, 26; and `perimeter-area-ratio` blocks 6, 19, 24. No claim is made that playing the slice demonstrates mastery or a measured learning gain.

Snapshot SHA-256 fingerprints:

```text
scale.json                  87c2a94d43860ebcbd6dfd05517216d5b81cf26f1c6cf67688066fd98af27f0c
ratio-meaning.json          aae127d7241d66890aeba6703aa82002f90eb51134b9276d2a21fc618b3ba630
proportion-equations.json   b6c3fa06fa7ff877d4d57cee37e217beeb96e7f91c14d3952c156042b4538fa5
perimeter-area-ratio.json    5eea7200cb647c30c6d116d80254b8863fc34560b57830b11f65048faa0170f5
```

## Current actions, relationships and misconception checks

| Game action | Mathematical relationship | Visible counterexample or verification |
|---|---|---|
| Drag the whole structure | `s = target span / baseline span`; all corresponding lengths use one positive factor | The near-deck pivot stays fixed. Width, height, opening, stair rise and treads scale together; adding a fixed extension is not uniform scaling. |
| **1. Bridge of light:** grow one gallery across 6 m | Baseline `(L,H,W)=(4,1.6,1) m`, opening 1.4 m. `s=6/4=3/2` gives `(6,2.4,1.5) m`, opening 2.1 m | This is explicitly a **span-only control lesson**: outer width and ceiling allowances are generous and nonbinding. At `s=7/4`, the 7 m structure overshoots the 6 m dock and cannot connect. The 6 m span is the total, not an added extension. |
| **2. Balcony staircase:** shrink run and rise into a fixed landing | Baseline run 4 m, rise 2 m, width 3 m. `s=1/2` gives run 2 m, rise 1 m, width 1.5 m | Both the lower and upper landing must join actual surfaces. Multiplying by reciprocal `2` fails; changing run alone cannot preserve the rise/run ratio. |
| Preserve twelve stair treads during resizing | At `s=1/2`, each tread is `2/12=1/6 m` deep and each riser is `1/12 m`; slope remains `rise/run=1/2` | Step count remains twelve. The upper landing is 2 m forward and 1 m above the lower dock. The entire rail-inclusive outer height changes from 3.4 m to 1.7 m; rise remains a separate 1 m measurement. |
| **3. Near shore:** solve a new shrink | Baseline `(L,H,W)=(4,3.2,2) m`, opening 2.9 m. `s=3/4` gives `(3,2.4,1.5) m`, opening 2.175 m | Reusing the stair factor `1/2` leaves a 2 m structure short of the 3 m dock. The visible width allowance is 1.8 m and ceiling allowance 3.2 m. |
| **4. Far shore:** solve a new enlargement | Baseline `(L,H,W)=(3,1.5,0.8) m`, opening 1.3 m. `s=2` gives `(6,3,1.6) m`, opening 2.6 m | Reusing `3/4` cannot cross 6 m. Visible width allowance is 2 m and ceiling allowance 3.4 m. A matching length must also remain traversable. |
| Release to connect, then click the destination | A valid transform creates the rendered and supported route; the scale factor itself is not a progress flag | Rejected release retains previous valid support and an editable preview. A preview supplies no support. Progress requires continuous walking over the committed structure. |

## Units, discretization and clearance

- One world unit is one metre. The current puzzles do not mix centimetres and metres or infer measurements from screen pixels.
- Supported resize factors are `1/2 ≤ s ≤ 3`, in increments of `1/20`. A displayed rational and decimal refer to that same factor.
- Dimensional HUD values round to two decimal places for display; fit and collision decisions use the unrounded transformed values. Supported factor decimals are exact to two decimal places.
- Span/landing alignment tolerance is 0.045 m. Collision skin is 0.015 m. They serve separate purposes and are not display-rounding rules.
- Player eye/body height is 1.65 m and horizontal radius 0.20 m. A gallery needs at least 1.68 m internal headroom. Minimum usable passage width is `2×0.20 + 2×0.015 = 0.43 m`, after subtracting the uniformly scaled posts/rails. Gallery posts remove `0.16s m` from outer width; stair rail boundaries remove `0.08s m`.
- Stair clearance checks the highest tread plus the player's height and collision skin against the visible ceiling. The exact twelve treads and fixed balcony landing supply support; an enclosing box or a floating diagonal camera path is insufficient.
- An occupied structure cannot be resized or removed, including while walking is stopped. Cancellation restores the pre-drag factor; pause freezes the walking camera; undo applies to the current set piece. Unbuilt space stops guided movement safely.
- The renderer is not the mathematical authority. Authored module primitives define both measured bounds and collision surfaces; decorative generated models have no curriculum measurement or collision role.

## Language and evidence limits

The learner interface defaults to Hebrew. Mathematical expressions, factors, dimensions and units use isolated left-to-right groups, such as `4.0 m → 6.0 m` and `×3/2`. Measurements come from authored geometry rather than apparent mesh size or generated-reference pixels.

Automated tests can demonstrate valid witnesses, rejected counterexamples, support and input consequences. They cannot demonstrate human enjoyment, transferable understanding or curriculum mastery. Current evidence and limitations belong in `docs/QA_V2.md` and `PLAYTEST.md`.

## Historical baseline

The retired five-room baseline included a tall-arch counterexample, reciprocal gallery, impossible proportional family/rotation and calibrated `1:50` plan. Those remain historical curriculum/design context, not implemented features of the current guided route. Its simultaneous-clearance witness and the reviewed area/perimeter rules must not be presented as current learner actions. The redesign followed direct human feedback about confusing controls and flow; old passing tests did not establish usability or fun.
