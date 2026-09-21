# Awesomic - Style Reference (source extraction)
> editorial zinc grid with confetti-orange punctuation.

**Theme:** light

Source measurements are normalized; roles and recommendations are interpreted. HTML examples are reconstructions, not source components.

Awesomic operates in a restrained, neutral-first visual register: a zinc-gray scale carries nearly the entire interface, with one vivid orange badge accent and almost no other chromatic intrusion. The geometry is defined by generous corner rounding (36px cards, 14px buttons, 10000px pills) and hairline 1px borders replace drop shadows as the primary elevation tool. Typography is a single custom geometric sans (Cosmica) deployed at bold display weights (56-64px / weight 600) for editorial headlines, paired with compact 14px body text that signals efficiency.

> PurpleBox adaptation note: this reference is used for STRUCTURE only (geometry, type scale, spacing rhythm, hairline-border elevation). The orange accent is NOT adopted; PurpleBox keeps brand violet #7c3aed as its single accent. See DESIGN.md for the merged system.

## Colors

| Name | Value | Role |
|------|-------|------|
| Obsidian | `#09090b` | Primary buttons, hero headlines, dominant text |
| Graphite | `#18181b` | Body text, nav text, badge text |
| Slate | `#27272a` | Secondary headings, elevated dark card surfaces |
| Iron | `#3f3f46` | Muted text, outlined-button labels |
| Steel | `#52525b` | Icon strokes, supporting metadata |
| Fog | `#71717a` | Helper text, tertiary labels |
| Ash | `#a1a1aa` | Placeholder text, disabled labels |
| Mist | `#d4d4d8` | Subtle borders, secondary card fills |
| Cloud | `#ececee` | Primary 1px hairline border color |
| Paper | `#f4f4f5` | Canvas background, card surfaces, badge fills |
| Snow | `#ffffff` | Elevated cards, inputs, ghost buttons |
| Ember | `#ff5a00` | Accent badges only (not adopted for PurpleBox) |
| Magenta Spark | `#fe45e2` | Rare decorative accent (not adopted) |

## Typography

Single family: Cosmica (substitute: DM Sans). Weights 300-700. Sizes 10, 12, 13, 14, 15, 16, 18, 20, 32, 40, 56, 64. No tracking adjustments.

| Role | Size | Line height |
|------|------|-------------|
| caption | 12px | 1.64 |
| body | 15px | 1.45 |
| body-lg | 18px | 1.45 |
| subheading | 20px | 1.5 |
| heading-sm | 32px | 1.5 |
| heading | 40px | 1.28 |
| heading-lg | 56px | 1.28 |
| display | 64px | 1.12 |

Display headlines weight 600; section headings 600-700; body/UI 400; badges/meta 400.

## Spacing and shapes

Base unit 4px. Density: compact. Scale: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 64, 68, 80, 120.

| Element | Radius |
|---------|--------|
| cards | 36px |
| icons | 40px |
| pills | 10000px |
| badges | 12px |
| inputs | 14px |
| buttons | 14px |

Shadows: none on cards (1px solid #ececee hairline instead). `--shadow-md: rgba(0,0,0,0.04) 0 4px 12px` for rare elevation. Primary dark button: `inset 0 0.5px 0 0 rgba(255,255,255,.5), inset 0 9px 14px -5px rgba(117,123,133,.4), 0 0 0 1.5px rgb(44,46,52), 0 4px 6px 0 rgba(0,0,0,.14)`.

Layout: page max-width 1200px, section gap 80px, card padding 28px, element gap 8px.

## Components

- **Primary button (dark filled):** #09090b fill, white text, 1.5px #2c2e34 border with inset highlight, 14px radius, 12px/16px padding, 14px weight 400.
- **Ghost button (white):** #fff fill, #3f3f46 text, 1px #3f3f46 border, pill radius, 20px padding.
- **Neutral pill button:** #fafafa fill, #18181b text, 14px radius, 12px/16px padding, no border.
- **Category card:** image flush to top, 36px radius, 28px bottom padding, no shadow, 20px weight 600 title, tag pills inside at bottom.
- **Dark feature card:** #27272a or #18181b fill, white text, 28-36px radius, 24px padding, arrow-bulleted 20px weight 500 items.
- **Tag pill:** transparent, 1px #ececee border, #18181b text, 12px radius, 4px/8px padding, 12-13px.
- **Filled tag:** #3f3f46 fill, #fafafa text, 12px radius, 4px/8px padding.
- **Accent badge:** #ff5a00 fill, white text, 12px radius, 4px/8px padding.
- **Input:** #fff fill, #333 text, 14px radius, 12px/16px padding, paired with dark CTA to the right.
- **Logo strip:** grayscale #71717a at 60-70% opacity, no container.
- **Stats block:** 40-56px weight 600 number in #09090b, 14px weight 400 label in #52525b beside it.
- **Breakthrough image:** full-bleed photo, no overlay, 48-64px top corner radius, acts as a visual breath between sections.
- **Navigation:** sticky white, logo left, links center (14px), login + dark CTA right, no border.

## Do

- Use the darkest ink for primary CTAs; rely on 1px #ececee borders instead of shadows.
- Body 14-15px weight 400 in #18181b; display 56-64px weight 600 at 1.12-1.28 line-height.
- 28px card padding, 80px section rhythm, 14px buttons, 36px cards, pills only for nav CTAs.

## Don't

- No new accent colors (in the source system). No drop shadows on cards. No display weight below 600.
- No radius below 12px on any container. No second font family. No pure #000000.

## Surfaces

| Level | Name | Value |
|-------|------|-------|
| 0 | Canvas | #f4f4f5 |
| 1 | Card | #ffffff |
| 2 | Subtle card | #fafafa |
| 3 | Dark surface | #18181b |
| 4 | Deep dark | #27272a |

## Layout

Centered 1200px container, 80px section gaps. Split hero: large left-aligned 56-64px headline, compact right-aligned capture form. Horizontal scroll of image cards below. Mid-page alternates light card sections with dark feature blocks. Stats as a row of three large-number blocks. Full-bleed photo breaks the grid before social proof. Editorial-magazine meets marketplace dashboard: spacious section gaps, compact internal card density.

## CSS custom properties (source)

```css
:root {
  --color-obsidian: #09090b;
  --color-graphite: #18181b;
  --color-slate: #27272a;
  --color-iron: #3f3f46;
  --color-steel: #52525b;
  --color-fog: #71717a;
  --color-ash: #a1a1aa;
  --color-mist: #d4d4d8;
  --color-cloud: #ececee;
  --color-paper: #f4f4f5;
  --color-snow: #ffffff;
  --color-ember: #ff5a00;

  --font-cosmica: 'Cosmica', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --text-caption: 12px;  --leading-caption: 1.64;
  --text-body: 15px;     --leading-body: 1.45;
  --text-body-lg: 18px;  --leading-body-lg: 1.45;
  --text-subheading: 20px; --leading-subheading: 1.5;
  --text-heading-sm: 32px; --leading-heading-sm: 1.5;
  --text-heading: 40px;  --leading-heading: 1.28;
  --text-heading-lg: 56px; --leading-heading-lg: 1.28;
  --text-display: 64px;  --leading-display: 1.12;

  --spacing-unit: 4px;
  --page-max-width: 1200px;
  --section-gap: 80px;
  --card-padding: 28px;
  --element-gap: 8px;

  --radius-cards: 36px;
  --radius-icons: 40px;
  --radius-pills: 10000px;
  --radius-badges: 12px;
  --radius-inputs: 14px;
  --radius-buttons: 14px;

  --shadow-md: rgba(0, 0, 0, 0.04) 0px 4px 12px 0px;

  --surface-canvas: #f4f4f5;
  --surface-card: #ffffff;
  --surface-subtle-card: #fafafa;
  --surface-dark-surface: #18181b;
  --surface-deep-dark: #27272a;
}
```
