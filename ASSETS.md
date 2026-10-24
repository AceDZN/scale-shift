# Asset provenance — Scale Shift

## Light-well sculpture

- Runtime file: `public/models/light-well.glb`.
- Created through the user's authenticated Chrome Tripo UI, in the dedicated **🏛️ Scale Shift** session. No provider API, token, substitute generator, or downloaded library model was used.
- Task: [5db10994-f0d9-466c-b6a7-eb8e4cd0f38c](https://studio.tripo3d.ai/workspace/generate/5db10994-f0d9-466c-b6a7-eb8e4cd0f38c).
- Created: 24 October 2026. H3.1, normal Geometry & Texture generation. Generate button displayed **45 credits**. One generation submitted. Other crews used the account concurrently; balance differences are not a spend attribution.
- Normal Export dialog: GLB, 1K texture resolution. Download completed through the visible Export control to the user's Downloads directory. No signed download URL is stored.
- The generation began before the owner's later image-target instruction arrived. It is retained for review against that target; no new generation will be submitted before the target breakdown.

Exact submitted prompt:

> A single monumental architectural light-well sculpture for a quiet first-person spatial puzzle museum. Ivory cast concrete, one vertical rectangular monolith with a dramatic circular aperture cut through its upper half and three staggered stepped fins sweeping around its lower base. Brutalist, precise planar faces, subtle sand grain and faint casting seams, warm off-white stone, one narrow ultramarine painted inset. Elegant negative space, strong simple silhouette, sculptural landmark, human scale about four meters tall. Isolated single object, complete base, no environment, no text, no logo, no people, no robots, no machinery. Optimized game prop with restrained surface detail.

The generated result interprets the aperture as a blue keyhole inset and has a stepped base. This interpretation is decorative; it is not advertised as a mathematically open aperture or used as a walkable puzzle surface.

### Local processing and integrity

Original downloaded GLB: **34,802,204 bytes**, **964,380 triangles**, one mesh/material, three textures, zero animation clips. The unprocessed download is outside the repository.

Original SHA-256:

```text
c44745a69eee4f90868a14d3a4f020b89374b1f0cfa18e225d6cd72e1292b52c
```

Processing used standard local mesh tools, without another generative service:

```sh
npx --yes @gltf-transform/cli optimize SOURCE.glb INTERMEDIATE.glb --compress false --simplify true --simplify-ratio 0.035 --simplify-error 0.003 --texture-compress webp --texture-size 1024
npx --yes gltfpack -i INTERMEDIATE.glb -o light-well.glb -si 0.12 -sp -sv -se 0.01 -noq -r local-report.json
```

Versions: glTF Transform **4.5.1**, gltfpack **1.3**. An intermediate conservative simplification remained too dense (258,523 triangles); gltfpack's permissive attribute-boundary simplification produced the browser asset. It uses ordinary unquantized geometry and embedded WebP textures (`EXT_texture_webp`), with no external mesh decoder or texture network request.

Runtime output: **1,023,788 bytes**, **31,022 triangles**, one mesh/material, three textures. Runtime SHA-256:

```text
249c9ea0de3cb9129f78a213b4c935af78eb3fb3882fcfe5ffe32b51443ef644
```

The renderer loads this local GLB in the actual first chamber and final light well, normalizes it uniformly to 2.7 m / 4.2 m height, grounds it on a 0.22 m pedestal, and enables its material and shadows. It is a static prop, with no claimed rig. `render_game_to_text().render.assetReady` and `sculptureCount` expose actual loading/integration status. Bounds and material verification is recorded with the gameplay review.

### Usage terms

The source is newly authored text, with no third-party reference character or copied sculpture. [Tripo's official commercial-use guide](https://www.tripo3d.ai/help/privacy-policy/how-to-use-tripo-models-commercially) distinguishes paid-plan output rights from free-plan output rights; its linked [Terms](https://www.tripo3d.ai/terms) are authoritative. A read-only check of the same authenticated account menu on 24 October 2026 visibly showed **Pro**. This check did not change the account or subscription. The original prompt contains no third-party reference art. Output use remains subject to Tripo's terms; this repository does not grant a separate blanket license over the generated asset. No new subscription, upgrade, purchase, or terms acceptance was performed.

## Exact architecture and interface

All decks, measured portal modules, posts, roofs, clearance sleeves, dimension lines, metre marks, museum slabs and collision dimensions are authored primitives in metres. Each portal has 0.08 m baseline corner posts, a 0.15 m baseline deck below y=0, roof bottom at its internal opening and roof top at its outer height. Whole portal groups receive one uniform scale and a supported quarter turn; decorative meshes never supply collider dimensions.

Concrete surface grain is a seeded 128×128 local canvas texture. World dimension sprites use system Arial; the Hebrew HUD uses the locally bundled Heebo font documented below. No runtime font is downloaded. Web Audio tones/footsteps are synthesized locally. No external runtime assets or audio recordings are required.

## Canonical gameplay target and breakdown

Inspected `docs/visual-targets/gameplay-v1.png` and its corrected prompt/review notes on 24 October 2026. This is a generated gameplay **design target**, not a captured or playable build.

| Target element | Implementation / authority |
| --- | --- |
| Eye-height spatial view with an open gap | Real perspective camera from the player's 1.65 m eye; actual open void, floor and committed deck |
| Translucent ultramarine gallery and visible side faces | Exact authored portal mesh; uniform `(s,s,s)` transform; open space between thin front/rear receiving frames |
| Warm ivory architecture, long sun shadows, blue sky | Local concrete grain, restrained materials, directional sun with cached real shadows |
| Circular sculptural destination | Local Tripo blue-keyhole monolith at the entrance and finale; additional decorative circular aperture past the reachable finish |
| Compact factor and commit strip | Lead-owned Hebrew HUD, LTR formulas and measured units; numerical dimensions override inconsistent reference proportions |
| Six metre witness | Baseline low gallery `4 × 1.6 × 1 m`, scale `3/2`, rendered dimensions `6 × 2.4 × 1.5 m`, internal opening `2.1 m` |

The existing Chrome-Tripo sculpture is compatible with the target's ivory/ultramarine sculptural language. It is reused without spending the second generation. Procedural measured geometry is intentionally retained because generated perspective pixels are not calibrated dimensions. The build is quieter and less ornamented than the image target; no foliage, water simulation, imported stone courtyard, or photoreal quality is claimed.

## Hebrew type

The lead bundles Heebo Hebrew weights 400/500 from `@fontsource/heebo` locally through Vite. Heebo is distributed under the SIL Open Font License (OFL); retain the package license with redistribution. No runtime Google Fonts or other remote font fetch is required.

The world-to-render mapping reflects authored Z into Three's right-handed coordinate system. Authored `+X` remains visually right, `+Z` forward; camera position/yaw use the matching reflection. The generated prop's blue keyhole face was checked in actual gameplay rather than inferred from its source preview. Its packed accessor bounds are approximately X `[-0.18230,0.18289]`, Y `[0.00003,0.97953]`, Z `[-0.36453,0.36417]` before uniform normalization.

## Approved guided rebuild v2

Current guided gameplay uses `src/guided-scene.ts`. The original Tripo asset is preserved unchanged; its two fixed guided-world placements are uniformly normalized to 3.3 m on the sun court and 3.6 m on the final light court. No new Tripo generation, export, subscription or credit spend was needed for the rebuild. The earlier 2.7 m / 4.2 m placements describe the retained first implementation.

The approved v2 storyboard was inspected before writing the new scene. Later set-piece targets `docs/visual-targets/rebuild-v2/staircase.png` and `two-shores.png` were generated with the built-in image_gen tool, saved locally and inspected before implementing their exact scene geometry. Exact prompts and review caveats are in `LATER_SETPIECES.md`; `later-manifest.json` records hashes. These are generated design targets, never gameplay evidence.

The guided world contains the five authoritative platform rectangles from `adventure.ts`, with deck tops at y=0 or y=1, built once and retained through every crossing. Module groups use one uniform scale and the authoritative near-deck pivot. The stair structure has 12 solid step volumes with top rise `base.rise × (i + 1) / 12`, 0.04 m baseline boundary posts and no gallery roof. Gallery posts remain 0.08 m at baseline. Exact authored colliders and dimensions remain independent of the decorative Tripo mesh.

Arcaded support walls, the circular vista, concrete panel joints, restrained plant silhouettes, inlays and water surface are procedural local art. The water is a textured plane with subtle normal-map drift, not a fluid or reflection simulation. Reduced motion freezes its drift and the destination pulse; the connection transition changes only the active structure's material wash, preserving its exact transform. Only local mesh geometry, Web Audio and bundled fonts are required at runtime.
