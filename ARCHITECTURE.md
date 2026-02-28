# Porsche Multi-Model Digital Configurator — Architecture Spec
**Team Size:** 3 developers | **Build Window:** 5 hours | **Target:** Hackathon-grade production demo

---

## SECTION 1 — EXPERIENCE FLOW

### Phase Sequence
```
PHASE 0: INTRO         → Cinematic logo reveal, fade to black, dissolve into Phase 1
PHASE 1: SELECTION     → 3 car cards animate in, user clicks one
PHASE 2: CONFIGURATOR  → 3D scene loads selected model, step-by-step options panel
PHASE 3: PERFORMANCE   → Static storytelling panel slides up, data per selected car
PHASE 4: AR            → Fullscreen overlay simulates AR placement view
PHASE 5: SUMMARY       → Selected config rendered as a receipt/card, CTA
```

### State Transitions
- State key: `phase: 'intro' | 'selection' | 'configurator' | 'performance' | 'ar' | 'summary'`
- Each phase is a React component conditionally rendered inside `AppShell`
- No URL routing. No React Router. No Next.js router navigation.
- Transitions use Framer Motion `AnimatePresence` — exit animations play before unmount.

### Implementation Rules
- The 3D canvas (`SceneCanvas`) is **always mounted** from Phase 1 onward. It never re-mounts.
- Intro (Phase 0) is a pure CSS/SVG overlay that unmounts after completion.
- Back navigation is allowed only from summary and performance phases.
- `selectedCarId` is set in Phase 1. All downstream phases read from it.

---

## SECTION 2 — COMPONENT HIERARCHY

```
<AppShell>                          ← Phase controller. Renders correct phase component.
  │
  ├── <IntroScreen>                 ← Phase 0. Unmounts after intro completes.
  │     ├── <PorscheLogo>           ← SVG logo with CSS/Framer draw animation.
  │     └── <IntroOverlay>          ← Full-viewport black overlay with opacity controls.
  │
  ├── <SceneCanvas>                 ← THREE.js/R3F canvas. Mounted from Phase 1. Never re-mounts.
  │     ├── <CameraRig>             ← Animated camera wrapper. Controls orbit + cinematic moves.
  │     ├── <SceneLighting>         ← Fixed HDRI + directional lights. One instance, static.
  │     └── <ActiveCarModel>        ← Conditionally renders model based on selectedCarId.
  │           └── <CarModel id="911" | "taycan" | "cayenne" />
  │
  ├── <SelectionScreen>             ← Phase 1. Overlaid over scene.
  │     └── <ModelCard × 3>         ← Car thumbnail, name, tagline. onClick → setSelectedCar.
  │
  ├── <ConfiguratorPanel>           ← Phase 2. Sidebar-style overlay over scene.
  │     ├── <StepNavigator>         ← Step indicator. "Color · Wheels · Interior · Packages"
  │     ├── <ColorPicker>           ← Step: exterior color swatches.
  │     ├── <WheelPicker>           ← Step: wheel option cards.
  │     ├── <InteriorPicker>        ← Step: interior trim options.
  │     └── <PackagePicker>         ← Step: option packages (checkboxes).
  │
  ├── <PerformanceSection>          ← Phase 3. Full-bleed panel overlay.
  │     ├── <StatBar × N>           ← Animated number/bar per stat (0–100 hp/torque scale).
  │     └── <PerformanceCTA>        ← "Experience it in AR" button → Phase 4.
  │
  ├── <ARSimulation>                ← Phase 4. Full-screen canvas overlay.
  │     └── <ARFrame>               ← Static mockup: blurred environment + floating car.
  │
  └── <SummaryScreen>               ← Phase 5. Full-screen summary card.
        ├── <ConfigCard>            ← Shows selected model, color, wheels, interior, packages.
        ├── <PriceLine>             ← Computed total from carConfig.
        └── <SummaryCTA>            ← "Restart" resets state → Phase 0.
```

### Ownership Split (3-person team)
| Developer | Owns |
|-----------|------|
| Dev A | `IntroScreen`, `SelectionScreen`, `SummaryScreen`, `AppShell` |
| Dev B | `SceneCanvas`, `CameraRig`, `SceneLighting`, `ActiveCarModel`, `ARSimulation` |
| Dev C | `ConfiguratorPanel` (all step pickers), `PerformanceSection`, `useConfiguratorStore` |

Zero shared file ownership. Each developer has a clean vertical slice.

---

## SECTION 3 — GLOBAL STATE MODEL

### Zustand Store: `useConfiguratorStore`

```typescript
interface ConfiguratorState {
  // ─── Phase Control ───────────────────────────────
  phase: Phase;
  setPhase: (phase: Phase) => void;

  // ─── Intro ───────────────────────────────────────
  introComplete: boolean;
  setIntroComplete: (v: boolean) => void;

  // ─── Car Selection ───────────────────────────────
  selectedCarId: CarId | null;
  setSelectedCar: (id: CarId) => void;

  // ─── Configuration ───────────────────────────────
  activeStep: ConfigStep;
  setActiveStep: (step: ConfigStep) => void;

  selectedColor: string;        // hex value
  selectedWheels: string;       // option key
  selectedInterior: string;     // option key
  selectedPackages: string[];   // array of package keys

  setColor: (hex: string) => void;
  setWheels: (key: string) => void;
  setInterior: (key: string) => void;
  togglePackage: (key: string) => void;

  // ─── Derived (computed, not stored) ──────────────
  // getTotalPrice(): computed from selected car config + options
  // getSelectedCar(): returns CarConfig by selectedCarId
}

type Phase = 'intro' | 'selection' | 'configurator' | 'performance' | 'ar' | 'summary';
type CarId = '911' | 'taycan' | 'cayenne';
type ConfigStep = 'color' | 'wheels' | 'interior' | 'packages';
```

### Property Intent
| Property | Purpose |
|----------|---------|
| `phase` | Controls which top-level screen is visible |
| `introComplete` | Prevents intro replay if user returns to selection |
| `selectedCarId` | Which car the configurator, performance, and summary panels read from |
| `activeStep` | Which configurator tab is currently open |
| `selectedColor` | Drives 3D model material swap |
| `selectedWheels` | Drives wheel mesh swap in 3D scene |
| `selectedInterior` | Stored for summary; no 3D effect in scope |
| `selectedPackages` | Multi-select; drives price calculation |

**Rule:** No component holds local config state. All options write to this store.

---

## SECTION 4 — CAR DATA CONTRACT

```typescript
export interface ColorOption {
  key: string;
  label: string;
  hex: string;
  metallic: boolean;
}

export interface WheelOption {
  key: string;
  label: string;
  price: number;
  imagePath: string;
}

export interface InteriorOption {
  key: string;
  label: string;
  price: number;
  imagePath: string;
}

export interface Package {
  key: string;
  label: string;
  description: string;
  price: number;
}

export interface PerformanceStat {
  label: string;     // "0–100 km/h", "Top Speed", "Power"
  value: string;     // "2.7s", "330 km/h", "650 PS"
  barPercent: number; // 0–100, normalized against fleet max for visual bar
}

export interface CarConfig {
  id: CarId;
  name: string;           // "911 Turbo S"
  fullName: string;       // "Porsche 911 Turbo S"
  tagline: string;        // Short spec string, e.g. "650 PS · PDK · AWD"
  basePrice: number;      // EUR integer
  modelPath: string;      // "/models/911.glb"
  thumbnailPath: string;  // "/images/911-thumb.webp"
  defaultColor: string;   // hex
  colors: ColorOption[];
  wheels: WheelOption[];
  interiors: InteriorOption[];
  packages: Package[];
  performance: PerformanceStat[];
  cameraPreset: CameraPreset; // per-model ideal camera position
}

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}
```

### Usage
```typescript
// src/data/cars.ts
export const CAR_REGISTRY: Record<CarId, CarConfig> = {
  '911': {...},
  'taycan': {...},
  'cayenne': {...},
};

// Access anywhere
const car = CAR_REGISTRY[selectedCarId];
```

**Adding a new car:** Create a new `CarConfig` entry in `CAR_REGISTRY`. Zero component changes required.

---

## SECTION 5 — 3D SCENE ARCHITECTURE

### Core Rule: One Canvas, One Scene
- A single `<Canvas>` (React Three Fiber) is mounted once in `AppShell`.
- It persists across all phases from selection onward.
- `<ActiveCarModel>` reads `selectedCarId` from the store and conditionally renders the correct car.
- When `selectedCarId` changes, the old model unmounts and the new one loads. Use `<Suspense>` wrapping each model.

### Camera Philosophy
```
Selection Phase:    Wide shot, slight top-down angle. Shows full car.
Configurator Phase: Medium shot, eye-level. Orbiting enabled. Auto-rotates slowly.
Performance Phase:  Low angle, dramatic. Fixed — no user orbit.
AR Phase:           Top-down / behind. Canvas hidden or replaced by AR overlay.
Summary Phase:      3/4 front angle. Static. Slow rotation.

Camera transitions: Lerp to new position over 1.2s using useFrame + vector lerp.
Never teleport camera. Always interpolate.
```

### Lighting — Immutable Setup
```typescript
// SceneLighting.tsx — never modified per-car
<ambientLight intensity={0.4} />
<directionalLight position={[5, 8, 3]} intensity={1.2} castShadow />
<directionalLight position={[-4, 2, -3]} intensity={0.3} />
// Environment map: 'studio' preset from @react-three/drei
<Environment preset="studio" background={false} />
```
Cars must look correct under this single lighting setup. No per-car light overrides.

### Model Scaling Strategy
- All models authored at **1 unit = 1 meter** scale.
- Wrap each model in a `<group scale={[carConfig.scale, carConfig.scale, carConfig.scale]}>`.
- Target occupying approximately 60% of viewport at selection camera position.
- `CarConfig.scale` defaults: 911 → 1.0, Taycan → 1.0, Cayenne → 0.92.

### Scene Duplication Prevention
```
Rule 1: Never put lights inside individual CarModel components.
Rule 2: Never create a Canvas inside a car-specific component.
Rule 3: Never store Three.js objects in Zustand. Store only serializable identifiers.
Rule 4: useGLTF.preload() all three models at app mount, not on-demand.
Rule 5: One Shadow plane — lives in SceneCanvas, not in car components.
```

### Model Swap Pattern
```typescript
// ActiveCarModel.tsx
function ActiveCarModel() {
  const { selectedCarId } = useConfiguratorStore();
  if (!selectedCarId) return null;
  return (
    <Suspense fallback={<LoadingMesh />}>
      {selectedCarId === '911'     && <Model911 />}
      {selectedCarId === 'taycan'  && <ModelTaycan />}
      {selectedCarId === 'cayenne' && <ModelCayenne />}
    </Suspense>
  );
}
```

---

## SECTION 6 — INTRO ANIMATION SYSTEM

### Timing Sequence (total: 3.8s)
```
t=0.0s   Black screen. Porsche wordmark opacity: 0.
t=0.3s   Wordmark fades in (opacity 0→1, duration 0.6s, ease: easeOut).
t=0.9s   Wordmark fully visible. Hold.
t=1.6s   Porsche crest SVG draws in (strokeDashoffset animation, duration 0.8s).
t=2.4s   Crest fully visible. Hold 0.4s.
t=2.8s   Both elements scale up slightly (scale 1→1.04, duration 0.3s) then scale down (1.04→0.96).
t=3.1s   Full overlay fades to transparent (opacity 1→0, duration 0.7s).
t=3.8s   IntroScreen unmounts. Phase transitions to 'selection'.
         setIntroComplete(true) fires at t=3.8s.
```

### Implementation Approach
- Use Framer Motion `motion.div` + `animate` prop with `transition.delay` offsets.
- The crest: inline SVG with `strokeDasharray` + `strokeDashoffset` CSS animation.
- The wordmark: simple SVG `<text>` or `<image>` — no web font loading risk.
- Background: solid `#000000`. No video. No external asset dependency.
- Exit: `AnimatePresence` wraps `IntroScreen`. Parent transition is opacity fade.

### Performance Safety
- No video files.
- No WebGL during intro.
- No font FOUT risk — logo is SVG-only.
- Canvas mounts *after* intro completes using `introComplete` flag.

---

## SECTION 7 — VISUAL DESIGN TOKENS

### Color Palette
```css
/* src/styles/tokens.css */
:root {
  --color-bg-primary:    #0A0A0A;   /* Near-black base */
  --color-bg-elevated:   #141414;   /* Cards, panels */
  --color-bg-overlay:    #1C1C1C;   /* Modal-level surfaces */
  --color-border:        #2A2A2A;   /* 1px separators */
  --color-border-subtle: #1E1E1E;   /* Near-invisible borders */

  --color-text-primary:  #F5F5F0;   /* Near-white body */
  --color-text-secondary:#A0A09A;   /* Labels, metadata */
  --color-text-disabled: #4A4A44;   /* Inactive states */

  --color-accent-red:    #D5001C;   /* Porsche red — use sparingly */
  --color-accent-gold:   #C9A84C;   /* Premium detail, selected states */
  --color-accent-white:  #FFFFFF;   /* CTA text, logo */

  --color-selected:      rgba(201, 168, 76, 0.15); /* Gold tint for active cards */
}
```

### Typography Scale
```css
:root {
  --font-display:  'Porsche Next', 'Arial Narrow', sans-serif;
  --font-body:     'Arial', Helvetica, sans-serif;

  --text-hero:     clamp(3rem, 6vw, 6rem);      /* 911 model name */
  --text-title:    clamp(1.5rem, 3vw, 2.5rem);  /* Section headers */
  --text-heading:  1.25rem;                      /* Panel headers */
  --text-body:     0.9375rem;                    /* 15px body */
  --text-label:    0.75rem;                      /* 12px caps label */
  --text-micro:    0.625rem;                     /* 10px metadata */

  --font-weight-light:   300;
  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-bold:    700;
}
```

### Spacing Scale (8pt grid)
```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
}
```

### UI Restraint Rules
1. Maximum 2 accent colors visible at the same time.
2. No gradients except full black-to-transparent for panel overlays.
3. No box shadows — use `border: 1px solid var(--color-border)` instead.
4. No border-radius > 4px on primary surfaces. Cards: `border-radius: 2px`.
5. Body text color is never pure `#FFFFFF` — use `--color-text-primary`.
6. Labels above inputs are always uppercase, `--text-label`, letter-spacing: 0.1em.
7. Buttons: no `border-radius`. Full-width on mobile: `100%`.

---

## SECTION 8 — MOTION DESIGN RULES

### Duration Constraints
```
Micro interactions (hover, toggle): 100–150ms
UI element enter/exit:              200–350ms
Phase transitions (cross-fade):     500–700ms
Camera moves:                       900–1400ms
Intro sequence elements:            300–800ms per beat
Full intro sequence:                3800ms total
```

### Easing Curves
```
Standard UI enter:    cubic-bezier(0.0, 0.0, 0.2, 1)   — ease out (fast in, gentle stop)
Standard UI exit:     cubic-bezier(0.4, 0.0, 1.0, 1)   — ease in  (gentle start, fast out)
Camera lerp:          Three.js linear lerp, factor 0.05 per frame (≈60fps)
Intro elements:       cubic-bezier(0.16, 1, 0.3, 1)    — expo out (snappy, premium)
Stat bar fill:        cubic-bezier(0.0, 0.0, 0.2, 1), duration 800ms, staggered 60ms
```

### Camera Motion Rules
```
1. Never use lookAt() snap. Always lerp position and target independently.
2. Cinematic camera moves: limit angular velocity to < 30°/s.
3. No camera shake. No procedural noise.
4. No zoom during interactive configurator phase — orbit only.
5. Camera resets to car's CameraPreset when selectedCarId changes.
```

### When NOT to Animate
```
- Error states and validation messages: appear instantly.
- Loading indicators: appear instantly.
- Price values updating: no number counter animation (causes re-renders).
- Step navigation next/prev: slide transition is fine, but content swap is instant.
- Any interaction where the user has already committed (button press confirmed): no delay.
- Performance stats on initial mount if user has scrolled past them already.
```

---

## SECTION 9 — IMPLEMENTATION PRIORITY ORDER

### Hour 0–0.5: Bootstrap (All Developers Together)
```
1. npx create-next-app with TypeScript + Tailwind
2. Install: three, @react-three/fiber, @react-three/drei, framer-motion, zustand
3. Create file structure (all folders/empty files)
4. Create useConfiguratorStore with full interface — no implementation yet
5. Create CAR_REGISTRY with dummy data — real assets TBD
6. Create tokens.css
7. Git commit: "scaffold"
8. Each developer checks out their branch.
```

### Hour 0.5–2.0: Parallel Build Phase 1
```
Dev A:  AppShell (phase switching) + IntroScreen (logo animation) + SelectionScreen cards
Dev B:  SceneCanvas + SceneLighting + CameraRig + model loading with placeholder geometry
Dev C:  useConfiguratorStore full implementation + ColorPicker + StepNavigator
```

### Hour 2.0–3.0: Integration Checkpoint
```
1. Merge all branches into main.
2. AppShell renders IntroScreen → SelectionScreen → ConfiguratorPanel.
3. Scene shows placeholder box that swaps on car select.
4. Store reads/writes verified across all components.
5. Fix integration issues (expected: prop type mismatches, import paths).
6. Tag commit: "integration-v1"
```

### Hour 3.0–4.0: Parallel Build Phase 2
```
Dev A:  SummaryScreen + PerformanceSection + ARSimulation overlay
Dev B:  Real GLB model loading + color/material swap on selectedColor change + camera presets
Dev C:  WheelPicker + InteriorPicker + PackagePicker + price computation
```

### Hour 4.0–4.5: Final Integration + Polish
```
1. Merge all branches.
2. End-to-end user flow test: Intro → Select → Configure → Performance → AR → Summary.
3. Check responsiveness (1280px + 1920px).
4. Apply final motion timing adjustments.
5. Remove console.logs.
6. Tag: "demo-ready"
```

### Hour 4.5–5.0: Demo Prep Buffer
```
- Verify all 3 cars selectable and configurable
- Ensure no crashes on rapid navigation
- Ensure intro plays on hard refresh
- Prepare fallback: if a GLB fails to load, placeholder geometry shows — never crash
- Test in Chrome (primary) and Edge (secondary)
```

### Merge Conflict Prevention Rules
```
1. Each developer owns exactly one directory: /intro, /scene, /configurator
2. tokens.css is read-only after bootstrap — no edits without team sync
3. useConfiguratorStore.ts is owned by Dev C. Others import, never edit.
4. CAR_REGISTRY is the shared data file — resolve conflicts by preserving all CarConfig entries
5. AppShell.tsx is owned by Dev A. Dev B and Dev C import SceneCanvas/ConfiguratorPanel as blackboxes.
6. No inline styles — all styling through tokens.css or Tailwind utility classes
```

---

*Last updated: Feb 2026 | Team build spec — not for production deployment*
