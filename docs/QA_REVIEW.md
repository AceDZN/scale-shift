# Independent math and playability review

Reviewer role: independent crew contributor. Review date: 24 October 2026. No Git index, commit or push operations are owned by this role.

## Initial design audit

Read `AGENTS.md`, `BUILD_HANDOFF.md`, `CREW_COMMON.md`, `USER_REQUEST.md`, `GAME_IDENTITY.md`, the installed `develop-web-game` and `frontend-skill` workflows, and the four actual Workbook snapshots cited in `CURRICULUM.md`.

The identity passes the portfolio distinction checkpoint: its verbs are inspect, resize, rotate, commit and physically cross; the camera is first person; the governing decision is a simultaneous dimensional fit. No courier, retrieval, robot or combat loop is needed to enact the mathematics.

Verified by arithmetic from the handoff:

- Gallery witness: `(4,1.6,1) × 3/2 = (6,2.4,1.5) m`; internal headroom `1.4 × 3/2 = 2.1 m`, sufficient for a 1.65 m capsule.
- Tall-arch counterexample: `(3,1.8,1) × 2 = (6,3.6,2) m`; 0.4 m too high and 0.2 m too wide for the first socket.
- Inverse-gallery requirement: shrinking by `1/2` must retain body clearance; its baseline internal height must be at least 3.3 m plus any explicitly documented skin.
- Plan conversion: `8 cm × 50 = 400 cm = 4 m`; the 2 m module therefore uses resize factor `2`, distinct from drawing scale `1:50`.

## Verification contract

The test suite must check independent witnesses and counterexamples rather than simply repeat implementation formulas. It must test all supported discrete factors when proving an impossible family, horizontal orientation changes, rejected commits retaining existing geometry, safe occupied rejection, undo, falling and recovery, pause, input reset, and a changed final situation requiring both shrink and enlargement.

Browser observation must cover the complete route using ordinary controls. Calling `advanceTime` is acceptable to advance held input deterministically; injecting solved state, player position or win flags is not a playthrough. A successful fit must create the actual rendered and walkable deck. The reviewer must inspect gameplay images past the start screen and check correspondence with `render_game_to_text`.

The installed action client supports only arrows, Enter, Space, A/B and mouse buttons. It will be used for its supported action loop; supplementary ordinary keyboard/wheel browser automation is needed for G/Q/E/R/Tab/Escape and exact full-route interaction.

## Implementation and browser findings

`npm test` passed 16 independent domain tests. The suite covers the exact opening witnesses, all six authored socket solutions, 102 impossible-family factor/orientation combinations, rotation, reciprocal ratio rejection, centimetres/metres conversion, fraction formatting, unsupported factors, alignment/skin boundaries, preserved geometry on rejection, occupied mutation/undo guards, a complete model walk from `z=2` to `z=83` with no position injection, final changed factors, falling, entrance recovery, aperture bypass prevention, pause and bounded movement.

Source review of `scene.ts` confirms that the authored module root uses one scalar transform, and its supported 90° orientation exchanges the same horizontal extents as the model. The 0.08 m authored corner posts match the model's 0.16 m subtraction from internal width for all modules currently in the authored chambers. The GLB sculpture is outside this mathematical and collision contract.

An input-focus concern was reported to the lead: the first `keydown` guard in the initial `main.ts` ignored every key while an `INPUT` was focused, including Escape. The lead repaired the guard so only native range-navigation keys are intercepted. Final browser verification is still required.

The independent `npm run build` completed successfully. Its generated JavaScript was 604.13 kB / 158.95 kB gzip and CSS 6.96 kB at that revision; Vite reported its ordinary large-chunk advisory. These are measured output sizes, not a frame-rate claim.

### Actual gameplay images inspected

The reviewer opened all six lead-captured 1440 × 900 images under `playtest-output/browser/`: `01-rejected.png`, `02-gallery-preview.png`, `03-first-crossing.png`, `04-rotation.png`, `05-calibrated-plan.png`, `06-transfer.png`. They show a rejected arch, a valid gallery preview, a camera inside the committed passage, the rotated family, the calibrated-plan state and the final changed span. The distinct inside/outside camera occlusion and pillar parallax support that this is a real scene rather than a background bitmap. These observations do not independently prove every input in the lead's browser trace.

The quantity table retains LTR ordering, the first gallery displays `(6.00,2.40,1.50) m` and 2.10 m headroom, and the rejected arch exposes both outer-width and height conflicts. The plan explicitly distinguishes `1:50` from module factor `2`.

Issues sent to the lead before final capture:

- A stale rejected-fit notice persisted beneath the valid gallery preview. The lead reported repairing selection/resize/rotation messages; recapture is needed.
- Chapter/header dark text loses contrast beneath the low dark soffit in the inside-gallery image. A stable small backing or stronger halo is needed for consistent readability.
- The table's `bdi` quantity cells display correctly, but dynamically composed rejection sentences had plain mixed-direction text, visibly placing `m` before some numbers. Each measurement must receive LTR isolation, including in the notice.
- The factor line initially displayed `3/2 × 1.50` and `2 × 2.00`, which suggests multiplying the rational and decimal representations. It must display equivalence (`3/2 = 1.50`) or use a single multiplication marker before one representation.
- A conflicting preview is orange and mathematically rejected, but an optional more local mark on the conflicting ceiling/side surface would make the physical clash easier to distinguish.

Follow-up source inspection confirms the lead applied the `=` factor representation, LRI/PDI isolation around numeric-unit rejection strings, and the slider key guard repair. These repairs are not marked visually verified until refreshed actual captures are inspected.

The installed action client was invoked with actual movement actions. Concurrent development navigation destroyed its page context before it produced a capture. A supplemental ordinary-control script could not launch because the project's expected Playwright browser version was absent. No replacement browser was installed. These attempts are recorded as incomplete, not successful verification.

Independent browser traversal, production preview, final repaired images and comparison with the generated visual target remain pending. Domain traversal is not browser evidence. No claim of human enjoyment or learning gain is made.
