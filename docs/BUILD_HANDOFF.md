# Scale Shift — build handoff

Build the user-approved replacement **Scale Shift**: a deliberate first-person architectural puzzle about uniform scale and proportion. This is a fresh game with its own repository, controls, world and progression. The withdrawn Pocket Port and earlier educational briefs are historical material, not implementation instructions or reusable game designs. This build is authorized by the user's new selection; it does not claim that Idea Plotter's scientific gates passed.

Read [CREW_COMMON.md](CREW_COMMON.md) for shared engineering, browser asset workflow and delivery requirements. The game-specific rules below define this product.

## Mandatory user requirements and ownership

**Build a real 3D browser game. Use the user's Chrome Tripo UI to generate original, game-specific 3D art. Create the game's own public GitHub repository under AceDZN. Work on `main` and make regular, clear commits. Make the game ready for a later Vercel deployment.** A deployment is not requested merely by being deployment-ready. No asset-generation API substitutes for the specified Chrome workflow.

- Standalone repository: `/Users/acedzn/dev/AceDZN-exp/scale-shift`.
- Intended public repository: `AceDZN/scale-shift`; report its actual URL and latest `main` commit.
- Development port **5181**; production-preview port **4181**. Bind explicitly and fail if occupied; do not kill another game's process or silently choose another port.
- Work only on this game and its owned processes. Keep other builders, canceled games, canonical map data and `spec/` untouched.
- Use the stack and production requirements in CREW_COMMON. Perspective rendering, depth, occlusion, world-space movement and collisions must be real 3D. A flat diagram with a tilted camera is insufficient.

## Product thesis

The player is an architect walking through a monumental building that becomes navigable when its structural pieces have the right proportions. Look, select a component, preview its uniform size, fit it into real architectural constraints, and walk the route it creates. The satisfaction comes from a spatial realization followed by entering the space just constructed.

The game is quiet and continuous. No harbor, cargo, vehicle, robot, retrieval loop, deliveries, mission board or combat. Do not import the earlier toy-industrial art direction. The player has no visible third-person avatar.

## Exact interaction and world rules

1. One world unit is one metre. Author every measured component from explicit dimensions and primitive collision geometry. Generated models provide art; their guessed bounding boxes, holes, texture markings and apparent volume never define a mathematical measurement or a valid passage.
2. A selectable architectural module has immutable baseline dimensions, an authored pivot, a positive rational factor `s`, and a supported dock orientation. Every vertex of its mathematical structure and every corresponding collider follows the same `(s, s, s)` transform. Never stretch a single axis to make a placement fit.
3. Define the resize factor everywhere as **new length / baseline length**. A separate drawing marked `1:n` means drawing length / real length; convert units before comparing it with the resize factor. Label both directions explicitly.
4. Selection displays a translucent, depth-correct preview. Wheel or Q/E changes `s` in steps of `1/20`, within `1/2 ≤ s ≤ 3`. Show the exact fraction and decimal. Optional fraction entry is a direct geometry control, not a quiz answer that unlocks an unrelated action. Left-click commits. Right-click rotates between authored 90-degree dock orientations; it cannot distort the object.
5. Docks align a module's reference floor and centreline to authored sockets. A commit must satisfy the socket span and actual clearances and must not intersect static structure or the player capsule. Reject an invalid placement in place, marking the specific conflicting surface and explaining the dimension. Keep the previous valid structure intact. Alignment tolerances and physical collision skin are separate, documented values; neither may silently accept an incorrect proportion.
6. A valid committed module creates real walkable geometry. Passing the room requires physically traversing it. There is no hidden “correct ratio” flag that teleports the player or opens a different door while the geometry remains wrong.
7. Manipulation is kinematic and reversible; this is not a loose-object stacking simulator. Do not move a module while the player stands on or inside it. R undoes the last committed manipulation and restores both rendering and colliders. A room reset returns its authored state without erasing earlier rooms.
8. Walking off a ledge returns the player to that room's entrance in under one second. No lives, death animation, score loss or full-building restart. An impossible preview is useful feedback, not a failure screen.

## First sixty seconds: a concrete solvable room

Use a horizontal gap **6 m** long, outer width allowance **1.8 m**, and ceiling **3.2 m above the walking deck**. Docking aligns the deck tops with the surrounding floor. The player capsule is **1.65 m high**; keep its actual radius and collision margin consistent with the displayed walkable opening.

Two structural gallery modules are visibly available. Baseline dimensions are length along travel × outer height above deck × outer width:

- Tall arch: `3 × 1.8 × 1 m`. Spanning 6 m requires `s=2`, producing `6 × 3.6 × 2 m`. It conflicts with both ceiling and width; reducing its factor makes the span too short.
- Low gallery: `4 × 1.6 × 1 m`. At `s=3/2`, it becomes `6 × 2.4 × 1.5 m` and fits. Its authored internal opening is 1.4 m high before scaling, therefore **2.1 m** after scaling, sufficient for the player. Its deck and frames must match these measured dimensions.

Sequence:

- **0–10 s:** enter a sunlit concrete hall, move to the real gap and see daylight through the far exit. The two modules have distinctive structural silhouettes, not inventory cards.
- **10–25 s:** select the tall arch and enlarge it toward the span. The preview visibly strikes the ceiling and walls. Optional measurements show `3×2=6` and `1.8×2=3.6`; the environment explains why matching one length is insufficient.
- **25–45 s:** select the lower gallery. Use its 4 m baseline and the 6 m span to choose `6/4=3/2`. Commit it when its full geometry fits.
- **45–60 s:** walk through the gallery across the gap. A moving patch of light reveals the next space; a restrained architectural sound confirms the connection. No congratulatory quiz modal interrupts the walk.

The mathematical decision changes the playable space itself. Do not simplify this to choosing a number from three buttons.

## Five-to-ten-minute scope and progression

Build **one connected museum with five compact chambers**, not a set of timed delivery missions. Target a first unassisted visit of 5–10 minutes. Each space establishes a new constraint, and earlier spaces remain visible through windows or openings. Completion is crossing the final light-well threshold after traversing all five spaces in order; the final view shows the connected route the player made.

1. **Span and clearance:** the exact first-minute room above. Fit several dimensions with one factor.
2. **The inverse gallery:** a large module must shrink. An authored 4 m baseline must fit a 2 m socket, so `s=1/2`; make the matching width and opening remain genuinely traversable. This tests target/source rather than reflexively multiplying by two.
3. **The wrong family:** two candidate frames have different aspect ratios. One cannot satisfy the required span and clearance for any supported uniform factor. Choose the appropriate proportional component or authored orientation; do not unlock nonuniform scaling as a workaround.
4. **Drawing and building:** a clearly labelled `1:50` plan shows an 8 cm span, representing 400 cm = 4 m in the room. The player resizes a 2 m baseline component by `s=2`. Plan centimetres and world metres are explicitly different quantities; screen pixels are not a ruler. The physical placement still determines passage.
5. **Independent transfer:** combine a shrink placement and an enlargement placement in one final route with different dimensions and no pre-highlighted answer. No new controls, random unsolvable geometry or arbitrary unseen rule.

The critical path teaches ordered ratios, equivalent proportions, scale direction and preservation of corresponding lengths. A floor-grid view may show that a uniformly enlarged surface has area factor `s²`, but make that an optional, explicitly labelled extension, not an extra required lesson or an unexplained energy tax.

## Curriculum and misconceptions

Use the actual saved Workbook grade-8 scope, not invented module routes:

- [Scale snapshot](/Users/acedzn/idea-plotter/reports/math-games-2026-10-24/curriculum/scale.json): `https://math.workbook.co.il/grade-8/chapter-2/scale`.
- [Ratio meaning](/Users/acedzn/idea-plotter/reports/math-games-2026-10-24/curriculum/ratio-meaning.json) and [proportion equations](/Users/acedzn/idea-plotter/reports/math-games-2026-10-24/curriculum/proportion-equations.json), grade 8 chapter 2.
- [Perimeter/area ratio extension](/Users/acedzn/idea-plotter/reports/math-games-2026-10-24/curriculum/perimeter-area-ratio.json), grade 8 chapter 6.

Counter these errors through actual placements: reversing the ratio; treating `1:50` as enlargement; mixing cm and m; matching length while ignoring proportional height/width; adding the same amount to each dimension instead of multiplying each by the same factor; inferring length from perspective. If the area extension is shown, distinguish `s` for lengths/perimeters from `s²` for areas. Retain unit labels and the direction of each comparison in help and feedback.

## Camera, controls and interface

Desktop first-person: WASD walk, mouse look, Shift slow inspection, E select/release, wheel or Q/E while selected resize, left-click commit, right-click rotate, R undo, Tab toggle the measurement overlay, Escape release pointer lock/pause. E's meaning must depend visibly on selection state. No required jump, sprint, grappling hook or third-person switch. Keep ordinary walking around 3 m/s with comfortable collision stepping; prevent jumping around the structural puzzle.

Use a small reticle, a contextual component label and an unobtrusive exact-factor control. Measurements attach to world edges and stay legible without covering the room. Show both text/symbols and color for fit conflicts. Help can reveal the calculation on demand and records assistance; do not automatically reveal the correct factor or make all playable routes green. Default camera has no head bob or forced shake; offer look sensitivity and invert-Y. Pause on focus loss and make pointer-lock recovery obvious.

## Independent visual thesis and original assets

Monumental cast concrete, knife-edge sunlight, long shadows, ivory dust and a single restrained ultramarine accent. Tall negative spaces and precise silhouettes carry composition. Doors, decks and frames feel architectural and heavy rather than collectible or toy-like. Sound is air, footsteps, distant resonance and a concise structural settling sound. No floating coins, neon HUD frame or reusable robot mascot.

Generate original Tripo art through Chrome: a distinctive fractured concrete light-well sculpture or monumental aperture and small compatible surface ornaments. Put it visibly in the real game and credit/provenance records. Keep calibrated openings, floors, docks and all measured edges explicit in authored geometry; generated sculptural complexity stays outside those mathematical surfaces. Inspect the result before accepting it. Do not use a generic existing GLB as the whole visual identity or reuse withdrawn project assets.

## Meaningful verification and production proof

Tests must establish the relationships and actual play, not copy the implementation:

- Scale `(4,1.6,1)` by `3/2` → `(6,2.4,1.5)` in both visible structure and collision bounds. Tall arch `s=2` is blocked for the correct two dimensions; shrinking it does not magically span the gap.
- Reciprocal case, equivalent factors, same-unit conversion for the 8 cm `1:50` plan, and the impossible-aspect-ratio case. A rotated module exchanges the appropriate axes without altering its shape.
- Undo/reset restores transforms, collision geometry and selection state. Invalid commits do not trap the capsule or erase a previous valid route. All five authored chambers have a demonstrated solution and remain traversable at ordinary frame rates.
- A real browser playthrough starts at the entrance, uses resize/commit controls, crosses every actual structure and reaches the final trigger. Also demonstrate an incorrect fit and recovery. Capture moving first-person gameplay showing depth and parallax, not only a screenshot or synthetic “won” state.

Deliver a working production build and verify the production preview on port 4181, model/texture loading with a fresh cache, no console errors and correct relative/base paths for later Vercel hosting. Follow CREW_COMMON for budgets and proof files. Include controls, source modules, exact level dimensions/solutions, asset provenance, real tests run, measured build size/performance, known issues, repo URL and commit. A passed build or valid GLB does not by itself prove the puzzle is enjoyable: play it continuously and report any clumsy manipulation, unreadable clearance or stalled first-minute learning moment.
