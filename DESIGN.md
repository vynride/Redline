---
version: alpha
name: Redline-design-system
summary: A dark, premium web-app design system built on a deep tinted-violet canvas with restrained lavender accents — confident, calm, and number-forward. Surfaces sit on a faint dark ladder (#0E0A1A → #171226 → #211B36) with hairline borders in #2C2542 and pill-shaped primary CTAs filled with a lavender gradient (#A78BFA → #7C5CFC). Numbers are the hero of every card; type is Inter for prose with JetBrains Mono reserved for IDs, amounts, and fixed-width strings. Motion is sparing — subtle hover lifts and tab transitions only.
description: |
  Redline is a dark-only product design system for a content-and-dashboard web app:
  marketing landing, a content grid of cards, a dashboard/account widget, a
  leaderboard, a comparison table, a category explorer, and an FAQ. The chrome is
  calm and premium — a deep violet-black canvas, soft surface ladder, hairline
  borders, generously rounded cards, and a single lavender-gradient pill that
  anchors every primary action. Stats and balances are the largest, boldest
  elements on any surface; accent color is used scarcely so the page never feels
  loud. This document is the source of truth for both humans and AI coding agents.

colors:
  bg-base: "#0E0A1A"
  bg-surface: "#171226"
  bg-surface-2: "#211B36"
  bg-surface-3: "#2A2342"
  border: "#2C2542"
  border-strong: "#3A3158"
  accent: "#A78BFA"
  accent-strong: "#7C5CFC"
  accent-soft: "rgba(167,139,250,0.15)"
  on-accent: "#0E0A1A"
  positive: "#34D399"
  positive-soft: "rgba(52,211,153,0.15)"
  negative: "#F87171"
  negative-soft: "rgba(248,113,113,0.15)"
  text-primary: "#F5F3FF"
  text-secondary: "#A9A2C4"
  text-muted: "#6F6789"
  hairline-soft: "rgba(245,243,255,0.08)"
  hairline-strong: "rgba(245,243,255,0.16)"
  cta-gradient-start: "#A78BFA"
  cta-gradient-end: "#7C5CFC"

typography:
  display:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.5px
  h1:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.2px
  h2:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  stat:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0
  stat-mono:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-strong:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  label:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.2px
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.1px

rounded:
  none: 0px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px

elevation:
  flat: "none"
  card: "0 1px 0 {colors.hairline-soft}, 0 8px 24px rgba(14,10,26,0.4)"
  hover: "0 8px 32px rgba(124,92,252,0.18)"

components:
  button-primary:
    background: "linear-gradient(135deg, {colors.cta-gradient-start}, {colors.cta-gradient-end})"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 12px 24px
    height: 44px
  button-secondary:
    background: "{colors.bg-surface-2}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 12px 24px
    height: 44px
  button-ghost:
    background: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 10px 16px
    height: 40px
  text-input:
    background: "{colors.bg-surface-2}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 10px 14px
    height: 44px
  text-input-focused:
    background: "{colors.bg-surface-2}"
    border: "1px solid {colors.accent}"
    rounded: "{rounded.md}"
  preset-chip:
    background: "{colors.bg-surface-2}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 6px 12px
  tab-pill:
    background: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.full}"
    padding: 8px 16px
  tab-pill-active:
    background: "{colors.bg-surface-2}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.full}"
    padding: 8px 16px
  status-pill:
    background: "{colors.positive-soft}"
    textColor: "{colors.positive}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  content-card:
    background: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 20px
  content-card-hover:
    background: "{colors.bg-surface}"
    border: "1px solid {colors.border-strong}"
    elevation: "{elevation.hover}"
    rounded: "{rounded.lg}"
  dashboard-widget:
    background: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 24px
  stat-block:
    background: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.stat}"
  category-card:
    background: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    padding: 20px
  leaderboard-row:
    background: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  comparison-table:
    background: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
  faq-accordion:
    background: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 16px 20px
  promo-banner:
    background: "linear-gradient(135deg, {colors.cta-gradient-start}, {colors.cta-gradient-end})"
    textColor: "{colors.on-accent}"
    typography: "{typography.h2}"
    rounded: "{rounded.xl}"
    padding: 48px
  primary-nav:
    background: "{colors.bg-base}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.none}"
    height: 64px
  footer-section:
    background: "{colors.bg-base}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 64px 48px
---

## Overview

Redline is a dark-only system designed around one idea: **the numbers are the hero.** Every card, widget, and row exists to surface a key metric — a balance, a percentage, a rank — and the chrome stays calm and recessive so those numbers carry the page. The canvas is a deep tinted violet-black (`{colors.bg-base}` — `#0E0A1A`), and surfaces sit on a faint three-step ladder (`{colors.bg-surface}` → `{colors.bg-surface-2}` → `{colors.bg-surface-3}`) carrying cards, raised states, and inputs.

The system has effectively one surface mode — dark — with hairline borders (`{colors.border}` — `#2C2542`) on every card edge and soft, lavender-tinted shadows for hover lift. Accent color is **scarce by design**: a single lavender gradient (`{colors.accent}` → `{colors.accent-strong}`) anchors every primary CTA as a pill, and semantic green/red (`{colors.positive}` / `{colors.negative}`) appear only on directional stats. Everything else is neutral violet-grey text on the dark ladder.

The design philosophy is **"dark, premium, calm — numbers first."** Section rhythm is generous (`{spacing.section}` 64px), cards are generously rounded (`{rounded.lg}`–`{rounded.xl}`), and motion is restrained to subtle hover lifts and tab transitions. The page never breaks tonal continuity — the whole site sits in one continuous dark mode from hero to footer.

**Key Characteristics:**
- Single dark surface mode with a surface ladder: `{colors.bg-base}` (#0E0A1A) → `{colors.bg-surface}` (#171226) → `{colors.bg-surface-2}` (#211B36) → `{colors.bg-surface-3}` (#2A2342)
- Lavender-gradient pill (`{colors.accent}` → `{colors.accent-strong}`) is the universal primary action; everything else is neutral on the dark ladder
- Inter for all prose; **JetBrains Mono** reserved for IDs, amounts, balances, and other fixed-width strings
- Hairline 1px borders (`{colors.border}` — #2C2542) carry every card edge; hover adds a soft lavender-tinted shadow rather than a hard border
- Generously rounded vocabulary: `{rounded.md}` (12px) for inputs, `{rounded.lg}` (16px) for cards, `{rounded.xl}` (20px) for widgets and banners, `{rounded.full}` for every button
- Stats render in `{typography.stat}` (28px / 700) or `{typography.stat-mono}` — always the largest, boldest element on a card
- Semantic green (`{colors.positive}`) and red (`{colors.negative}`) appear only on directional numbers and status pills, never on chrome

## Colors

### Brand & Accent
- **Accent** (`{colors.accent}` — `#A78BFA`): the primary lavender brand color. Used for the CTA gradient start, focused-input borders, active icons, and links.
- **Accent Strong** (`{colors.accent-strong}` — `#7C5CFC`): the gradient end for the primary pill and promo banner — a deeper, more saturated violet.
- **Accent Soft** (`{colors.accent-soft}` — `rgba(167,139,250,0.15)`): translucent accent fill for hover washes and subtle highlight backgrounds.
- **On Accent** (`{colors.on-accent}` — `#0E0A1A`): the near-black text/icon color that sits on the lavender gradient pill — the only place the deep canvas color is used as a foreground.

### Surface
- **Base** (`{colors.bg-base}` — `#0E0A1A`): deep violet-black page background. The dominant surface across every page.
- **Surface** (`{colors.bg-surface}` — `#171226`): card and panel background — one notch lighter than base.
- **Surface 2** (`{colors.bg-surface-2}` — `#211B36`): raised/hover surfaces, inputs, secondary buttons, active tab fill.
- **Surface 3** (`{colors.bg-surface-3}` — `#2A2342`): highest raised state — nested panels and the lightest in-card surface.
- **Border** (`{colors.border}` — `#2C2542`): the universal 1px hairline carrying every card edge and divider.
- **Border Strong** (`{colors.border-strong}` — `#3A3158`): the hover/active border — a single notch brighter than the resting hairline.
- **Hairline Soft / Strong** (`{colors.hairline-soft}` / `{colors.hairline-strong}`): translucent white dividers for over-image or low-emphasis separators.

### Text
- **Primary** (`{colors.text-primary}` — `#F5F3FF`): headlines and key numbers. A soft off-white tinted toward lavender for tonal coherence with the canvas.
- **Secondary** (`{colors.text-secondary}` — `#A9A2C4`): labels, captions, secondary copy, resting nav links.
- **Muted** (`{colors.text-muted}` — `#6F6789`): metadata, disabled text, lowest-emphasis utility.

### Semantic
- **Positive** (`{colors.positive}` — `#34D399`) + **Soft** (`{colors.positive-soft}` — `rgba(52,211,153,0.15)`): up / gains / success. Used on directional stats and "Live"/"Active" status pills.
- **Negative** (`{colors.negative}` — `#F87171`) + **Soft** (`{colors.negative-soft}` — `rgba(248,113,113,0.15)`): down / losses / error. Used on directional stats and warning states.

### Brand Gradient
- **CTA Gradient** — linear `{colors.cta-gradient-start}` (`#A78BFA`) → `{colors.cta-gradient-end}` (`#7C5CFC`) at ≈135°. The system's only chromatic gradient on chrome — reserved for the primary pill and the full-width promo banner.
- **Hero Glow** — a soft radial lavender bloom (`{colors.accent-soft}` fading to transparent) behind the hero headline on `{colors.bg-base}`. Atmospheric only; never a hard shape.

## Typography

### Font Family
**Inter** is the primary face for all prose, headings, and stats. **JetBrains Mono** is the secondary face, reserved strictly for fixed-width content: IDs, amounts, balances, and any string that benefits from monospace alignment. Numbers presented as the hero of a card may use either `{typography.stat}` (Inter, for percentages and counts) or `{typography.stat-mono}` (JetBrains Mono, for currency balances).

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display}` | 64px | 700 | 1.05 | -0.5px | Hero tagline headline |
| `{typography.h1}` | 36px | 700 | 1.1 | -0.2px | Page title |
| `{typography.h2}` | 28px | 600 | 1.2 | 0 | Section heading |
| `{typography.stat}` | 28px | 700 | 1.1 | 0 | Hero stat — percentages, counts |
| `{typography.stat-mono}` | 24px | 600 | 1.1 | 0 | Hero stat — currency balances (mono) |
| `{typography.body-lg}` | 18px | 400 | 1.6 | 0 | Hero subtitle, lead paragraph |
| `{typography.body}` | 16px | 400 | 1.6 | 0 | Default body / paragraph |
| `{typography.body-strong}` | 16px | 500 | 1.5 | 0 | Inline emphasis, nav link, tab label |
| `{typography.label}` | 13px | 500 | 1.4 | 0.2px | Caption, chip, status-pill label |
| `{typography.mono-sm}` | 13px | 400 | 1.4 | 0 | Inline IDs and small amounts (mono) |
| `{typography.button}` | 15px | 600 | 1.2 | 0.1px | Button label |

### Principles
Body runs on a 1.6-line-height ladder; display and headings tighten to 1.05–1.2 with slightly negative tracking for a crisp, premium feel. Stats are **never** rendered in body weight — they always step up to `{typography.stat}` / `{typography.stat-mono}` so the number reads as the card's focal point. Labels and captions carry a small positive letter-spacing (0.2px) to stay legible at 13px on the dark canvas.

### Note on Font Substitutes
Inter and JetBrains Mono are both open-source and Google-Fonts-hosted; load them directly via `next/font` or a self-hosted variant. Acceptable sans substitutes are **Geist** or **Satoshi**; an acceptable mono substitute is **Geist Mono**. Keep the two-face split intact — sans for prose, mono for fixed-width values — as it is part of the system's voice.

## Layout

### Spacing System
- **Base unit:** 4px (with 8/12/16px steps for common gaps).
- **Tokens (front matter):** `{spacing.xxs}` (4px) · `{spacing.xs}` (8px) · `{spacing.sm}` (12px) · `{spacing.md}` (16px) · `{spacing.lg}` (24px) · `{spacing.xl}` (32px) · `{spacing.xxl}` (48px) · `{spacing.section}` (64px).
- **Section rhythm:** major content blocks sit `{spacing.section}` (64px) apart. Card grids use `{spacing.lg}` (24px) gutters; in-card padding sits at `{spacing.lg}` (20–24px) for cards and widgets.

### Grid & Container
- **Max width:** ~1200px content area at desktop with 24px gutters. The hero and promo banner run full-bleed with the canvas color extending edge to edge.
- **Content grid:** 3–4 columns at desktop, 2 at tablet, 1 at mobile.
- **Comparison table:** full-width below its section heading — columns are the products being compared (your product highlighted), rows are features, cells use ✓ / ✗ / value.
- **Category explorer:** responsive grid of category cards, typically 3-up at desktop collapsing to 2-up / 1-up.
- **Leaderboard:** single-column stack of rows, full content-width.
- **Footer:** multi-column link grid at desktop collapsing to 2-up at tablet and 1-up at mobile.

### Whitespace Philosophy
Whitespace is generous and the canvas is uninterrupted. Sections sit 64px apart with no decorative dividers — the dark canvas continues edge-to-edge from hero to footer. The only chromatic interruptions are the lavender hero glow behind the headline and the single full-width gradient promo banner. Cards are never crammed: keep the grid breathing with 24px gutters.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | No border, no shadow | Canvas-on-canvas blocks, hero text, footer body |
| 1 — Hairline border | 1px solid `{colors.border}` (#2C2542) | Every resting card, widget, table, accordion |
| 2 — Hover lift | Border → `{colors.border-strong}` + `{elevation.hover}` soft lavender shadow + ~4px translate-up | Card hover state |
| 3 — Surface ladder | `{colors.bg-base}` → `{colors.bg-surface}` → `{colors.bg-surface-2}` → `{colors.bg-surface-3}` | Nested panels and inputs, elevation without heavy shadow |

Depth is built primarily from the surface-color ladder and hairline borders; shadows are soft and lavender-tinted, used mainly to signal hover lift rather than resting elevation. There are no hard, dark drop shadows in the system.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Nav, footer, full-bleed structural surfaces |
| `{rounded.sm}` | 8px | Small inline chips, nested tags |
| `{rounded.md}` | 12px | Inputs, accordion, leaderboard rows, small cards |
| `{rounded.lg}` | 16px | Content cards, category cards, comparison table |
| `{rounded.xl}` | 20px | Dashboard widget, promo banner, large panels |
| `{rounded.full}` | 9999px | Every button, tab pill, preset chip, status pill, avatar |

The radius vocabulary clusters between 12 and 20px for surfaces, with **all** interactive pills fully rounded. The system never squares a button.

## Components

> Each spec covers Default and the one meaningful interactive variant (hover / focused / active).

### Buttons

**`button-primary`** — the universal Redline CTA
- Background lavender gradient (`{colors.cta-gradient-start}` → `{colors.cta-gradient-end}`), text `{colors.on-accent}`, type `{typography.button}`, padding `12px 24px`, height 44px, rounded `{rounded.full}`.
- The single load-bearing action on every surface: hero primary CTA, "Get started", banner CTA.

**`button-secondary`** — neutral surface pill
- Background `{colors.bg-surface-2}`, 1px `{colors.border}`, text `{colors.text-primary}`, type `{typography.button}`, padding `12px 24px`, height 44px, rounded `{rounded.full}`.
- Lower-emphasis paired action next to the primary CTA.

**`button-ghost`** — transparent text button
- Background transparent, text `{colors.text-secondary}`, type `{typography.button}`, padding `10px 16px`, height 40px, rounded `{rounded.full}`.
- Lowest-emphasis: nav links rendered as buttons, "Learn more".

### Tabs, Chips & Pills

**`tab-pill`** + **`tab-pill-active`** — segmented filter control
- Default: transparent, text `{colors.text-secondary}`, type `{typography.body-strong}`, padding `8px 16px`, rounded `{rounded.full}`.
- Active: background flips to `{colors.bg-surface-2}`, text `{colors.text-primary}` — the chip lifts one surface notch. Used to filter the content grid.

**`preset-chip`** — quick-value chip
- Background `{colors.bg-surface-2}`, text `{colors.text-secondary}`, type `{typography.label}`, padding `6px 12px`, rounded `{rounded.full}`.
- Preset amount/value chips beside an input (e.g. `5 · 10 · 20 · 50`).

**`status-pill`** — state indicator
- Background `{colors.positive-soft}`, text `{colors.positive}`, type `{typography.label}`, padding `4px 10px`, rounded `{rounded.full}`.
- "Live" / "Active" indicators. Swap to `{colors.negative-soft}` / `{colors.negative}` for warning states.

### Inputs & Forms

**`text-input`** + **`text-input-focused`**
- Default: background `{colors.bg-surface-2}`, 1px `{colors.border}`, text `{colors.text-primary}`, type `{typography.body}`, padding `10px 14px`, height 44px, rounded `{rounded.md}`.
- Focused: border becomes `{colors.accent}` — a lavender brightening rather than a heavy glow ring.

### Cards & Containers

**`content-card`** + **`content-card-hover`** — the core grid card
- Container: background `{colors.bg-surface}`, 1px `{colors.border}`, padding 20px, rounded `{rounded.lg}`.
- Anatomy: thumbnail/icon, title, a detail row, a **large primary stat** in `{typography.stat}`, action buttons, a secondary metric, a category tag, and a `{component.status-pill}`.
- Hover: border → `{colors.border-strong}`, soft `{elevation.hover}` shadow, ~4px lift.

**`dashboard-widget`** — account / summary widget
- Container: background `{colors.bg-surface}`, 1px `{colors.border}`, padding 24px, rounded `{rounded.xl}`.
- Layout: primary balance in `{typography.stat-mono}`, a tier badge, points, and a progress bar. Compact, sits at the top of the app view.

**`stat-block`** — inline metric
- Transparent, label in `{typography.label}` `{colors.text-secondary}` above a value in `{typography.stat}` `{colors.text-primary}`. The reusable "number is the hero" unit.

**`category-card`** — category explorer tile
- Background `{colors.bg-surface}`, 1px `{colors.border}`, padding 20px, rounded `{rounded.lg}`.
- Icon + label, hover adds the `{elevation.hover}` glow.

**`comparison-table`** — feature matrix
- Container: background `{colors.bg-surface}`, 1px `{colors.border}`, rounded `{rounded.lg}`.
- Rows are features, columns are the products compared (your column highlighted with `{colors.accent-soft}`); cells use ✓ / ✗ / value.

**`leaderboard-row`** — ranking row
- Transparent, padding `12px 16px`, rounded `{rounded.md}`, hover fills with `{colors.bg-surface-2}`.
- Layout: rank · avatar (`{rounded.full}`) · handle · a stat at the right edge (mono if numeric).

**`faq-accordion`** — expand/collapse item
- Background `{colors.bg-surface}`, 1px `{colors.border}`, padding `16px 20px`, rounded `{rounded.md}`.
- Question in `{typography.body-strong}`, chevron at the right; expanded body in `{typography.body}` `{colors.text-secondary}`.

**`promo-banner`** — full-width gradient banner
- Background lavender gradient, text `{colors.on-accent}`, padding 48px, rounded `{rounded.xl}`.
- Carries a headline in `{typography.h2}` and a single contrasting CTA. The one place the gradient appears at full width.

### Navigation

**`primary-nav`**
- Background `{colors.bg-base}`, text `{colors.text-primary}`, height 64px, type `{typography.body-strong}`, rounded `{rounded.none}`, with a 1px `{colors.border}` bottom rule.
- Layout (desktop): "Redline" wordmark at left, centered nav links, a single `{component.button-primary}` primary action at the right.
- Mobile: hamburger menu at left, wordmark at center, primary CTA at right; nav collapses into a drawer.

### Footer

**`footer-section`**
- Background `{colors.bg-base}`, text `{colors.text-secondary}` in `{typography.body}`, padding `64px 48px`, with a 1px `{colors.border}` top rule.
- Layout: multi-column link grid with column headers in `{typography.body-strong}` `{colors.text-primary}` and link lists in `{typography.body}` `{colors.text-secondary}`, plus a wordmark and social icon row.

## Do's and Don'ts

### Do
- Render the entire site in one continuous dark mode. There is no light variant.
- Use the lavender gradient pill (`{component.button-primary}`) for the one primary action per fold. Keep it scarce.
- Make the stat the largest, boldest element on every card — always `{typography.stat}` or `{typography.stat-mono}`, never body weight.
- Build elevation from the surface ladder (`{colors.bg-base}` → `{colors.bg-surface}` → `{colors.bg-surface-2}` → `{colors.bg-surface-3}`) and hairline borders; reserve shadow for hover lift.
- Use JetBrains Mono for IDs, amounts, and balances; Inter for everything else.
- Keep accent color to one element per card — the system reads calm only when color is rare.
- Round every interactive control fully (`{rounded.full}`); round surfaces at `{rounded.lg}`–`{rounded.xl}`.

### Don't
- Don't introduce a light mode. The system is dark-only by design.
- Don't use pure black `#000` or pure white `#fff` — always the tinted tokens.
- Don't render stats in body weight or body size. They are the hero.
- Don't add bright accent to more than one element per card.
- Don't square a button. Primary CTAs and chips are always pills.
- Don't add gratuitous motion — only subtle hover lifts and tab transitions.
- Don't cram the grid — keep 24px gutters and generous in-card padding.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| desktop | ≥1024px | Content grid 3–4 cols, comparison table full-width, nav inline |
| tablet | 640–1024px | Grid 2 cols, condensed nav, category grid 2-up |
| mobile | <640px | Grid 1 col, hamburger nav, sticky bottom CTA, tabs horizontally scrollable |

### Touch Targets
All interactive elements meet WCAG AA. `{component.button-primary}` / `{component.button-secondary}` sit at 44px height; `{component.text-input}` at 44px; `{component.button-ghost}` at 40px. Pills and chips extend their tappable area via inline padding to a 40px+ target.

### Collapsing Strategy
- **Primary nav:** desktop horizontal cluster → mobile hamburger drawer. The primary CTA stays visible at every breakpoint.
- **Content grid:** 3–4-up → 2-up at tablet → 1-up at mobile.
- **Comparison table:** desktop full-width → tablet horizontal scroll → mobile vertical card stack, one product per card.
- **Tabs:** inline pill row → horizontally scrollable strip at mobile.
- **Dashboard widget:** full-width card that stays at the top of the app view across breakpoints.
- **Footer:** multi-up link columns → 2-up at tablet → 1-up at mobile.
- **Section padding:** `{spacing.section}` (64px) desktop → 48px tablet → 32px mobile.
- **Hero headline:** `{typography.display}` (64px) at desktop, scaling down to ~40px at mobile.

## Iteration Guide

1. Focus on ONE component at a time. Pull its front-matter entry and verify every property resolves.
2. Reference component names and tokens directly (`{colors.accent}`, `{component.button-primary}`, `{rounded.lg}`) — do not paraphrase.
3. Default body to `{typography.body}` (16px / 400 / 1.6); reach for `{typography.body-strong}` for emphasis; reserve `{typography.display}` strictly for the hero.
4. Keep the lavender gradient pill scarce — at most one solid primary CTA per fold.
5. Add new variants as separate component entries (`-hover`, `-focused`, `-active`) rather than burying them in prose.
6. Before adding a new token, ask whether the component can be expressed with the existing surface ladder + radius scale + Inter/Mono vocabulary. The system's strength is that it rarely needs new ones.

## Known Gaps

- **Dark mode is the only mode** — no light variant exists in the system.
- **Hover states** are documented only where they change the resting spec; richer micro-interactions are intentionally out of scope (motion is sparing).
- **Form validation states** beyond the focused-input border are not specified.
- **Authenticated chrome** (settings, billing, account management) is not covered here — this document describes the marketing + app shell.
