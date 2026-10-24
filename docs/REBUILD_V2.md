# Scale Shift — interaction replan v2

Status: design proposal and generated mockups. **No rebuild code has started.** The existing playable baseline is preserved at main commit `4d4beb2`; its numerical checks do not establish usability or fun.

## Direct human feedback

> It's weird, I barely understood what to do, it feels weird af, it's boring, its too hard (not because the math - because the gameflow / controls / etc...) Let's plan and rebuild it in a fun way. don't forget to create mockup screenshots before starting working on it... we may need a full replanning for this

This supersedes finishing/polishing the previous interface. Both actual crew members stopped production verification and reviewed the redesign. No new Tripo generation or credit spend was performed.

## Diagnosis

The first minute asks the player to learn navigation, mouse look, selection, family switching, scaling, rotation, committing and measurement mode. The resize effect points mostly away from the camera, making its consequence hard to read. Repeating forward corridors offers little discovery after a solved fit. The player's criticism is about interaction and reward, not a missing mathematical hint.

## Recommended direction: guided spatial adventure

**Click to walk. Drag to reshape. Release to connect.**

The first puzzle presents one structure and one obvious destination. The architecture supplies the controls. Keyboard navigation and a numeric inspector are optional later exploration tools, not entry requirements. One destination click starts the entire crossing. A second click stops safely on supported geometry; the visible pause control/Escape freezes movement. Reduced motion removes head bob and sweeping camera transitions, retaining short steady movement with pause/cancel. The undo icon has a Hebrew accessible name and a text tooltip. Guided movement is continuous first-person walking through actual geometry, with parallax and footsteps; it cannot cross an unsupported route. One visible corner handle scales the complete structure uniformly about its near-deck pivot. Camera views are authored to show the length, height and width together.

### The first 60 seconds

| Time | Player action | Observable consequence |
| --- | --- | --- |
| 0–5 s | See the far sunlight, gap and one highlighted handle | Next action reads “גררו להגדלה”; no menu or control manual |
| 5–20 s | Drag the handle | Whole gallery grows in all three dimensions; exact edge labels update |
| A mistaken drag | Overshoot or hit a clearance surface | Only the actual conflict is hatched; one plain-language correction appears; the handle remains usable |
| 20–35 s | Reach a valid transform | Handle prompt becomes “מתאים — שחררו”; no second commit mode |
| Release | Let go | The valid ghost settles into solid, walkable architecture with restrained sound/light feedback |
| 35–60 s | Click the far footprint marker | Camera walks across the real deck, revealing a markedly different space |

For an invalid release, retain the previous committed geometry and keep the editable preview available. Never erase the attempt, throw a failure modal or require a full restart. Pointer cancellation restores the pre-drag transform. A small accessible undo action remains available. Touch uses the same drag/release/destination gestures.

## Spatial variety and reward

1. **A bridge of light.** One short gallery grows across a visible gap. Oblique camera, clear ghost-to-solid transition, sunlight joins the two spaces.
2. **The balcony staircase.** Shrinking an oversized stair structure makes it fit a measured side bay and reach a balcony. Its lower landing, upper landing, total rise, tread depth and headroom need a verified uniform-scale witness before rendering. Walking up gives a new elevated view of the museum.
3. **Two shores of the light well.** New dimensions require one shrink and one enlargement around different sides of a circular courtyard. The first crossing changes the view and access to the second. Family choice and rotation can enter here after the core gesture is familiar.

The reward needs to change route, elevation, light or perspective each time. These set pieces must each receive arrival/action/payoff mockups before their implementation. A decorative reward animation alone does not establish fun.

## Math retained

The introductory gallery remains baseline `4 × 1.6 × 1 m`, opening `1.4 m`; factor `3/2` yields `6 × 2.4 × 1.5 m`, opening `2.1 m`. The full gap is 6 m, not an additional 6 m after the initial 4 m. The redesigned introductory room is explicitly **span-only**: width and ceiling are generous, nonbinding surfaces, rather than invisible restrictions. Later rooms introduce width/ceiling one at a time as obvious physical clearance surfaces. The original simultaneous-clearance puzzle remains a later mathematical witness, not the first control lesson. All whole-structure transforms, colliders and walkability share authoritative metre geometry. Drawing scale and resize factor remain distinct. Existing Workbook source mappings and witnesses can be reused; a new geometry requires a new witness.

## Generated mockups and crew review

- `visual-targets/rebuild-v2/01-drag-v2.png`: corrected arrival / single drag affordance, one current→target label.
- `visual-targets/rebuild-v2/01b-overshoot.png`: a corrected failure concept, visibly extending into the far dock with hatching only at the conflict; the handle remains usable.
- `visual-targets/rebuild-v2/02-release.png`: uniformly larger valid preview / explicit release cue.
- `visual-targets/rebuild-v2/03-inside-v2.png`: inside-the-gallery crossing / new balcony view, with no repeated destination instruction during motion.
- `01-drag.png` and `02-cross.png` remain earlier drafts for provenance, not the selected final storyboard.
- These images were generated with built-in image_gen before any rebuild code. They are interaction proposals, not actual gameplay captures.

Both independent QA and visual contributors found the one-handle, ghost-to-solid and destination sequence clearer to interpret. They explicitly did not claim enjoyment from images. Review caught these issues; the selected revised images address the dimension-origin ambiguity, telescoping outline, release cue and inside-crossing view. Numerical image proportions are still illustrative:

- Start current/target dimensions from the same authored dock, or use a single current→target numeric label. Existing arrow placement can wrongly imply an extra 6 m.
- A larger whole outline must grow in width and height too. A dashed extension in length alone suggests telescoping.
- Include a valid-drag frame with “מתאים — שחררו”.
- Use “לחצו כדי ללכת” for the destination and include an inside-the-gallery crossing frame.
- First failure draft was rejected because it did not overshoot the dock. The corrected selected failure image shows an actual overlap beyond the lip. Its perspective still cannot replace numerical collision tests.
- Review of the inside frame removed the repeated walking instruction: one click initiates a full crossing.
- The first-room width/ceiling limits are explicitly nonbinding to avoid invisible restrictions; later constraints need visible surfaces.
- Mock up the staircase and two-shore space before expanding beyond the first loop.

## Build and playtest gates

1. Review the interaction direction and corrected first-minute storyboard.
2. Rebuild the first 60 seconds only. Reuse compatible local Tripo art; exact surfaces stay procedural.
3. Check input with ordinary mouse/touch: no pointer lock, wheel, keyboard shortcut or hidden mode is needed to solve the first room.
4. Independently verify uniform scale, invalid release/cancellation, undo, correct collider creation and inability to click-walk through empty space.
5. Capture actual gameplay at the mockup's camera/state and compare it, including a real-time crossing.
6. Ask the human to play that minute and report where they hesitate and whether the reveal feels rewarding. Passing automation cannot replace that response.
7. Expand to the staircase and light-well transfer only after the basic interaction has been tried.

A direction question was sent to the human: guided click/drag adventure (recommended), simplified free exploration, or a completely new loop retaining only the scale idea. This document is the concrete guided proposal to evaluate, not a claim that a redesigned game is already implemented.
