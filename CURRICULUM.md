# Curriculum and mathematical contract

Scale Shift uses newly authored architectural puzzles to apply Workbook's grade-8 ratio, proportion and scale material. The museum, module dimensions and chamber examples are original game content; they are not quoted Workbook exercises.

## Sources actually reviewed

The reviewer read the saved public curriculum snapshots supplied with the handoff at `/Users/acedzn/idea-plotter/reports/math-games-2026-10-24/curriculum/`. Runtime gameplay does not fetch these files or require Workbook authentication.

| Snapshot | Workbook source | Relationship used |
|---|---|---|
| `ratio-meaning.json` | [מהו יחס — grade 8, chapter 2](https://math.workbook.co.il/grade-8/chapter-2/ratio-meaning) | Ratio compares multiplicatively, preserves the stated order, and is preserved by multiplying both corresponding quantities by the same positive factor. Adding the same amount is not uniform scaling. |
| `proportion-equations.json` | [פרופורציה ומשוואות יחס — grade 8, chapter 2](https://math.workbook.co.il/grade-8/chapter-2/proportion-equations) | Equal corresponding ratios determine an unknown length; substitute the result into the original relation. |
| `scale.json` | [קנה מידה במפה ובדגם — grade 8, chapter 2](https://math.workbook.co.il/grade-8/chapter-2/scale) | A drawing scale compares drawing and reality in the same unit. Drawing-to-reality multiplies by the denominator of `1:n`; the reverse direction divides. |
| `perimeter-area-ratio.json` | [יחס היקפים ויחס שטחים — grade 8, chapter 6](https://math.workbook.co.il/grade-8/chapter-6/perimeter-area-ratio) | Optional extension: corresponding lengths and perimeters scale by `s`; areas scale by `s²`. This is not required to open a route. |

The primary reading was the explanatory and worked-example blocks: `ratio-meaning` blocks 5, 19, 28–29; `proportion-equations` blocks 5, 12, 26; `scale` blocks 5, 19–20, 26; and `perimeter-area-ratio` blocks 6, 19, 24. No claim is made that playing the slice demonstrates mastery or a measured learning gain.

## Actions, relationships and misconception checks

| Game action | Mathematical relationship | Visible counterexample or verification |
|---|---|---|
| Resize an entire architectural module | `s = target length / baseline length`; `(L,H,W,opening) → s(L,H,W,opening)` | A span match alone can still collide with the ceiling or side clearance. All dimensions and colliders must use one factor. |
| Span the first 6 m opening | Gallery: `6 / 4 = 3/2`; final `(L,H,W) = (6,2.4,1.5) m`, internal opening `1.4 × 1.5 = 2.1 m` | Tall arch: `6 / 3 = 2`; final `(6,3.6,2) m` exceeds both the 3.2 m ceiling and 1.8 m width. The game rejects its actual geometry. |
| Shrink the inverse gallery | `2 / 4 = 1/2`; reversing the transformation uses `2` | Using the reciprocal `2` to fit a 2 m socket makes the span too long. The final interior must still clear a 1.65 m player. |
| Reject a wrong proportional family, or rotate a suitable one | A uniform scale must satisfy all span, height and width inequalities simultaneously. Supported rotation exchanges horizontal extents, preserving shape. | An impossible family has no common factor satisfying every constraint. Rotation must affect the preview, fit result, committed mesh and collision bounds together. |
| Interpret the calibrated plan | `1:50`, `8 cm × 50 = 400 cm = 4 m`; then module factor `4 m / 2 m = 2` | The drawing scale `1:50` and module factor `2` are different comparisons. Screen pixels and perspective are not measurement units. |
| Solve a changed final configuration | Recompute each new `target / baseline`; combine a shrink and an enlargement | Reusing a previous chamber's factor or adding a fixed number must fail when the dimensions change. No highlighted answer is required for traversal. |
| Inspect optional area information | `A′ = s² A`; lengths remain `s` | For `s = 1/2`, length becomes `1/2` and area becomes `1/4`, not `1/2`. |

## Units, discretization and clearance

- One world unit is one metre. The plan explicitly states centimetres before converting to metres.
- Supported resize factors are `1/2 ≤ s ≤ 3`, in increments of `1/20`. A displayed rational and decimal refer to that same factor.
- Player height is 1.65 m. A module must satisfy span alignment, outer ceiling/width bounds and internal capsule clearance. Alignment tolerance and collision skin are separate implementation quantities; neither is a rounding rule for a displayed mathematical answer.
- A rejected manipulation retains the previous valid geometry. An occupied structure cannot be resized, removed or changed by undo. Fit success itself must not move the player or unlock a separate route: the committed deck is the route.
- The renderer is not the mathematical authority. Authored module primitives define both measured bounds and collision surfaces; decorative generated models have no curriculum measurement or collision role.

## Language and evidence limits

The learner interface defaults to Hebrew. Mathematical expressions, factors, dimensions and units must be isolated in left-to-right spans so that `6 / 4 = 3/2` and `1:50` retain their order inside right-to-left text. Measurements are explicit labels and calibrated authored geometry, not estimates from the apparent size of a mesh.

Automated tests can demonstrate valid witnesses, rejected counterexamples and the consequences of input. They cannot demonstrate that a human found the game enjoyable, developed transferable understanding or mastered the curriculum. Browser findings and remaining limitations belong in `docs/QA_REVIEW.md` and `PLAYTEST.md`.
