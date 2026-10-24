# Independent guided-adventure QA

Status: rebuild approved by the human; implementation verification pending. The original baseline's passing tests did not establish usable controls or enjoyable play. This review evaluates the redesigned interaction separately.

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

Planned checks include independent witnesses and changed counterexamples; all-axis transforms; drag release/cancellation; preservation of prior geometry; support sampling through bridge and stair paths; stop/resume/pause; occupied mutation guards; undo/retry; and input/capture critique after the lead's real browser test.

No v2 browser run, usability improvement, enjoyment or learning gain is claimed by this initial audit. The lead owns browser automation to keep host load controlled. Expansion and human playtest gates remain as stated in `REBUILD_V2.md`.
