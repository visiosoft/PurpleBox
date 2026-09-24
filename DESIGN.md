# Design System: PurpleBox Storage

Merged system: Awesomic's editorial zinc structure (geometry, type scale, spacing rhythm, hairline-border elevation) carrying PurpleBox's brand violet as the single accent. Source reference: `docs/awesomic-style-reference.md`.

## 1. Visual Theme & Atmosphere
A restrained, editorial-marketplace register for a premium Dubai self-storage brand. A zinc-gray scale carries almost the entire interface: warm-cool `#f4f4f5` canvas, white cards with 1px hairline borders instead of drop shadows, near-black ink headlines. Color appears as functional punctuation only, and that punctuation is PurpleBox violet: CTAs, active states, price highlights, discount badges. Nothing else is chromatic. Density is compact-but-spacious: 80px gaps between sections, 28px padding inside cards, 15px body text. Headlines are bold geometric sans at 56-64px, weight 600, tight line-height. The feel is confident infrastructure, not a promo flyer.

**Dials:** `DESIGN_VARIANCE: 6` · `MOTION_INTENSITY: 4` · `VISUAL_DENSITY: 5`

## 2. Color Palette & Roles

**Brand override:** generic anti-slop guidance bans purple as an AI-default accent, and the Awesomic source bans any chromatic accent beyond its orange badge. Neither applies here. PurpleBox's name, logotype, and market identity ARE purple. Violet replaces Awesomic's `#ff5a00` role one-for-one and is the only accent in the system. Executed with intent: one hex family, flat fills, no gradient glow, no second accent.

Neutrals (zinc scale, straight from the reference):
- **Obsidian** (`#09090b`) - Hero headlines, dominant display text, the darkest permitted ink
- **Graphite** (`#18181b`) - Body copy, nav links, badge text
- **Slate** (`#27272a`) - Dark feature blocks, inverted sections
- **Iron** (`#3f3f46`) - Outlined-button labels, filled neutral tag fills
- **Steel** (`#52525b`) - Stat labels, supporting metadata, icon strokes
- **Fog** (`#71717a`) - Helper text, tertiary labels, grayscale logo strips
- **Ash** (`#a1a1aa`) - Placeholder text, disabled labels
- **Mist** (`#d4d4d8`) - Secondary borders, recessed pill fills
- **Cloud** (`#ececee`) - THE border color: 1px hairlines on cards, badges, inputs, dividers
- **Paper** (`#f4f4f5`) - Page canvas
- **Snow** (`#ffffff`) - Cards on canvas, inputs, ghost buttons

Accent (PurpleBox brand):
- **Brand Violet** (`#7c3aed`) - Primary CTA fill, active nav state, link underline, focus rings, price emphasis, "10% off" badge fill
- **Violet Deep** (`#6d28d9`) - Hover/pressed state of violet fills
- **Violet Darker** (`#5b21b6`) - Text on violet tint backgrounds
- **Violet Tint** (`#ede9fe`) - Soft badge/pill backgrounds, promo panels
- **Violet Ring** (`rgba(124, 58, 237, 0.35)`) - Focus-visible outline

Functional, non-brand (kept, exempt from the one-accent rule):
- **Success Green** (`#15803d`) - Availability/in-stock states only (discount badges move to violet)
- **WhatsApp Green** (`#25D366`) - The WhatsApp CTA only, channel-locked
- **Error Red** - Form validation only

Rules: no pure `#000000` (Obsidian is the floor). No blue anywhere. No drop shadows on content cards. No gradients on text or buttons.

## 3. Typography Rules
Single family, every role: **DM Sans** (the reference's substitute for Cosmica). Loaded once from Google Fonts at weights 400, 500, 600, 700. This replaces Space Grotesk and Manrope; the single-font rule is deliberate.

| Role | Size | Weight | Line height |
|------|------|--------|-------------|
| display (hero h1) | `clamp(40px, 5vw, 64px)` | 600 | 1.12 |
| heading-lg (section h2) | `clamp(32px, 4vw, 56px)` | 600 | 1.28 |
| heading (h3) | 32-40px | 600 | 1.28 |
| subheading (card titles) | 20px | 600 | 1.5 |
| body-lg (hero subtext) | 18px | 400 | 1.45 |
| body | 15px | 400 | 1.45 |
| caption / badges / meta | 12-13px | 400-500 | 1.64 |

- Headlines: `text-wrap: balance`, no letter-spacing adjustment (the reference uses none), never below weight 600.
- Body: max 65ch, Graphite ink, `text-wrap: pretty`.
- Prices: heading-sm size, weight 600, Obsidian; the currency label at caption size in Steel.
- Banned: Inter, any serif, mixing a second family, display weight under 600.

## 4. Component Stylings

* **Navigation (one standard on every page):** `css/site-nav.css` + `js/site-nav.js`, markup in `templates/header.html`. A floating card (not sticky; scrolls with the page), 24px radius, faint violet-tinted shadow, 14px inset from the viewport. Left: a white logo panel whose right edge is a lavender swoosh, with a lavender line along its bottom fading in toward the swoosh. Centre: the links in a white 16px-radius pill (Home, Reserve Unit, Shop Now, Packing & Moving, Blog, Contact), 14px Slate text, violet underline scaling in on hover. Active page: violet text, underline locked (set `class="active" aria-current="page"`). Right: round phone button (Violet Tint), round cart button, then the "Get a Quote" CTA. A 9-dot button opens a dropdown card holding the same links. 76px desktop, 64px mobile, 44px tap targets.
* **Primary button:** Brand Violet fill, Snow text, 14px radius, 12px/16px padding, 15px weight 500. Hover: Violet Deep, `translateY(-1px)`. Active: `scale(.97)`. Inset highlight `inset 0 0.5px 0 rgba(255,255,255,.35)` for the reference's "depth without drop shadow" feel. No outer glow.
* **Secondary / ghost button:** Snow fill, Iron text, 1px Iron border, 14px radius, same padding. On dark surfaces: Snow fill, Graphite text.
* **Neutral pill button:** `#fafafa` fill, Graphite text, 14px radius, no border. For low-priority actions ("See size guide").
* **Cards (unit pricing, feature, product):** Snow fill on Paper canvas, 1px `#ececee` border, **32px radius** (reference uses 36px; 32px keeps 8 unit cards from feeling bulbous at scroll-row scale), 28px padding, **no box-shadow**. Image-topped cards: image flush to the card edges, content padded below. Hover: border darkens to Mist, `translateY(-2px)`; still no shadow.
* **Dark feature block:** Slate `#27272a` fill, Snow text, 28px radius, 24px padding, arrow-bulleted 20px weight 500 items. Used once per page as an inverted band (e.g. "why PurpleBox" / pain points).
* **Tag pill:** transparent, 1px Cloud border, Graphite text, 12px radius, 4px/8px padding, 13px. Used for unit-size chips, feature tags.
* **Filled tag:** Iron fill, `#fafafa` text, same geometry. For category labels needing weight.
* **Accent badge ("10% off first month", "Popular"):** Brand Violet fill, Snow text, 12px radius, 4px/8px padding, 12px weight 500. This is the reference's orange-badge role, in violet.
* **Inputs:** Snow fill, Graphite text, 1px Cloud border, 14px radius, 12px/16px padding, 16px font on mobile (blocks iOS zoom). Label above, helper optional, error below in Error Red. Focus: 2px Violet Ring, border Brand Violet. Never placeholder-as-label.
* **Stats block:** 40-56px weight 600 Obsidian number, 14px Steel label beside it on the same baseline, 8px gap.
* **Logo strip:** grayscale, Fog at 65% opacity, no container, no captions under logos.
* **Breakthrough image:** full-bleed facility/unit photography, no overlay, 48px top radius, between major sections as a visual breath.
* **Loading:** skeleton shimmer matching layout shape. **Empty:** composed, tells the user how to populate. **Error:** inline for forms, toast for transient system errors only.

## 5. Layout Principles
- Page container `max-width: 1200px`, centered, 24px side gutters (16px on mobile).
- Section rhythm: `clamp(48px, 8vw, 80px)` vertical padding between major sections. Inside sections, 28px card padding, 8px element gap, 16px card gap.
- Canvas is Paper `#f4f4f5`; content sits in Snow cards or directly on canvas. Alternate light card sections with one Slate dark band mid-page.
- Hero: split composition. Left column: display headline (2 lines max) + 18px subtext (20 words max) + one violet primary CTA and one ghost secondary. Right column: hero photography or the lead-capture form. Not centered.
- Unit pricing: horizontal scroll-snap row of cards on all viewports (8 cards; a static grid would either cramp or orphan). Stats as a 3-block row. FAQ as a single-column accordion.
- CSS Grid for multi-column sections; no flex percentage math. `min-height: 100dvh` never `100vh`.
- No overlapping elements, no absolutely-positioned content stacking.

## 6. Responsive Rules
- Every multi-column layout collapses to one column below 768px, no exceptions.
- No horizontal page scroll; the unit-card row is the only intentional horizontal scroller.
- Headlines scale with `clamp()`; body never below 14px; inputs 16px on touch.
- 44px minimum tap targets on all interactive elements.
- Section padding shrinks via the clamp; card radius drops to 24px and padding to 20px below 600px.
- Nav: links in the bar from 1200px; 768-1199px hides them behind the 9-dot dropdown but keeps the Get a Quote CTA; below 768px the CTA moves into the dropdown. Card height 76px -> 64px.

## 7. Motion & Interaction
- Easing `cubic-bezier(0.16, 1, 0.3, 1)` for reveals and hovers; nothing linear.
- Scroll-reveal (existing `.reveal` + IntersectionObserver) on section headers and card rows with staggered delay. Not on every element.
- Hover: cards lift 2px and darken their border; buttons lift 1px and deepen fill. Active: `scale(.97)`.
- Focus-visible: 2px Violet Ring outline on every interactive element.
- Only `transform` and `opacity` animate. `prefers-reduced-motion` collapses everything to static final state.
- No perpetual loops (pulsing, shimmering CTAs). This is a pricing/booking surface; motion must not compete with the numbers.

## 8. Anti-Patterns (Banned)
- No emojis in copy or UI.
- No second font family; no Inter; no serif.
- No pure `#000000`; Obsidian `#09090b` is the darkest ink.
- No blue anywhere; no second chromatic accent beside Brand Violet (Success/WhatsApp/Error greens and red are functional exceptions).
- No drop shadows on cards; hairline `#ececee` borders are the elevation system. Soft shadows only on the nav card and floating controls.
- No gradient text, no gradient buttons, no violet glow blobs behind content. Sole exception: the nav's Get a Quote CTA (violet-to-indigo) and logo swoosh, which are part of the standard nav design.
- No container radius below 12px; no sharp corners on visible UI.
- No custom cursors, no scroll cues ("Scroll to explore", bouncing chevrons).
- No 3-equal-card generic feature rows.
- No overlapping text/image elements.
- No placeholder names ("John Doe", "Acme"), no fake round stats (`99.99%`), no AI copy cliches ("Elevate", "Seamless", "Unleash").
- No em-dashes anywhere in copy or labels; hyphen or restructure.
- No broken image links; `picsum.photos/seed/{keyword}` or real brand assets only.
