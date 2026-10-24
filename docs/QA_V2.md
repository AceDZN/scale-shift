# Independent guided-adventure QA

Status: independent numerical/state checks and review of captured production mouse/touch verification pass; human usability and enjoyment verdict pending. The original baseline's passing tests did not establish usable controls or enjoyable play. This review evaluates the redesigned interaction separately.

Read `REBUILD_V2.md` and inspected the selected generated drag, release and inside-crossing storyboards. They are planning images, not gameplay evidence. The authoring contract is **one visible handle → uniform drag → valid release connects → one destination click walks continuously through the physical route**.

## Independent numerical witnesses

| Set piece | Authored baseline and target | Exact witness |
|---|---|---|
| Introductory light bridge | Gallery length 4 m, outer height 1.6 m, width 1 m, opening 1.4 m; gap 6 m | `s=3/2` yields length 6 m, outer height 2.4 m, width 1.5 m and opening 2.1 m. Width/ceiling are nonbinding in this control lesson. |
| Balcony staircase | Baseline run 4 m, rise 2 m, width 3 m; landing 2 m forward and 1 m above the lower dock | `s=1/2` yields run 2 m, rise 1 m and width 1.5 m. With 12 steps, riser height is `1/12 m` and tread depth is `1/6 m`. The rise/run ratio remains `1/2`; step count does not change. |
| First light-well shore | Baseline span 4 m; target span 3 m | `s=3/4`. Every corresponding dimension must shrink by the same factor. |
| Second light-well shore | Baseline span 3 m; target span 6 m | `s=2`. The preceding factor cannot be reused. Explicit clearance surfaces remain authoritative. |

The stair witness requires more than an enclosing box: the lower tread must join the entrance floor, each successive tread must support the player, and the upper landing must join the fixed balcony at `(run,rise)=(2,1) m`. A renderer may smooth the camera while walking, but it cannot substitute an unsupported floating path for those surfaces.

## Interaction and support contract

- Releasing a valid drag installs the same transformed geometry that was previewed. No extra commit mode is required.
- An invalid release keeps both any previous valid geometry and the editable preview. It must never install the invalid transform.
- Pointer cancellation restores the factor from before that drag; it must not connect a route accidentally.
- Destination input cannot cross an unbuilt route. Walking follows supported continuous waypoints; it does not teleport across the gap or advance completion merely because a factor is correct.
- One click begins the entire crossing. A second click stops at the current supported point. Resuming continues the remaining route without rewinding, skipping or snapping to a distant waypoint.
- Pausing freezes progression and route position. An occupied structure cannot be resized, removed or changed by undo, including while walking is stopped.
- The first mouse/touch solve requires no pointer lock, keyboard navigation, wheel, hidden selection mode or separate commit control.
- An invalid-drag cue must identify the actual span/clearance conflict. Hidden limits and mockup pixel measurements are not acceptable mathematical constraints.

## Evidence and limits

`node --import tsx --test tests/adventure.test.ts` passes **16/16** independent v2 domain tests. These verify the four exact witnesses; all-axis transforms; the renderer's pure coordinate transform against four independently specified world endpoints; changed targets, reversed ratios and malformed scales; body passage width; valid/invalid release; pointer cancellation; duplicate drag starts; preservation of prior valid support; previews supplying no support; click stop/resume; occupied mutation guards; pause; undo/retry; active-stage-only undo; and a deliberately removed support surface stopping movement safely.

The suite traverses all four routes using the normal model actions and fixed simulation steps, without setting player positions or completion flags. Each moving step must remain within the walking speed bound and put the player's feet on `supportAt`. Independent samples check all twelve tread midpoints, the lower approach and upper landing. This proves the authored numerical routes, not the finished rendered content or usability.

Review found and the lead repaired three issues before this passing run: a duplicate drag start could replace cancellation state; fit evaluation lacked a minimum usable passage width; and undo after advancing could remove the previous set piece rather than the currently visible structure.

Initial renderer inspection found that its early gallery-only stub did not yet represent the staircase or raised landings. The lead identified it as an intermediate implementation and assigned a persistent-world rewrite using the explicit platform data and twelve actual stair meshes. The follow-up below records the subsequent agreement check; the passing model tests were not treated as proof of the initial stub.

### Persistent scene follow-up

The rewritten renderer imports the authoritative `PLATFORMS`, places each floor top at its specified `center.y`, builds the world once and retains earlier committed structures. Its staircase creates twelve baseline tread blocks: tread `i` has height `rise × (i+1)/12` and depth `length/12`, then the complete root receives the uniform factor. Gallery posts use the same 0.16 m baseline interior-width subtraction used by the rules; stair rails use the same 0.08 m total baseline boundary. The measured bridge endpoints and dock pivots agree with `guidedWorldPoint`.

Review caught an ambiguity between stair rise and its rail-inclusive outer height. The lead separated them: baseline rise is 2 m and outer height is 3.4 m, giving 1 m rise and 1.7 m outer height at `s=1/2`. The angled handrail's centreline was lowered to account for its thickness, so the actual mesh does not exceed that declared outer height.

The final browser report contains seven checks against actual `THREE.Box3` mesh extents, rather than merely echoing the rules. Independent inspection of those results confirms:

| Current witness | Actual mesh length | Actual mesh width | Actual height above deck | Uniform root scale |
|---|---|---|---|---|
| Light bridge | 6 m | 1.5 m | 2.4 m | `(1.5,1.5,1.5)` |
| Staircase | 2 m | 1.5 m | 1.7 m | `(0.5,0.5,0.5)` |
| Near shore | 3 m | 1.5 m | 2.4 m | `(0.75,0.75,0.75)` |
| Far shore | 6 m | 1.6 m | 3 m | `(2,2,2)` |

Floating-point differences were below `1e-5 m`. Height above deck excludes the intentional deck thickness below the walking surface. The report also measures the rejected 7 m preview and cancelled/reconnected variants.

### Actual v2 captures independently inspected

The lead's production trace at `http://localhost:4181` reports a **1672 × 941** viewport, no console errors and no bad responses. Its recorded checks include ordinary mouse dragging/release, overshoot, cancellation, rendered uniform scaling, undo, four continuous crossings, physical stairs, stopping/resuming, camera preservation, pause/restart/resize, reduced motion, mute, malformed local data and GLB loading. This reviewer read the trace and opened these actual images under `playtest-output/guided/`:

- `01-arrival.png`, `02-overshoot.png`, `03-fit-release.png`, `05-inside.png`;
- `07-stairs-fit.png`, `08-stairs-climbing.png`, `09-balcony-reveal.png`, `12-light-well.png`.

The first-minute captures share the selected generated storyboard's viewport and broad oblique view. They visibly show one handle, a localized hatched overshoot, `×3/2` with a 6.00 m valid preview, and a changed first-person camera inside the solid gallery. The numeric label has a consistent LTR order inside Hebrew text. The interface does not require the previous inspector, pointer lock or navigation shortcuts. These are observed visual and input-trace improvements; they do not prove that a human finds the controls easy.

The staircase fit capture visibly contains twelve treads joining the raised balcony, and the following camera captures show ascent and a different elevated perspective. The imported Tripo monolith remains visible in actual play. The actual scene has sparser distant architecture, simpler foliage and water than the generated illustrations; those images are design targets, not pixel-accurate measured geometry.

One material ending issue was reported: the initial `12-light-well.png` faced blank sky/water behind the win overlay. The lead authored a supported final walking segment that turns toward the sculpture, and moved the completion panel to the lower left. The refreshed actual ending capture now visibly frames the Tripo sculpture and architecture. The model test independently verifies that the final look direction aligns with the authored reveal. Its effect on human enjoyment remains unmeasured.

### Touch and final limitations

The `playtest-output/guided-touch/report.json` trace passes all four crossings at **390 × 844**, with no errors and `allFingerPathsInsideViewport=true`. The reviewer inspected the ordinary touch-event script: every drag endpoint is asserted inside the viewport, and its eighteen intermediate points lie on that same inside-viewport line. The script performs touch start/move/end, release and destination taps, with `advanceTime` only advancing normal movement. It does not set solutions, player positions or progress flags.

Opened actual touch captures `fit-sunbridge.png`, `fit-balcony-stair.png`, `fit-far-shore.png` and `crossed-4.png`. The handle, Hebrew release cue, LTR factor/length and completion control are legible. Adaptive drag gain makes enlargement reachable within the phone screen. An early portrait view cropped substantial parts of the structure; the final renderer widens the vertical field of view to 90° below aspect 0.8 while retaining the same physical camera pose. Refreshed `01-phone-arrival.png`, `fit-sunbridge.png` and `fit-balcony-stair.png` restore the object/landing overview, with only some near-edge cropping on the enlarged gallery. Human interpretation of the phone view remains unmeasured.

The production trace verifies that the reduced-motion option disables ambient motion, and that stopping walking preserves the full camera pose and look target. Resize, pause and retry do not act as an unprompted teleport. Model tests verify the walking speed bound and physical support throughout the four crossings.

The lead also controlled the user's installed Chrome through native pointer input to enlarge and cross the first bridge, then shrink and climb the staircase. This reviewer opened `evidence/v2/chrome-stair-arrival.png` and `chrome-balcony.png`: they show the next scale problem and the reached elevated shore in that real browser. This is agent-operated browser evidence, not the human user's usability verdict.

The separate `tests/capture.mjs` recording uses real wall-clock walking after the destination click: it waits 4.1 seconds, asserts the camera is still moving inside the crossing, then waits for the next actual stage. `evidence/v2/capture-state.json` confirms a valid preview, a moving camera at approximately `(3.399,1.65,0) m`, arrival at the staircase, no errors and `realTimeWalking=true`. The resulting `walkthrough.webm` is 2,830,378 bytes. This review inspected its script, states and associated still captures rather than claiming a human video playtest.

The lead owns browser automation to keep host load controlled. This reviewer inspected source, actual captures, input scripts and traces rather than claiming a separate browser run. The generated city has more distant detail and richer foliage/water than the actual scene. Session duration, ease of discovering the drag gesture, enjoyment and learning gains remain unmeasured. Human playtest gates remain as stated in `REBUILD_V2.md`.
