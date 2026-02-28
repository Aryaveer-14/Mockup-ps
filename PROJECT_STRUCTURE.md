# Project Structure — Porsche Multi-Model Configurator

> Next.js 16 App Router · TypeScript · Zustand · R3F · Framer Motion

---

## Folder Tree

```
c:\Users\kuhuv\Mockup-ps\
├── public/
│   ├── models/                    ← GLB files (911.glb, taycan.glb, cayenne.glb)
│   ├── textures/                  ← Optional environment / environment maps
│   └── favicon.ico
│
├── src/
│   ├── app/                       ← App Router root (DO NOT add extra route files)
│   │   ├── layout.tsx             🔒 Root layout: html/body, globals.css import, metadata
│   │   └── page.tsx               ← Single entry: renders <AppShell />
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppShell.tsx       ← Phase controller — owns AnimatePresence + z-layers
│   │   │
│   │   ├── intro/                 ← DEV A
│   │   │   ├── IntroScreen.tsx    ← 3.8s sequence → setPhase('selection')
│   │   │   └── PorscheLogo.tsx    ← Inline SVG wordmark + crest draw animation
│   │   │
│   │   ├── selection/             ← DEV A
│   │   │   ├── SelectionScreen.tsx← Bottom-anchored 3-card grid
│   │   │   └── ModelCard.tsx      ← Thumbnail / name / price / "Configure →"
│   │   │
│   │   ├── scene/                 ← DEV B — single canvas, never fork
│   │   │   ├── SceneCanvas.tsx    🔒 Single R3F <Canvas> (ACESFilmic, dpr[1,2])
│   │   │   ├── SceneLighting.tsx  🔒 Immutable light rig + Environment="studio"
│   │   │   ├── CameraRig.tsx      ← Lerp camera, OrbitControls (configurator only)
│   │   │   ├── ActiveCarModel.tsx ← Suspense wrapper — mounts model by selectedCarId
│   │   │   └── models/
│   │   │       ├── Model911.tsx   ← GLB + fallback geometry, traverse color swap
│   │   │       ├── ModelTaycan.tsx
│   │   │       └── ModelCayenne.tsx
│   │   │
│   │   ├── configurator/          ← DEV C
│   │   │   ├── ConfiguratorPanel.tsx  ← Right sidebar w-[380px], slide-in motion
│   │   │   ├── StepNavigator.tsx      ← 4-tab bar, gold border-b active state
│   │   │   ├── ColorPicker.tsx        ← Swatch grid, metallic overlay
│   │   │   ├── WheelPicker.tsx        ← Option rows with SVG wheel icon
│   │   │   ├── InteriorPicker.tsx     ← Option rows with color swatch square
│   │   │   └── PackagePicker.tsx      ← Multi-select, togglePackage
│   │   │
│   │   ├── performance/           ← DEV C
│   │   │   ├── PerformanceSection.tsx ← Left hero column + stat grid
│   │   │   └── StatBar.tsx            ← 1px gold fill, CSS width transition + stagger
│   │   │
│   │   ├── ar/                    ← DEV A
│   │   │   └── ARSimulation.tsx   ← Full-screen AR sim, RAF scan line, corner brackets
│   │   │
│   │   └── summary/               ← DEV A
│   │       └── SummaryScreen.tsx  ← Right-panel receipt, formatPrice, resetConfig()
│   │
│   ├── store/
│   │   └── useConfiguratorStore.ts  🔒 Single Zustand store — owned by Dev C
│   │
│   ├── data/
│   │   └── cars.ts                🔒 CAR_REGISTRY + type contracts — add-only
│   │
│   └── styles/
│       ├── tokens.css             🔒 Design tokens — no edits without team sync
│       └── globals.css            ← @import tokens.css + Tailwind directives
│
├── ARCHITECTURE.md                ← 9-section spec (read before coding)
├── VISUAL_DIRECTION.md            ← 11-section art direction guide
├── PROJECT_STRUCTURE.md           ← This file
├── next.config.js                 ← transpilePackages: ['three'], Turbopack compatible
├── tailwind.config.js             ← p-* color tokens, radius/ls/leading scales
├── tsconfig.json                  ← @/* → src/*, strict mode
└── package.json
```

---

## File Responsibilities

| File | Responsibility | Owner |
|------|---------------|-------|
| `src/app/layout.tsx` | Root HTML shell, global CSS import, Next.js metadata API | Dev A |
| `src/app/page.tsx` | App entry point — mounts AppShell only | Dev A |
| `AppShell.tsx` | Phase state → renders the correct feature screen; mounts/unmounts SceneCanvas | Dev A |
| `IntroScreen.tsx` | Timed intro sequence, skip button, transition to 'selection' phase | Dev A |
| `PorscheLogo.tsx` | Animated SVG wordmark + crest — no external images | Dev A |
| `SelectionScreen.tsx` | Model selection grid, triggers `selectCar()` + `setPhase('configurator')` | Dev A |
| `ModelCard.tsx` | Single car card UI — no state, pure props | Dev A |
| `SceneCanvas.tsx` | Single WebGL canvas for the entire app — never instantiate a second Canvas | Dev B |
| `SceneLighting.tsx` | Light rig — do not change intensity/position without visual check | Dev B |
| `CameraRig.tsx` | Camera animation and orbital controls | Dev B |
| `ActiveCarModel.tsx` | Switches which car model is loaded based on Zustand state | Dev B |
| `Model*.tsx` | GLB loader, geometric fallback, material color swap via traverse | Dev B |
| `ConfiguratorPanel.tsx` | Right sidebar frame — connects all picker components | Dev C |
| `StepNavigator.tsx` | Tab bar for configurator steps | Dev C |
| `ColorPicker.tsx` | Renders color swatches, calls `setColor()` | Dev C |
| `WheelPicker.tsx` | Renders wheel options, calls `setWheels()` | Dev C |
| `InteriorPicker.tsx` | Renders interior options, calls `setInterior()` | Dev C |
| `PackagePicker.tsx` | Multi-select packages, calls `togglePackage()` | Dev C |
| `PerformanceSection.tsx` | Hero stat display + animated stat bars | Dev C |
| `StatBar.tsx` | Single animated bar — pure props (value, label, delay) | Dev C |
| `ARSimulation.tsx` | AR preview simulation — CSS + RAF only | Dev A |
| `SummaryScreen.tsx` | Order summary, price breakdown, reset flow | Dev A |
| `useConfiguratorStore.ts` | Global state — phases, selections, prices | Dev C |
| `cars.ts` | Static car data, type contracts, price helpers | Dev C |
| `tokens.css` | CSS custom properties — colors, typography, spacing | Design |

---

## Separation of Concerns

```
Phase Management        AppShell.tsx (layout/AppShell)
     │
     ├── Intro          intro/IntroScreen + intro/PorscheLogo
     ├── Selection      selection/SelectionScreen + selection/ModelCard
     ├── Configurator   configurator/* + scene/* (running concurrently)
     ├── Performance    performance/PerformanceSection + performance/StatBar
     ├── AR             ar/ARSimulation
     └── Summary        summary/SummaryScreen

3D Layer (always mounted after intro)
     SceneCanvas.tsx
     ├── SceneLighting.tsx   (static)
     ├── CameraRig.tsx       (reads phase from store)
     └── ActiveCarModel.tsx  (reads selectedCarId from store)
         ├── Model911.tsx
         ├── ModelTaycan.tsx
         └── ModelCayenne.tsx

State Layer
     useConfiguratorStore.ts   ← single source of truth
     └── reads by all components, writes only through exported actions

Data Layer
     cars.ts                   ← static, typed, read-only at runtime
```

---

## Global State — Where It Lives

**Single source: `src/store/useConfiguratorStore.ts`**

| State slice | Type | Default |
|-------------|------|---------|
| `phase` | `Phase` | `'intro'` |
| `introComplete` | `boolean` | `false` |
| `selectedCarId` | `CarId \| null` | `null` |
| `configStep` | `ConfigStep` | `'color'` |
| `selectedColor` | `string` | `''` |
| `selectedWheels` | `string` | `''` |
| `selectedInterior` | `string` | `''` |
| `selectedPackages` | `string[]` | `[]` |

**Rule:** No component-local state for selections. All picks go through the store. Use React `useState` only for UI-only ephemeral state (hover, tooltip visibility).

---

## Car Model Data — Where It Lives

**Single source: `src/data/cars.ts`**

- `CarConfig` interface — type contract for all car data
- `CAR_REGISTRY: Record<CarId, CarConfig>` — 911 / Taycan / Cayenne
- `getCarConfig(id)` — safe lookup with fallback
- `computeTotalPrice(config, selections)` — returns number
- `formatPrice(n)` — returns string `"$123,456"`

**To add a new model:** append an entry to `CAR_REGISTRY` and add its `CarId` to the union type. No other files need changes.

---

## 🔒 Protected Files — Never Modify Without Team Sync

| File | Reason |
|------|--------|
| `src/store/useConfiguratorStore.ts` | Changing the state shape breaks all consumers simultaneously |
| `src/data/cars.ts` | Type contract — shape changes require all model components to update |
| `src/styles/tokens.css` | Design token changes ripple across every component |
| `src/app/layout.tsx` | Root layout — wrong changes break the entire app shell |
| `src/components/scene/SceneCanvas.tsx` | One Canvas is the law — no forks, no duplicates |
| `src/components/scene/SceneLighting.tsx` | Calibrated light rig — untested changes wreck the 3D look |

---

## Hackathon Rules

1. **One Canvas** — `SceneCanvas.tsx` is the only `<Canvas>` in the entire app. Do not create a second.
2. **Store-first** — Selection state lives in Zustand, not local `useState`.
3. **`'use client'` on all components** — App Router default is server; every component here is interactive.
4. **`dynamic(() => import(...), { ssr: false })`** — Required on `SceneCanvas` in `AppShell.tsx`. Do not remove.
5. **Token-only styling** — No raw hex values in components. Use `--p-*` CSS variables or `p-*` Tailwind classes.
6. **GLBs in `/public/models/`** — Load via `useGLTF('/models/name.glb')`. Do not import binary assets.
7. **`--legacy-peer-deps`** — Always use this flag when adding npm packages.
