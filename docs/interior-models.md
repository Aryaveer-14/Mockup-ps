# Interior GLB Models — Download Guide

The Porsche Configurator supports interior camera views when a model contains interior geometry. Below are free (CC Attribution) Sketchfab models with interiors that can replace the current placeholder GLBs.

## Current Status

| Car     | Current Model Has Interior? | Notes                                                   |
|---------|-----------------------------|---------------------------------------------------------|
| 911     | ❌ No                        | Exterior-only, 83 nodes / 45 meshes                    |
| Taycan  | ✅ Yes                       | Has `InteriorColourZone`, `InteriorTilling`, `SeatBelt` |
| Cayenne | ❌ No                        | Generic mesh names, exterior-only                       |

## Recommended Replacements (Sketchfab — CC Attribution)

### Porsche 911 with Interior
- **URL:** https://sketchfab.com/3d-models/porsche-911-with-interior-877b1bc1739f4a2bb65d62fd7ffd9f75
- **Author:** n.brizitskaya
- **Size:** ~40.7 MB GLB
- **Faces:** ~424K
- **License:** CC Attribution 4.0

### Porsche Taycan Turbo S (with HD Interior)
- **URL:** https://sketchfab.com/3d-models/porsche-taycan-turbo-s-project-cars-3-05d7951204e84686ba12625c66d7a8b7
- **Author:** VuckyZ
- **Size:** ~9.9 MB GLB
- **Faces:** ~182K
- **License:** CC Attribution 4.0
- **Note:** Current `taycan.glb` already has interior — this is a lighter alternative.

### Porsche Cayenne Turbo 2005 (Game Ready, with Interior)
- **URL:** https://sketchfab.com/3d-models/porsche-cayenne-turbo-2005-game-ready-0c21727cc75e4ecbb39c4eb5c78991ad
- **Author:** CCamo
- **Size:** ~3.7 MB GLB
- **Faces:** ~28K
- **License:** CC Attribution 4.0
- **Note:** Has separated interior parts (dashboard, seats, steering wheel)

## How to Download

1. Go to the Sketchfab model URL above
2. Sign in / create a free Sketchfab account
3. Click the **Download 3D Model** button
4. Choose **glTF** format (`.glb`)
5. Save to `public/models/` as:
   - `911.glb` (replacing existing)
   - `taycan.glb` (optional — current one already has interior)
   - `cayenne.glb` (replacing existing)

After replacing, update `src/data/cars.ts`:
```ts
// Set hasInterior: true for each model that now contains interior geometry
hasInterior: true,
```

## Attribution

When using these models, include attribution per CC 4.0 requirements:
- "Porsche 911 with Interior" by n.brizitskaya — CC BY 4.0 — via Sketchfab
- "Porsche Taycan Turbo S" by VuckyZ — CC BY 4.0 — via Sketchfab
- "Porsche Cayenne Turbo 2005" by CCamo — CC BY 4.0 — via Sketchfab
