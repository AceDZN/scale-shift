# Generated target versus actual gameplay

Independent review, 24 October 2026. This is an implementation comparison, not a claim of human enjoyment or learning gains.

## Materials inspected

- **Generated design target:** `docs/visual-targets/gameplay-v1.png`, 1672 × 941, with `PROMPT.md`, `REVIEW_NOTES.md` and `manifest.json`. It is an imagegen mockup and is never described as an actual captured game.
- **Actual valid-preview capture:** `playtest-output/browser/02-gallery-preview.png`, 1440 × 900, from the lead's ordinary-control browser playthrough.
- **Actual consequence/failure captures:** `01-rejected.png` and `03-first-crossing.png` in that same directory. The former shows the tall arch rejected at factor 2; the latter places the camera inside the committed gallery.
- Also opened actual rotation, drawing-scale and transfer captures, numbered `04`–`06` in the same directory.
- Opened `07-light-well.png`, which visibly contains the imported concrete monolith beside the win space, and `08-resize.png`, which shows the ongoing scene at 1024 × 768 after camera movement.

The first comparison is not at a matched viewport. A final production capture at 1672 × 941, the same valid first-room preview state and a comparable eye-height camera is required after repairs.

## Authoritative interaction and math state

Both target and valid actual capture depict a 4 m baseline gallery resized by `3/2` into a 6 m route, with outer height 2.4 m, width 1.5 m and headroom 2.1 m. The actual socket has ceiling allowance 3.2 m and width allowance 1.8 m. These authored values and the physically walkable deck take precedence over inferred pixel proportions in the generated illustration.

The actual game provides selection, supported 90° rotation, factor changes, commit, undo, measurements and physical walking. The lead's test traversed all six spans with ordinary controls. The independent reviewer has verified the model traversal and inspected the actual consequence images; a static mockup cannot establish those functions.

## Comparison and required follow-through

| Aspect | Generated target | Actual initial capture | Finding |
|---|---|---|---|
| Scene and camera | First-person eye height over an open architectural void, a broad gallery silhouette and distant light-well ornament | First-person axial view into a narrow repeated tunnel; tall continuous side abutments obscure the void and gallery side profile | Real depth and parallax are present, but the open-space composition materially differs. Expose negative space and the deck without weakening exact clearance rules. |
| Mathematical silhouette | Translucent gallery with visible thickness and open interior | Translucent blue roof, deck and four corner posts, authored independently of GLB art | Core resize/commit silhouette works. Decorative arches are optional; generated proportions must not override measurements. |
| Primary HUD | Compact bottom strip: factor, baseline→result, undo and commit | Large right inspector, central floating socket summary, bottom select action | Primary hierarchy differs. A compact contextual bottom factor/commit strip with secondary measurements is needed to approach the target. |
| Fraction and decimal | One multiplier `×3/2` | Initially `3/2 × 1.50` | The actual form implies an unintended multiplication. Show equivalent forms with `=` or parenthesized decimal. |
| Typography and RTL | Short Hebrew labels with LTR formula groups | Quantity table uses isolated LTR cells; failure sentences initially mix Hebrew with raw numeric/unit strings | Add isolation to every measurement in rejection notices and fit text. Bundle a Hebrew-capable local font as required by the handoff. |
| Input affordances | R undo and mouse commit after target correction | G selection, Q/E or wheel resize, click/Enter commit, right-click rotation, R undo, Tab measurements | Actual affordances serve the intended deliberate manipulation. Input-focus repair for Escape/WASD requires browser confirmation. |
| Failure feedback | Valid preview only; no rejected state shown | Orange conflicting preview plus width/height rows and rejection notice | Actual failure/recovery exists. Local marks on the conflicting surface would improve clarity. The initially stale rejection notice in the valid preview needs recapture after the reported repair. |
| Lighting/materials | Ivory concrete, warm sunlight, ultramarine, deep negative space | Warm concrete, blue guides and preview, sharp roof shadows | Palette and actual occlusion are coherent. Header text loses contrast beneath the low dark soffit; provide stable local contrast. |
| Generated asset | Large distant aperture sculpture provides a focal destination | Actual `07-light-well.png` visibly shows the imported concrete monolith at the ending, but the first preview crop does not include it | Its gameplay presence is visible. Final matched production capture should make the destination focal point legible without using generated art as a collider. |
| Secondary ornament | Vegetation, water, banners and curved decorative architecture | Restrained procedural concrete museum | These illustrative details are optional and do not justify new mechanics or hidden dimensional assumptions. |

## Status

Initial visual parity is **incomplete**. The current game is functional real 3D, but the scene composition and primary HUD hierarchy still materially differ from the canonical target. Final matching captures and verification of the repaired text, imported asset and input behavior remain pending. No generated image is used as gameplay evidence.
