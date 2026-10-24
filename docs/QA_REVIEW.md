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

An input-focus concern was reported to the lead: the first `keydown` guard in the initial `main.ts` ignored every key while an `INPUT` was focused, including Escape. It needs browser reproduction and verification after repair.

Browser traversal, production verification and comparison with the generated visual target remain pending. Domain traversal is not browser evidence. No claim of human enjoyment or learning gain is made.
