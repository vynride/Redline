---  
version: beta
name: Redline-design-system
summary: A premium dark product aesthetic built on a near-black canvas (#0A0A0A) with frosted-glass panels, a single violet accent, and a lavender "spotlight" surface reserved for marketing moments (hero, calls-to-action). Headlines come in two voices — a thin, lowercase oversized display for hero statements and a tight, bold two-tone heading (white lead + violet emphasis) for section titles — while eyebrows and supporting captions run in uppercase JetBrains Mono. Cards are dark glassmorphic panels with hairline borders and gradient-edge glow; product UI is shown as realistic, data-dense mockups. Motion is rich but disciplined: scroll-reveals, parallax, magnetic buttons, drifting aurora, and Lenis smooth scrolling, all reduced-motion-safe.
description: |
  Redline is a dark, premium design system for a voice-first training product:
  a marketing landing page plus an authenticated app shell (dashboard, live
  drill, debrief, leaderboard). It runs on TWO surfaces that alternate down a
  page:

    1. DARK CANVAS (the default) — a near-neutral black (#0A0A0A) carrying
       frosted-glass and flat dark panels, hairline borders, and a single
       violet accent. This is where the product, content, and most sections
       live.
    2. LAVENDER SPOTLIGHT — a light periwinkle→violet gradient surface with
       white text, reserved for the hero and the final call-to-action. It is
       the only "light" surface and it always melts back into the dark canvas.

  The voice is confident and technical: oversized thin lowercase hero type,
  tight bold two-tone section headings, monospace uppercase eyebrows, and
  realistic data-dense product mockups instead of abstract illustration. This
  document is the source of truth for both humans and AI coding agents building
  new pages. Tokens are implemented in frontend/tailwind.config.ts and
  frontend/app/globals.css; class names below are literal and ready to use.

colors:
  # Dark canvas + panels (primary surface)
  ink: "#0A0A0A"            # page canvas — the default background everywhere
  ink-2: "#0E0E10"          # raised chrome (app-window header, dark pill button)
  panel: "#141416"          # flat card / tile background
  panel-2: "#1A1A1D"        # nested panel, secondary chip, hover surface
  panel-line: "#242428"     # hairline border on every dark card / divider
  # Violet accent scale (the one chromatic accent)
  violet: "#8B5CF6"         # accent DEFAULT (bg-violet / text-violet)
  violet-200: "#DDD6FE"
  violet-300: "#C4B5FD"
  violet-400: "#A78BFA"     # the section-heading emphasis color
  violet-500: "#8B5CF6"
  violet-600: "#7C3AED"
  violet-700: "#6D28D9"
  violet-deep: "#7C3AED"
  cyan: "#22D3EE"           # tertiary accent — gradient tails / glow only, scarce
  cyan-deep: "#06B6D4"
  # Lavender spotlight stops (hero + CTA surface)
  lav-1: "#8A7AE5"
  lav-2: "#9180E8"
  lav-3: "#9C8BEC"
  # Text
  text-primary: "#F5F3FF"   # headings, key numbers (off-white, lavender-tinted)
  text-secondary: "#A9A2C4" # body, captions, resting nav links
  text-muted: "#6F6789"     # metadata, lowest emphasis
  # Semantic (Tailwind default palettes — used directly)
  positive: "#34D399"       # emerald — success / "improved" / ✓
  negative: "#F87171"       # rose — error / "worsened" / ✗
  warning: "#FBBF24"        # amber — mid-severity / caution
  # Legacy app-shell tokens (retained for the authenticated product views)
  base: "#0E0A1A"
  surface: "#171226"
  surface-2: "#211B36"
  surface-3: "#2A2342"
  line: "#2C2542"
  line-strong: "#3A3158"
  accent: "#A78BFA"
  accent-strong: "#7C5CFC"

gradients:
  hero-lav: "linear-gradient(180deg, #8A7AE5 0%, #9180E8 36%, #9C8BEC 60%, #6E62B4 82%, #0A0A0A 100%)"  # full hero section
  sky-card: "linear-gradient(170deg, #b9a9f0 0%, #9d8be8 55%, #7d6ccf 100%)"  # lavender cards / CTA / featured tiles
  neon-duo: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 40%, #22D3EE 100%)"  # primary gradient button fill
  cta-gradient: "linear-gradient(135deg, #A78BFA, #7C5CFC)"                    # legacy app primary
  text-gradient: "linear-gradient(120deg, #c4b5fd 0%, #8b5cf6 35%, #22d3ee 100%)"  # .text-gradient clip
  gradient-border: "linear-gradient(135deg, rgba(124,58,237,.6), rgba(34,211,238,.45), transparent 70%)"  # .gradient-border edge

typography:
  fontFamilySans: Inter (var(--font-inter))
  fontFamilyMono: JetBrains Mono (var(--font-jetbrains))
  hero-display:
    role: Hero statement — the one oversized line per page
    fontFamily: Inter
    fontSize: clamp(2.75rem, 8vw, 6.5rem)
    fontWeight: 300        # THIN / light — the signature
    case: lowercase
    lineHeight: 0.98
    letterSpacing: -0.03em
  section-heading:
    role: Section titles (two-tone — white lead + violet-400 emphasis)
    fontFamily: Inter
    fontSize: clamp(2.25rem, 5.2vw, 4.25rem)
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: -0.03em
  feature-heading:
    role: Sub-section / feature block heading
    fontFamily: Inter
    fontSize: clamp(1.75rem, 3.4vw, 2.75rem)
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  eyebrow-mono:
    role: Eyebrow + hero subtext + supporting captions
    fontFamily: JetBrains Mono
    fontSize: 12–14px
    case: UPPERCASE
    letterSpacing: 0.06em–0.2em
    color: "{colors.text-muted} or rgba(white,.8) on lavender"
  display: { fontFamily: Inter, fontSize: 64px, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.5px }
  h1: { fontFamily: Inter, fontSize: 36px, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.2px }
  h2: { fontFamily: Inter, fontSize: 28px, fontWeight: 600, lineHeight: 1.2 }
  stat: { fontFamily: Inter, fontSize: 28px, fontWeight: 700, lineHeight: 1.1 }
  stat-mono: { fontFamily: JetBrains Mono, fontSize: 24px, fontWeight: 600, lineHeight: 1.1 }
  body-lg: { fontFamily: Inter, fontSize: 18px, fontWeight: 400, lineHeight: 1.6 }
  body: { fontFamily: Inter, fontSize: 16px, fontWeight: 400, lineHeight: 1.6 }
  body-strong: { fontFamily: Inter, fontSize: 16px, fontWeight: 500, lineHeight: 1.5 }
  label: { fontFamily: Inter, fontSize: 13px, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0.2px }
  mono-sm: { fontFamily: JetBrains Mono, fontSize: 13px, lineHeight: 1.4 }
  button: { fontFamily: Inter, fontSize: 15px, fontWeight: 600, lineHeight: 1.2, letterSpacing: 0.1px }

rounded:
  sm: 8px            # inline chips, severity badges, mock buttons
  md: 12px           # nested mock cards, small tiles, input
  lg: 16px           # scenario / content cards
  xl: 20px           # larger panels
  2xl: 28px          # primary glass cards, app window top corners
  3xl: 24px          # (Tailwind default) FAQ cards
  pill: 9999px       # every button, nav, badge, category pill, avatar
  hero-cta-card: 32px  # rounded-[32px] — the lavender CTA bookend

spacing:
  unit: 4px
  steps: [4, 8, 12, 16, 24, 32, 48]
  section: 64px           # spacing.section token
  section-padding-y: "py-24 sm:py-32 (96–128px) for landing sections"
  feature-gap: "gap-24 lg:gap-32 between stacked feature blocks"
  container: "max-w-[1180px] px-6 — the standard content width"
  app-window: "max-w-[1240px] — the wide product-mock window"

elevation:
  flat: "no border, no shadow — hero/CTA text, footer body"
  panel: "1px solid {colors.panel-line} — every resting dark card"
  glass: "frosted bg + inset top highlight + 0 24px 60px -28px rgba(0,0,0,.7) (shadow-glass)"
  glow-violet: "0 0 0 1px rgba(124,58,237,.25), 0 20px 60px -20px rgba(124,58,237,.45)"
  glow-cyan: "0 0 0 1px rgba(34,211,238,.2), 0 20px 60px -20px rgba(34,211,238,.35)"
  lift: "hover: -translate-y-1 (cards) / -translate-y-0.5 (buttons)"

effects:
  glass: ".glass — linear-gradient(rgba(33,27,54,.55)→rgba(23,18,38,.4)), blur(18px) saturate(140%), 1px rgba(245,243,255,.08) border"
  glass-strong: ".glass-strong — heavier frosted fill, blur(22px) saturate(150%), 1px rgba(245,243,255,.1) border (nav, primary cards)"
  gradient-border: ".gradient-border — masked 1px violet→cyan edge on a pseudo-element; pair with overflow-hidden + rounded-*"
  text-gradient: ".text-gradient — clips {gradients.text-gradient} onto text"
  noise-layer: ".noise-layer — tileable inline-SVG grain, use at opacity-[0.03]–[0.05]"
  bg-grid: ".bg-grid — 56px violet grid, pair with .mask-radial or .mask-fade-b"
  masks: ".mask-radial / .mask-fade-b / .mask-fade-x — feather a layer's edges"
  perspective: ".perspective-1000 — wrapper for 3D card tilt"
  scrollbar: "thin, #2C2542 thumb on transparent (global)"
  selection: "rgba(124,92,252,.35) background"

components:
  nav-floating:
    surface: glass-strong pill, rounded-full, hidden over hero, slides in after ~560px scroll
  button-primary-dark: { bg: white, text: ink, rounded: pill, height: 36–48px }   # on dark canvas
  button-primary-lav: { bg: ink-2 (#0E0E10), text: white, ring: white/10, rounded: pill }  # on lavender
  button-gradient: { bg: neon-duo, text: white, rounded: pill }                   # high-emphasis accent
  badge-tech: { surface: joined glass pills, text: white, mono/icon }
  badge-severity: { sev1: rose, sev2: amber, sev3: violet — soft-tinted rounded-md }
  card-glass: { surface: glass + gradient-border, rounded: 2xl, hover: lift + glow }
  card-panel: { bg: panel, border: panel-line, rounded: lg–2xl }
  tile-stat: { bg: ink/60 or panel, mono number in primary, label in muted }
  app-window: { chrome: ink-2 header + panel-line dividers, rounded-t-2xl/3xl, used to frame product mockups }
  bar-outcome: { emerald (good) + rose (bad) split track, rounded-full }
  faq-carousel: { active card: sky-card + answer; peek cards: panel-2; round arrows }
  cta-sky: { sky-card rounded-[32px], white text, dark pill CTA }
  footer: { bg: ink, multi-column, panel-line top rule }
---

## Overview

Redline is a dark-first system organised around **two alternating surfaces** and **one accent**. The default surface is a **near-black canvas** (`{colors.ink}` — `#0A0A0A`) that carries frosted-glass and flat dark panels; the only break from it is a **lavender spotlight** (`{gradients.hero-lav}` / `{gradients.sky-card}`) reserved for the hero and the closing call-to-action. The single chromatic accent is **violet** (`{colors.violet}` family); **cyan** appears only as a gradient tail or glow, never as a fill. Semantic green/red (emerald/rose) show direction and pass/fail.

The design philosophy is **"calm dark canvas, one bright spotlight, realistic product."** Sections breathe (96–128px vertical padding), surfaces alternate dark→lavender→dark for rhythm, and product capability is shown as **data-dense, believable UI mockups** (a dashboard window, scenario cards, leaderboard rows, a streak chart) rather than abstract art. Motion is rich but disciplined and always reduced-motion-safe.

**Key characteristics**
- One canvas color end to end: `{colors.ink}` (#0A0A0A); panels step up via `{colors.panel}` → `{colors.panel-2}` with `{colors.panel-line}` hairlines.
- A **lavender spotlight** surface is the only light moment — hero top and final CTA — and it always fades back into `{colors.ink}`.
- **Two headline voices**: an oversized **thin lowercase** hero line, and a tight **bold two-tone** section heading (white + `{colors.violet-400}`).
- Eyebrows, hero subtext, IDs, and numbers use **JetBrains Mono**, usually UPPERCASE with positive tracking.
- Cards are **glassmorphic** (`.glass` / `.glass-strong`) or flat **panels** (`{colors.panel}`), both with hairline borders; primary cards add a `.gradient-border` edge.
- Accent is **scarce**: one violet emphasis per heading, one accent action per fold.

## The Two-Surface System

Every page is a vertical stack of full-width sections that alternate between the two surfaces. Get this rhythm right and a new page will feel native.

| Surface | Background | Text | Where it's used | Primary action |
|---|---|---|---|---|
| **Dark canvas** | `{colors.ink}` (`bg-ink`) | `{colors.text-primary}` / `secondary` | Default for all content, product, and feature sections | White pill (`button-primary-dark`) or `neon-duo` gradient |
| **Lavender spotlight** | `{gradients.hero-lav}` (hero) / `{gradients.sky-card}` (CTA & featured cards) | white + white/80 | Hero opening, closing CTA, one featured tile | Dark pill (`button-primary-lav`) |

Rules:
- The **hero** opens on lavender and the gradient **melts into `{colors.ink}`** at its base (`{gradients.hero-lav}` ends on `#0A0A0A`). Content that follows continues on `bg-ink`.
- Use the lavender spotlight **at most twice** per page (open + close). Everything between is dark canvas.
- On lavender, text is white / `white/80`; borders are `white/20–30`; the CTA is the **dark pill**. Never put a dark-canvas glass card on lavender.
- A single **featured tile** inside a dark grid may use `{gradients.sky-card}` to draw the eye (e.g. a "Live" banner) — that's the one exception to "lavender only at the ends."

## Colors

### Accent — violet
A single violet ramp is the only brand chroma. `text-violet-400` (`#A78BFA`) is the **canonical emphasis** — it colors the highlighted word in every section heading and active/interactive accents. Soft fills use opacity: `bg-violet-500/15` (chip), `bg-violet-500/10` (faint), `border-violet-500/40` (active border). `text-violet-300` for small accent labels. **Cyan** (`{colors.cyan}`) is tertiary — it only appears as the tail of `{gradients.neon-duo}`/`text-gradient` and in glow shadows; never use a cyan fill on a control.

### Surface ladder (dark)
`{colors.ink}` (canvas) → `{colors.panel}` (card) → `{colors.panel-2}` (nested/hover) with `{colors.panel-line}` hairlines. `{colors.ink-2}` is the raised chrome tone for app-window headers and the dark pill button. Faint inner washes use `rgba(white,.04)` (noise) or a violet radial glow.

### Text
`{colors.text-primary}` (`#F5F3FF`) for headings and key numbers; `{colors.text-secondary}` (`#A9A2C4`) for body and resting links; `{colors.text-muted}` (`#6F6789`) for metadata and mono eyebrows. On lavender, use `text-white` and `text-white/80`.

### Semantic
Emerald `{colors.positive}` = good / improved / ✓; rose `{colors.negative}` = bad / worsened / ✗; amber `{colors.warning}` = mid / caution. These are used directly as Tailwind `emerald-400`, `rose-400/500`, `amber-300/400`, typically with a `/10–/15` soft background for badges.

### Don't
- No pure `#000` / `#fff` as fills — use `{colors.ink}` and `{colors.text-primary}`.
- No second accent hue. Violet is it; cyan is a gradient tail only.

## Typography

Two faces, two heading voices.

### Faces
**Inter** for everything structural; **JetBrains Mono** for eyebrows, hero subtext, IDs, file names, severities, and every number that benefits from tabular alignment (`.tabular`).

### The two headline voices
1. **Hero display** — the one oversized statement per page. Inter **300 (light)**, **lowercase**, `clamp(2.75rem, 8vw, 6.5rem)`, `tracking-[-0.03em]`, `leading-[0.98]`. Thin + lowercase + huge is the signature; never bold it.
   ```
   <h1 class="text-[clamp(2.75rem,8vw,6.5rem)] font-light leading-[0.98] tracking-[-0.03em] text-white">
     practice meets pressure
   </h1>
   ```
2. **Section heading (two-tone)** — bold, tight, white lead with one **violet-400** word. `clamp(2.25rem, 5.2vw, 4.25rem)`, `font-bold`, `tracking-[-0.03em]`. Implemented as `<TwoTone lead accent trail>`.
   ```
   <h2 class="text-[clamp(2.25rem,5.2vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white">
     Real Pressure, <span class="text-[#A78BFA]">Real Reps.</span>
   </h2>
   ```

### Eyebrows, subtext & captions
JetBrains Mono, **UPPERCASE**, `tracking-[0.06em]`–`[0.2em]`, in `{colors.text-muted}` (dark) or `text-white/80` (lavender). Used for the hero sub-paragraph, section eyebrows, and small metadata. Body prose stays Inter at `body`/`body-lg` (1.6 line-height).

### Numbers
Stats and IDs use JetBrains Mono with `.tabular` and step up to `stat`/`stat-mono` size — the number is the largest thing on its tile. Count-up animation is available via `useCountUp`.

## Effects & Glassmorphism

Depth is built from frosted glass + hairline borders + soft violet glow, not hard shadows.

- **`.glass`** — the default frosted card: translucent violet-black fill, `blur(18px)`, 1px `rgba(245,243,255,.08)` border, soft drop shadow. **`.glass-strong`** — heavier blur/fill for the nav and primary cards.
- **`.gradient-border`** — a masked 1px violet→cyan edge painted on a pseudo-element. Add it to a `rounded-* overflow-hidden` glass card for the premium lit edge. (Requires a non-static position; the class sets `isolation`.)
- **Glow on hover** — `hover:shadow-glow-violet` (or `-cyan`) for lift; cards also `hover:-translate-y-1`.
- **Atmosphere** — `.bg-grid` (masked with `.mask-radial`/`.mask-fade-b`), `.noise-layer` at `opacity-[0.04]`, drifting **aurora** blobs (`<Aurora/>`, blurred violet/cyan radial gradients), and twinkling **sparkles** on lavender. All decorative layers are `aria-hidden` and `pointer-events-none`.
- **Masks** — `.mask-radial`, `.mask-fade-b`, `.mask-fade-x` feather decorative layers so they never hard-edge.

Use glass for foreground cards on a busy/atmospheric area; use flat `bg-panel` cards inside dense data grids (mockups) where readability matters more than blur.

## Motion

Rich but disciplined, and **always reduced-motion-safe** (a global `prefers-reduced-motion` block kills decorative animation and smooth scroll). Powered by **Framer Motion** + **Lenis** smooth scrolling. Standard easing: `[0.22, 1, 0.36, 1]`.

Reusable primitives (in `components/landing/primitives.tsx`):
- **`<Reveal variant="up|fade|scale|blur">`** — scroll-triggered entrance, fires once at ~15% in-view. `<RevealGroup>` + `<RevealChild>` for staggered children.
- **`<Parallax>`** — translates children on scroll for layered depth.
- **`<ScrollProgress>`** — top neon-duo progress bar.
- **`MagneticButton` / `MagneticLink`** — buttons that lean toward the cursor (spring).
- **`<Aurora>`**, **Sparkles**, **`useCountUp`** — atmosphere and animated counters.
- Page-level: mount **`<SmoothScroll/>`** once (Lenis), anchor links ease via Lenis.

Defaults: entrances 0.5–0.8s; floating loops 4–6s; hovers 0.2–0.3s. Never animate more than one "hero" motion per fold.

## Layout & Spacing

- **Container:** `max-w-[1180px] px-6` for content; `max-w-[1240px]` for the wide product-mock window.
- **Section padding:** `py-24 sm:py-32` for landing sections; the `section` token (64px) for tighter app views.
- **Grids:** content/scenario grids 3–4-up desktop → 2-up tablet → 1-up mobile, `gap-4`/`gap-5`. Feature blocks alternate text/visual and stack with `gap-24 lg:gap-32`.
- **Radii:** chips/badges `rounded-md` (8–12px), cards `rounded-lg`–`rounded-2xl` (16–28px), FAQ/CTA `rounded-3xl`/`rounded-[32px]`, every button/pill `rounded-full`.

## Components

> Each entry gives the resting recipe and the one meaningful interactive state. Class strings are literal.

### Floating nav
Hidden over the lavender hero, **slides in after ~560px** of scroll as a `glass-strong` rounded-full pill (`max-w-[1040px]`). Holds the logo+wordmark, a few ghost links (`text-secondary hover:text-white`), and a white pill CTA. Mobile collapses to a glass drawer.

### Buttons
- **Primary on dark** — `bg-white text-ink rounded-full`, height 36–48px, `hover:scale-[1.03]`. The default CTA on the dark canvas.
- **Primary on lavender** — `bg-[#0E0E10] text-white rounded-full ring-1 ring-white/10`, `hover:-translate-y-0.5`. The dark pill used on the hero/CTA spotlight.
- **Gradient (high-emphasis)** — `bg-neon-duo text-white rounded-full` with a soft top sheen; use sparingly for the single loudest action.
- **Ghost / link** — `text-secondary hover:text-white`, pill padding.

### Tech / status badges
- **Joined tech pills** (hero) — two segments in one `rounded-full border-white/30 bg-white/10 backdrop-blur` shell, divided by a `w-px bg-white/30`; each segment shows a logo/icon + mono label.
- **Eyebrow chip** — `<Eyebrow>`: `rounded-full border bg-surface-2/50 px-3 py-1` with a glowing cyan dot + uppercase mono label.
- **Severity badge** — `rounded-md px-1.5 py-0.5 font-mono text-[10px]`: SEV-1 `text-rose-400 bg-rose-500/10`, SEV-2 `text-amber-300 bg-amber-400/10`, SEV-3 `text-violet-300 bg-violet-500/10`.
- **Category pill** — `rounded-full px-3 py-1`; active = `bg-violet-500/15 text-violet-200`, resting = `text-secondary`.

### Cards
- **Glass card** — `<GlassCard>` / `.glass .gradient-border rounded-2xl overflow-hidden`; `hover:-translate-y-1` + `hover:shadow-glow-violet`. For foreground content over atmosphere.
- **Panel card** — `rounded-xl border border-panel-line bg-panel p-4`; `hover:border-violet-500/40`. For dense data and mock UI.
- **Featured lavender tile** — `bg-sky-card` with a white radial sheen overlay and white text; one per grid max.
- **Stat tile** — `rounded-xl border border-panel-line bg-ink/60 p-3 text-center`: a mono number in `text-white`/`text-primary` over a `text-muted` label.

### Product-mock chrome (the "app window")
Wrap a realistic product mockup in a window: `overflow-hidden rounded-t-2xl/3xl border border-panel-line bg-ink-2` with a top bar (`bg-ink-2` + `border-panel-line` dividers) containing logo, segmented tabs (`bg-panel` pill row, active = `bg-panel-2 text-white`), compact stat chips, a white CTA, and an avatar. The hero lets this window **bleed up** from below the lavender into the dark canvas. Use it whenever a page needs to *show* the product.

### Data viz inside mocks
- **Outcome bar** — split track: emerald (good) + rose (bad) in one `rounded-full`, labelled below in emerald/rose.
- **Bar chart** — `grid grid-cols-N items-end gap-2 h-32`, bars `w-full rounded-t` with inline `height: %`; last/active bar bright `bg-[#A78BFA]`, rest `bg-violet-500/60`. (Use a CSS grid, not flex-1, so empty bars keep width.)
- **Leaderboard row** — `rounded-xl px-4 py-2.5`; the "you" row = `border border-violet-500/40 bg-violet-500/10`; rank in mono, gradient avatar, mono points.
- **Selector tiles** — `grid grid-cols-N`, each `rounded-xl border p-3 text-center`; selected = `border-violet-500 bg-violet-500/15` with a `text-[#A78BFA]` value.

### FAQ carousel
Big two-line heading on the left, supporting mono caption + round arrow buttons on the right (prev = `bg-panel`, next = `bg-white text-ink`). Three cards: the **active** card is `bg-sky-card` (white text) and shows its answer; the peek cards are `bg-panel-2/40` with the question only. Advancing rotates the window.

### Sky CTA bookend
`bg-sky-card rounded-[32px] px-6 py-16 sm:py-24 text-center` with a white radial sheen and a soft white blur bloom; a thin lowercase headline, a mono caption, and the **dark pill** CTA. Sits on `bg-ink` and closes the page, mirroring the hero.

### Footer
`bg-ink` with a `border-panel-line` top rule; multi-column link grid (column headers in uppercase mono `text-muted`, links `text-secondary hover:text-white`), the logo+tagline, social glyph buttons (`border-panel-line bg-panel rounded-full`), and a copyright row.

## Page Recipes

Building a new **marketing** page:
1. `bg-ink` wrapper; mount `<SmoothScroll/>`, `<ScrollProgress/>`, `<LandingNav/>`.
2. Open with a **lavender hero** (`bg-hero-lav`): logo+wordmark, joined tech pills, thin-lowercase headline, mono subtext, divider + dark pill CTA, optional product-window bleed.
3. Alternate **dark-canvas sections** (`py-24 sm:py-32`, `max-w-[1180px]`): each leads with a two-tone `<TwoTone>` heading + mono eyebrow, then content (glass/panel cards, feature blocks with mocks, FAQ carousel). Wrap blocks in `<Reveal>`.
4. Close with the **sky CTA bookend**, then the `bg-ink` footer.

Building a new **app / dashboard** page:
- Stay on the dark canvas (`bg-ink`), use **panel cards** and **stat tiles**, the **app-window chrome** patterns, mono numbers with `.tabular`, severity badges, outcome bars, and the leaderboard row. Keep motion to `<Reveal>` and hover lifts. Reserve the lavender spotlight and oversized hero type for marketing only.

## Do's and Don'ts

### Do
- Keep the page on `{colors.ink}`; let panels and glass do the layering.
- Use the **thin lowercase** voice for the hero and the **bold two-tone** voice for section titles — one violet word each.
- Reserve the **lavender spotlight** for the hero open and the CTA close (plus at most one featured tile).
- Show the product as **realistic, data-dense mockups** in the app-window chrome.
- Keep numbers in **JetBrains Mono** with `.tabular`; keep eyebrows uppercase mono.
- Pair `.gradient-border` with `overflow-hidden rounded-*` and one accent per card.
- Let every section enter with `<Reveal>`; keep all motion reduced-motion-safe.

### Don't
- Don't add a third surface or a second accent hue (cyan stays a gradient tail / glow).
- Don't bold the hero line or lowercase the section headings — the two voices are fixed.
- Don't put dark glass cards on the lavender surface, or stack two lavender sections back-to-back in the middle of a page.
- Don't use pure black/white fills, hard drop shadows, or `flex-1` for chart bars (they collapse — use a grid).
- Don't over-accent: one violet emphasis per heading, one loud action per fold.

## Responsive

| Breakpoint | Width | Key changes |
|---|---|---|
| desktop | ≥1024px | grids 3–4-up, feature blocks 2-col, inline nav, section padding `py-32` |
| tablet | 640–1024px | grids 2-up, feature blocks stack, condensed nav, `py-24` |
| mobile | <640px | grids 1-up, hamburger drawer, hero type scales via `clamp()`, product window scrolls/condenses |

- Hero/section type scales fluidly via `clamp()` — no manual breakpoints needed.
- The floating nav collapses to a glass drawer; the primary CTA stays visible at every width.
- Product-mock grids drop columns and the window's optional chrome (stat chips, search) hides on small screens.
- All interactive controls meet WCAG AA touch targets (≥40–44px).
