# Porsche Configurator — Visual Direction System
**Role:** Luxury Automotive UI Art Direction
**Audience:** Developers building in < 5 hours
**Date:** Feb 2026

---

## SECTION 1 — VISUAL PHILOSOPHY

The configurator should feel like a physical showroom with the lights dimmed. The car is the subject. The UI is the attendant — present, precise, unobtrusive.

**The three visual laws:**

**1. The car earns the light. The UI doesn't.**
Every screen element competes with a 3D car for attention. The UI always loses that competition intentionally. Text is never white-hot. Surfaces are never bright. The car is the only thing that can demand the eye.

**2. Space communicates confidence.**
Luxury brands don't fill every pixel. Generous whitespace around controls, labels, and data signals that nothing is being rushed. If a panel feels crowded, remove something — don't shrink it.

**3. Restraint is a design decision, not a shortcut.**
No subtle glow behind a card. No gradient shimmer behind text. No animated background particles. Every effect that exists must earn its place by serving clarity. If removing it makes the screen look better — remove it.

**Implementation implication:**
When in doubt, do less. Remove the border if only 1 side has it. Remove the hover color if the cursor position already communicates interactivity. Remove the animation if the state change is already obvious.

---

## SECTION 2 — COLOR SYSTEM

### Background Architecture

| Role | Token | Value | Rationale |
|---|---|---|---|
| Page base | `--color-bg-primary` | `#0D0D0D` | Off-black. Not pure #000. Pure black reads as void, not material. |
| Elevated surface | `--color-bg-elevated` | `#161616` | Cards, inactive panels. Barely distinguishable from base — intentional. |
| Active surface | `--color-bg-overlay` | `#1E1E1E` | Open drawers, focused panels. Still dark. Just enough lift. |
| Separator | `--color-border` | `#272727` | 1px lines only. Barely visible. |
| Subtle separator | `--color-border-subtle` | `#1C1C1C` | Section dividers within panels. Almost invisible. |

**Rule:** Never use a surface color lighter than `#2A2A2A` for panels. If a panel needs to be distinguished, use *border*, not background brightness.

### Text Hierarchy

| Role | Token | Value | Usage |
|---|---|---|---|
| Primary text | `--color-text-primary` | `#EDEDE8` | Body copy, active labels, prices. Warm off-white — not clinical. |
| Secondary text | `--color-text-secondary` | `#8A8A84` | Metadata, descriptions, inactive tabs. |
| Disabled / ghost | `--color-text-disabled` | `#3E3E3A` | Step counter numbers, inactive states. |

**Rule:** Never use `#FFFFFF` for body text. Only use it for the logo wordmark and primary CTA button text on a dark fill.

### Accent — Use Sparingly

| Role | Token | Value | Max usage |
|---|---|---|---|
| Gold — selected / premium | `--color-accent-gold` | `#C4A24A` | 1 element per screen |
| Red — Porsche identity | `--color-accent-red` | `#D5001C` | Logo crest only. Never for UI chrome. |
| White — CTA fill | `--color-accent-white` | `#F0F0EC` | Primary button fill only |
| Gold tint — item bg | `--color-selected-bg` | `rgba(196,162,74,0.09)` | Selected option background |
| Gold edge — item border | `--color-selected-border` | `rgba(196,162,74,0.40)` | Selected option border |

**Accent strategy — the one-accent rule:**
At no point should two accent-colored elements be visible simultaneously. The selected color swatch, the active step tab underline, and the selected wheel card all use gold. They cannot all be on screen at the same time because they live in separate configurator steps. This is by design. Enforce it.

---

## SECTION 3 — TYPOGRAPHY SYSTEM

### Font Stack
```
Display (headlines, model names, prices): "Porsche Next", "Arial Narrow", Arial, sans-serif
Body (descriptions, labels, UI copy):     Arial, Helvetica, sans-serif
```
If Porsche Next is unavailable (hackathon context): Arial Narrow is an acceptable substitute. The condensed proportion is essential — wide type will break the luxury tone.

### Scale

| Name | Size | Weight | Tracking | Usage |
|---|---|---|---|---|
| Hero | `clamp(3.5rem, 7vw, 7rem)` | 700 | `-0.03em` | Model name on performance screen, 0–100 value |
| Title | `clamp(1.75rem, 3vw, 2.75rem)` | 700 | `-0.025em` | Panel model name, section headers |
| Heading | `1.25rem` | 500 | `-0.01em` | Card titles, active color name |
| Body | `0.9375rem` (15px) | 400 | `0em` | Descriptions, option labels |
| Label | `0.6875rem` (11px) | 500 | `+0.09em` | All-caps context labels: "EXTERIOR COLOR", "FROM" |
| Micro | `0.625rem` (10px) | 400 | `+0.06em` | Step counter numbers, tax notes, metadata |

### Letter Spacing Philosophy
- **Negative tracking only for display type.** Large condensed text at negative tracking reads instantly and feels confident.
- **Positive tracking only for all-caps labels.** Small uppercase without tracking is illegible. +0.09em minimum for any text < 12px set in caps.
- **Body text is 0em tracking.** Never positively track sentence-case text. It reads as typesetting amateur hour.

### Line Height
- Display/Hero: `0.9` — tight, monolithic
- Title: `1.1`
- Heading: `1.3`
- Body: `1.6` — generous for legibility against dark backgrounds
- Label/Micro: `1.2`

---

## SECTION 4 — SPACING & LAYOUT SYSTEM

### 8pt Grid
All spacing values are multiples of 8px. Never use arbitrary values like 10px, 14px, 22px.

```
--space-1:  4px   (half-unit — use only for tight inline gaps)
--space-2:  8px   (icon-to-label, swatch-to-swatch)
--space-3:  12px  (internal card padding top/bottom)
--space-4:  16px  (base component padding)
--space-5:  24px  (section internal spacing)
--space-6:  32px  (between card groups)
--space-7:  48px  (panel top/bottom padding)
--space-8:  64px  (major section spacing)
--space-9:  96px  (hero vertical margins)
```

### Layout Rhythm

**Panel width:** The configurator right panel is fixed at `380px`. At 1440px viewport this leaves 1060px for the 3D scene — exactly the ratio where the car feels impressive rather than squeezed. Never let the panel exceed `420px`.

**Edge clearance:** All panel content has `24px` horizontal padding. Nothing touches panel edges. The left edge of text must never be flush with a container wall.

**Vertical rhythm:** Group related controls with `--space-5` (24px) between them. Separate conceptually different groups (e.g., color section header from swatches, swatches from detail row) with `--space-6` (32px).

**Dividers:** Use `1px` borders only — never padding to create visual separation. If you're using `margin-top: 32px` as the only separator, add a border. Space alone is ambiguous on a dark theme.

### Whitespace mandate
The bottom 30% of every left-side screen viewport is where the most visual energy lives (3D car + ground shadow). Leave it clear. Do not place floating labels, price tags, or progress indicators in that zone.

---

## SECTION 5 — LANDING INTRO VISUAL TONE

### Background
Solid `#000000` — the only moment pure black is used. It distinguishes the intro as a separate emotional layer from the main experience, which uses `#0D0D0D`.

### Logo Presence
- The Porsche wordmark renders in `#EDEDE8` (off-white) at approximately `280px` wide.
- A single horizontal rule in `--color-accent-gold` (1px, `160px` wide) sits below the crest. It appears after the wordmark is fully visible. It does not animate width — it fades in at full width.
- The crest strokes draw in via `strokeDashoffset`. Stroke color is `#EDEDE8`. No glow. No drop shadow.
- Nothing else is on screen. No tagline. No loading state. No background texture.

### Timing restraint
- Total duration: 3.8s. If it feels too short, it isn't — resist extending it.
- The skip button is always present at `--color-text-disabled`. It never disappears.
- The transition from intro to selection is a straight opacity fade. Not a wipe, not a scale, not a blur. Just opacity.

### What not to do
- No particle system behind the logo.
- No color wash (red or gold) sweeping behind the logo.
- No lens flare, vignette, or blur radius on the background.
- No sound.
- No "loading..." copy.

---

## SECTION 6 — CAR SELECTION SCREEN DESIGN

### Layout
Three equal-width cards arranged horizontally, bottom-anchored. The cards sit in the bottom ~40% of the screen. The 3D scene (or a gradient-obscured black field if no car is loaded) fills the top 60%.

A full-width gradient — `linear-gradient(to top, #0D0D0D 55%, transparent)` — covers the bottom 50% of the viewport. The cards sit above this gradient within it, giving the effect that they emerge from the floor.

### Card Anatomy
```
[Thumbnail image — 16:9, top of card]
[24px padding zone]
  "Porsche"             ← --text-label, gold, all-caps
  "911 Turbo S"         ← --text-heading, bold
  "650 PS · PDK · AWD"  ← --text-label, --color-text-secondary
[spacer — fills available height]
[1px border-top --color-border]
  "From €230,700"       ← --text-body, bold, left
  "Configure →"         ← --text-label, gold, right
[24px padding zone]
```

**Card sizing:** Cards have no defined height. Let content define height consistently across all three. The thumbnail is always `aspect-ratio: 16/9`. Minimum card width: `280px`. Maximum: `360px`. At 1440px total width with 3 columns and `16px` gutters, this works cleanly.

### Hover Behavior
- Border changes from `--color-border` to `rgba(196,162,74,0.4)` — 150ms ease-out.
- Background becomes `--color-selected-bg` — same transition.
- "Configure →" arrow shifts `4px` right — 150ms ease-out.
- No card lift (translateY). No scale. No shadow. No glow.
- Cursor: `pointer`.

**Rule:** The hover state is a *whisper*, not a shout. It acknowledges the interaction without performing.

### Selection Feedback
The click immediately advances to the configurator. There is no "selected card" lingering state. The transition away is the feedback.

---

## SECTION 7 — CONFIGURATOR PANEL DESIGN

### Split Philosophy
- Left: the 3D scene. Full viewport height. No UI chrome overlaps the car body except for the very top header.
- Right: the configuration panel. `380px` fixed. Full viewport height. It slides in from the right edge on mount.
- The panel never covers the car. The car should always be fully visible or close to it.

### Panel Sections (top to bottom)
```
[24px top padding]
← Change Model   ← back nav, --text-label, --color-text-disabled
"Porsche"        ← --text-label, --color-text-secondary
"911 Turbo S"    ← --text-title, bold, tight tracking
"650 PS · PDK"   ← --text-label, --color-text-secondary
[step tab bar]   ← 4 tabs, gold underline on active
[scrollable step content — padding 24px sides]
[price + CTA strip — pinned to bottom, 24px padding]
```

### Color Selector Styling
- Swatches are `36px` circles with `1px border` at `--color-border`.
- Selected: `ring-2` in gold (`--color-accent-gold`), `ring-offset-2px` in `--color-bg-elevated`.
- Metallic swatches have a `linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 55%)` overlay. No other shimmer.
- No labels under swatches — the color name displays in a single line above as prose, updating on hover/select.
- Swatch size at hover: scale `1.08`. That's it.

### Button Design Language
```
Primary CTA (full-width, panel footer):
  - Background: #F0F0EC (off-white, not pure white)
  - Text: #000000, bold, all-caps, letter-spacing +0.12em
  - Height: 48px
  - Radius: 0px (sharp corners — aspirational, not friendly)
  - Hover: background → #DEDEDA (slightly dimmed, not darkened)

Ghost CTA (below primary):
  - Background: transparent
  - Border: 1px solid --color-border
  - Text: --color-text-primary, medium weight
  - Hover: border → --color-text-secondary

No icon buttons. No icon-only states. Every interactive element has text.
```

### Restraint Rules
- Step tab bar has no background — just a bottom border on the container.
- The active tab uses a 2px gold underline, not a pill background.
- Option rows (wheels, interior) use border changes for selected state, not background fills alone.
- Price in the footer updates without animation. It does not count up. The number just changes.
- Never show more than one CTA button at a time. The current pattern (primary + ghost) is already the maximum.

---

## SECTION 8 — PERFORMANCE SECTION VISUAL TONE

### Layout
Asymmetric. Left column (380–420px) contains the model name, hero stat, and CTAs. Right side is the 3D scene — still visible, camera now at a low dramatic angle. Bottom-right corner has 4 stat-bar rows. Nothing centered. Nothing symmetric.

### Typography Dominance
The hero stat (0–100 km/h value: "2.7s") is the only element set at `--text-hero` size. It should be the largest piece of text in the entire application. It is set in display font, bold, at `-0.03em` tracking. The label above it ("0–100 KM/H") is `--text-label` at `+0.09em` tracking and `--color-text-secondary`. The size contrast between the label and the value is the entire visual statement.

### Background Treatment
No dedicated background — the 3D scene canvas continues. The left column gradient bleeds from `#0D0D0D` fully opaque on the left to transparent at ~420px, allowing the car to remain visible. The scene camera has moved to a low, near-horizontal angle. This is the only camera move that uses a slower, more dramatic approach (1.6s lerp instead of 1.2s).

### Stat Bar Design
```
Label:    --text-label, +0.09em tracking, --color-text-secondary (left)
Value:    --text-heading, bold, tight tracking, --color-text-primary (right)
─────── 1px line ─────────────────────────────────────────────────
[gold fill animating from 0% to barPercent% — 800ms ease-out]
```
The track is `1px` high, `--color-border` color. The fill is `1px` high, gold. Not a tall progress bar. Not a gauge. A single pixel line of gold filling across the screen width. This reads as a heartbeat, not a dashboard widget.

**Stagger:** Each bar starts 80ms after the previous. Total visual span: ~300ms stagger. Never animate them simultaneously — it removes the sense of weight.

### What not to do
- No circular gauges.
- No RPM-style arcs.
- No glowing numbers.
- No text shadow behind stat values.
- No "animated number counter" effect — the value appears at its final state immediately; only the bar animates.

---

## SECTION 9 — AR SECTION VISUAL STYLE

### Purpose
This is a simulation, not a real AR implementation. It must look enough like what users know AR to look like without requiring device camera access.

### Environment
Dark radial gradient background: `radial-gradient(ellipse at 50% 75%, #1A1A14 0%, #0A0A08 45%, #000 100%)`. It reads as an unlit space — a garage, a studio exterior at night.

### Ground Grid
A perspective-foreshortened grid using CSS `transform: rotateX(60deg)` applied to a repeating CSS gradient. Line color: `rgba(196,162,74,0.05)` — barely visible. Grid cell: `48px`. This grounds the car geometrically without looking like a sci-fi holodeck.

### HUD Chrome — Corner Brackets
Four corner brackets (top-left, top-right, bottom-left, bottom-right). Each bracket is an L-shape, `32px` per side, `2px` stroke, `rgba(196,162,74,0.65)` color. The brackets do not animate. They do not pulse. They appear at opacity 1 on screen mount. They are purely compositional framing.

### Scan Line
A single horizontal line, 1px height, the full screen width. Gradient: `transparent → rgba(196,162,74,0.7) → transparent`. Translates vertically at a constant slow speed (40px/frame step, looping via `requestAnimationFrame`). This is the only continuous animation on the screen. Everything else is static.

### Status Indicator
Top-center: a 8px pulsing gold dot (opacity 1 → 0.3 → 1, 1.4s duration, `ease-in-out` infinite) alongside "AR SIMULATION ACTIVE" in `--text-label` gold. This is the only element that pulses. Nothing else oscillates.

### Motion Restraint
- The car silhouette enters with a scale `0.8 → 1.0` + opacity `0 → 1` over 800ms, delayed 400ms.
- After that: nothing moves except the scan line.
- No floating, no breathing, no parallax.

---

## SECTION 10 — MOTION TONE REFINEMENT

### Duration Hierarchy
```
Hover state changes:            120–150ms    (near-instant — the cursor already signals intent)
UI element enter / exit:        250–400ms    (deliberate but not slow)
Phase transitions (opacity):    500–600ms    (cross-fade between full screens)
Panel slide in:                 380–420ms    (from right edge)
Camera repositioning:           1100–1400ms  (the slowest permitted motion)
Intro sequence:                 3800ms total (fixed — do not adjust individual beats)
Stat bar fill:                  800ms per bar (css transition)
Car model mount (fade in):      600ms
```

**Upper limit rule:** Nothing in the UI — outside of the camera and intro — should take longer than 500ms to complete. If it does, the user is waiting. Waiting is not premium.

### Easing Philosophy
```
UI enter:    cubic-bezier(0.0, 0.0, 0.2, 1)    — decelerate. Things arrive, they don't drift.
UI exit:     cubic-bezier(0.4, 0.0, 1.0, 1)    — accelerate out. Quick departure.
Premium pop: cubic-bezier(0.16, 1, 0.3, 1)     — expo-out. Used only for intro elements.
Camera lerp: linear lerp factor 0.042/frame     — no easing function; the math is the easing.
```

**Rule:** Never use `ease-in-out` for UI elements. It implies symmetry — starts slow, ends slow — which makes the interaction feel hesitant. `ease-out` for entrances. `ease-in` for exits.

### Camera Movement Tone
- The camera never snaps. It lerps.
- Angular velocity is never felt as fast. The user should register that the camera *has moved*, not that it *is moving*.
- During the performance phase, the camera move to the low angle is the most cinematic move in the application. Let it take 1.4s.
- Auto-rotation in the configurator phase: `0.4 degrees/second`. Barely perceptible. Just enough to prevent the scene from feeling frozen.
- Orbit by user drag: smooth, no inertia, no bounce. Stops when the user stops.

### Hover Micro-interactions
- Color swatch: `scale(1.08)`, 120ms ease-out.
- Car card "Configure →": `translateX(4px)`, 150ms ease-out.
- Primary button: background color change only, 120ms. No scale.
- Ghost button: border color change only, 120ms. No background fill appears.
- Nav links: color change only. No underline slide.

**Absolute rule:** No `transform: scale()` greater than `1.08` anywhere. Scale beyond that reads as playful, not premium.

---

## SECTION 11 — LUXURY UI RESTRAINT RULES

### Never Do These

**Color violations**
- Pure `#000000` background outside the intro. Off-black only.
- Pure `#FFFFFF` text anywhere. `#F0F0EC` maximum.
- Two accent-colored elements visible simultaneously.
- Red (`#D5001C`) used for any UI element other than the crest. Red is the brand's most powerful color. It cannot be a notification dot.
- Gradient fills on buttons. Gradients communicate low-end web design.
- Glow effects (`text-shadow`, `box-shadow` with spread and blur) on any text or UI card.

**Typography violations**
- Positively tracking sentence-case body text.
- Using bold for body descriptions. Bold is for prices, model names, stat values.
- Mixing display font and body font within the same text block.
- Font sizes outside the defined scale. No `font-size: 13px` improvisation in the moment.

**Layout violations**
- Thick borders (`> 1px`) anywhere except focus rings.
- `border-radius > 4px` on any card or panel. Rounded corners communicate approachability. This is not approachable.
- Centering body copy. Left-aligned text only. Center alignment for logo and intro only.
- Full-height side panels exceeding `420px` width. The car always wins space.

**Motion violations**
- Entrance animations on text that the user has already read (revisited panels).
- Hover animations that reverse the entrance animation on mouse-out. Exit is always faster.
- Staggered animations on list items with more than 5 items. Stagger breaks beyond 5.
- Any animation with `bounce` or `spring` easing. Bouncing is for toys.
- Loading spinners. Use placeholder geometry or opacity fade. Never a spinner.

### Common Hackathon UI Mistakes That Break Premium Feel

1. **Adding a glow to the selected item.** A border is enough. Glow degrades to neon instantly.
2. **Using the accent color for hover states.** Hover is not a selected state. Reserve gold for selected only.
3. **Putting the price everywhere.** Price appears once: in the panel footer. Not in the card header, the summary header, and the performance section simultaneously.
4. **Making the intro too long.** 3.8s is already on the edge. Do not extend. The user wants the car.
5. **Over-labeling the 3D scene.** No floating labels over the car model saying "TURBO ENGINE" or "AWD". The configurator panel has the labels. The scene has the car.
6. **Hero text that competes.** If the model name and the stat value are both set at `--text-hero` size, neither is the hero. Only one element per screen earns maximum type size.
7. **Inconsistent panel opacity.** If the main panel is `bg-p-bg/97`, do not make a sub-panel `bg-p-bg/80`. Layers should look intentional or identical.
8. **Animated borders.** `border-color` transitions when clicked or hovered are fine. Animated `border-width` changes, dashed borders, or border-drawing animations are not.
9. **Progress indicators framed as a progress bar.** The step dots or tab labels are enough. A percentage fill bar in the header communicates a loading state, not a configuration state.
10. **Centering everything.** The instinct to center layout for "balance" in a dark-theme automotive UI produces editorial symmetry, not showroom confidence. Left-anchor the hierarchy.

---

*Visual Direction v1.0 — Feb 2026 — For build use only*
