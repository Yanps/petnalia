# PetNalia — Design System

> **Veterinário a domicílio, cuidado que chega até você.**
> The veterinary marketplace that connects pet owners with trusted vets for **home visits** and **telemedicine**.

PetNalia is the veterinary equivalent of Doctoralia. This design system gives agents and engineers everything needed to build on-brand PetNalia interfaces: design tokens, reusable React/shadcn-compatible components, domain components, and a full marketplace UI kit.

**Sources:** Brand authored from a written brief plus the **official PetNalia logo** (`assets/brand/`, the single source of truth). No external Figma or codebase was provided — share the production library if you have one so this system can be reconciled against it.

> **Note on naming:** the compiled component namespace is `window.VetNaliaDesignSystem_7efbb4` (an internal code identifier fixed when the project was created). The brand is **PetNalia** everywhere user-facing; the namespace string is the only place the old working name survives and changing it would break every card.

---

## Brand at a glance

| | |
|---|---|
| **Product** | Marketplace connecting pet owners ↔ veterinarians (home visits + telemedicine) |
| **Users** | 1) Pet owners (tutores) · 2) Veterinarians |
| **Market / language** | Brazil · Portuguese (pt-BR) primary |
| **Must communicate** | Trust · professional healthcare · convenience · compassion for animals · technology |
| **Visual lineage** | Doctoralia's trust · Airbnb's simplicity · Stripe's polish · Linear's precision |
| **Brand attributes** | Trustworthy · Professional · Caring · Modern · Accessible |
| **Avoid** | Childish/cartoon aesthetics · excessive pet visuals · heavy shadows · clutter |
| **Tagline** | *Veterinário a domicílio, cuidado que chega até você.* |
| **Tech target** | React · Next.js · Tailwind CSS v4 · shadcn/ui · Radix UI · WCAG AA · 8px grid |

---

## CONTENT FUNDAMENTALS

How PetNalia writes.

- **Voice:** Calm, competent, warm. We sound like a trusted clinic front-desk — professional but never cold. Reassurance over hype.
- **Language:** Portuguese (pt-BR) in product. Use natural, everyday Brazilian Portuguese; avoid jargon. English is used only in this system's documentation.
- **Person:** Address the user as **você** (informal-but-respectful). Speak about the pet by name when known ("a Mel", "o Thor") to build warmth.
- **Casing:** Sentence case everywhere — buttons, headings, labels. Never ALL-CAPS except the tiny overline/eyebrow label. Title Case is not used.
- **Tone by surface:**
  - *Marketing/hero:* confident and benefit-led — "Cuidados veterinários onde seu pet estiver."
  - *Product UI:* short, instructive, specific — "Escolha o dia", "Horários disponíveis".
  - *Confirmations:* reassuring and concrete — "Consulta confirmada! Dra. Helena atenderá QUA, 18/06 às 16:30."
  - *Errors:* plain, blame-free, with a next step — "Pagamento não aprovado. Verifique os dados do cartão e tente novamente."
- **CTAs:** Verb-first and concrete: *Agendar consulta, Buscar, Continuar, Confirmar e pagar, Enviar mensagem*. Avoid vague *Saiba mais* unless genuinely informational.
- **Numbers & trust signals:** Quantify when it builds confidence (ratings "4,9", reviews "(213)", distance "2,4 km", "+800 vets parceiros"). Use the Brazilian decimal comma in product copy. Don't invent stats.
- **Emoji:** Not used. Trust is carried by clean type, Lucide icons, and verification marks — never emoji or cartoon pets.
- **Vibe in one line:** *A modern health-tech product that happens to be for pets — precise, kind, and never childish.*

---

## VISUAL FOUNDATIONS

The look and feel, and the rules behind it.

### Color
- **Primary — Teal** (`#0D9488` / 600 `#0F766E` / 700 `#115E59`). Teal is the trust + healthcare signal; it owns primary buttons, links, active states, and the logo mark.
- **Secondary — Deep blue** (`#164E63`). Used for depth, gradients (hero), and as an ink-adjacent accent.
- **Accent — Green** (`#22C55E`). Reserved for *availability & go*: "Online now" badges, next-slot highlights, the final confirm CTA. Never use accent green for primary navigation.
- **Neutral — Slate** (50→900). All text, surfaces, borders. Cool-grey, calm, clinical.
- **Semantic:** success `#16A34A`, warning `#F59E0B`, error `#DC2626`, info `#0EA5E9` — each with a tinted background + border pair.
- **Themes:** full **light** (default) and **dark** semantic remaps via `[data-theme="dark"]`. Always reference semantic aliases (`--brand`, `--text`, `--surface`, `--border`) so both themes work for free.
- **Imagery vibe:** clean and bright, cool-leaning, real photography of pets + people (never cartoon). Avatars fall back to teal initials.

### Type
- **Display & headings:** Plus Jakarta Sans (geometric, friendly-but-precise) for Display XL→H2; Inter for H3/H4.
- **Body & UI:** Inter — high x-height, excellent screen legibility, the workhorse for healthcare reading.
- **Scale:** Display XL 60 · Display L 48 · H1 38 · H2 30 · H3 24 · H4 20 · Body Lg 18 · Body 16 · Small 14 · Caption 12 · Overline 12 (uppercase, tracked). Generous line-height for readability; tight negative tracking on large display sizes only.

### Spacing & layout
- **8px grid.** Tokens `--space-1…12` (4px is the only half-step, for tight icon/label gaps). Desktop container 1440px, 12-col, 24px gaps; tablet 768; mobile 390. **Mobile-first.**

### Shape, elevation & borders
- **Radii:** sm 8 · md 12 · lg 16 · xl 24 · full. Inputs/buttons md(12), cards lg(16), hero search xl(24), pills/avatars full.
- **Cards:** white surface, 1px slate-200 hairline border, `--shadow-sm` at rest. Interactive cards lift to `--shadow-lg` + translateY(-2px) on hover.
- **Shadows:** subtle, layered, cool-tinted, low-opacity — modern SaaS. **No heavy/dark drop shadows.** A brand-tinted `--shadow-brand` is reserved for the logo mark and key CTAs.
- **Borders:** 1px hairlines (`--border`) separate; 1.5px on form controls and selected states.

### Motion
- Calm and quick. `--dur-fast 120ms` for hover/color, `--dur-base 200ms` default, `--dur-slow/slower` for panels & sheets. Easing is soft ease-out for entrances (`--ease-out`), standard for UI. **Never bouncy.** All durations collapse to 0 under `prefers-reduced-motion`.
- **Hover:** darker brand shade (`--brand-hover`) or subtle tinted background; cards lift. **Press:** slight `scale(0.99)` + 0.5px nudge. **Focus:** 3px `--ring` halo (teal), always visible for keyboard users.

### Transparency & blur
- Used sparingly and purposefully: the sticky header is `rgba(white,0.85)` + `backdrop-filter: blur(12px)`; the hero uses a teal→blue gradient with a soft radial highlight. No glassmorphism elsewhere.

---

## ICONOGRAPHY

- **System:** [Lucide](https://lucide.dev) — the shadcn/ui default. Outline, 24×24 grid, **stroke-width 2**, round caps/joins. Consistent, calm, medical-adjacent.
- **Delivery:** A curated subset is **embedded as inline SVG** in `components/core/Icon.jsx` (the `Icon` component) so the bundle has **no CDN dependency**. Add glyphs by pasting Lucide path data into its registry.
- **Brand-preferred glyphs:** `map-pin`, `paw-print`, `home`, `calendar`, `clock`, `shield-check`, `stethoscope`, `heart-handshake` — plus UI essentials (`search`, `star`, `check`, chevrons, `video`, `phone`, `bell`, `file-text`, `syringe`, `pill`, …).
- **Usage:** Icons support labels; they rarely stand alone. `shield-check` = verified/CRMV trust. `home`/`video` = the two visit modalities (used consistently as the home-visit vs. telemedicine signal). Color icons with `currentColor` or `--brand`.
- **Emoji / unicode icons:** never used.
- **Substitution flag:** Lucide is the *correct* system per the brief — no substitution was needed. Fonts (Inter, Plus Jakarta Sans) are the exact requested families, loaded from Google Fonts; swap to self-hosted `@font-face` for production.

---

## BRAND ASSETS — Logo

The uploaded PetNalia logo is the **single source of truth**. Never recreate, redraw, recolor, or reinterpret the mark — always use the supplied files in `assets/brand/`.

| File | Use |
|---|---|
| `petnalia-horizontal.png` | **Desktop navigation** and wide placements (pin + wordmark) |
| `petnalia-icon.png` | **Icon-only**, where space is constrained (favicons, compact bars, badges) |
| `petnalia-app-icon.png` | App stores / launcher (rounded-square lockup) |
| `petnalia-full.png` | Marketing lockup with tagline |
| `logo-sheet.png` | The original master sheet (reference only) |

**Construction:** a teal location pin holding a white paw print with a medical cross — *pet + place + care*. The wordmark is **Pet** in brand teal + **Nalia** in slate ink.
**Clear space:** keep ≥ the height of the pin clear on all sides. **Don't:** recolor, add effects/shadows, stretch, rotate, or place the dark wordmark on dark/busy backgrounds (use the icon-only or a white wordmark there).

---

## Index / manifest

**Root**
- `styles.css` — the single entry point consumers link. `@import`s every token + component sheet.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill front-matter for use in Claude Code.

**`tokens/`** — `colors.css` · `typography.css` · `spacing.css` · `radius-shadow.css` · `motion.css` · `base.css` (reset + type utilities) · `components.css` (component class styles).

**`components/`** (React, `window.VetNaliaDesignSystem_7efbb4.*`)
- `core/` — Button, Badge, Avatar, Rating, Card (+Header/Body/Footer), Separator, Skeleton, Icon
- `forms/` — Input, Label, Textarea, Select, Checkbox, RadioGroup, Switch
- `atoms/` — Chip, StatusDot, PriceTag, DistanceIndicator, CalendarDay *(domain atoms)*
- `feedback/` — Alert, Tooltip, EmptyState
- `navigation/` — Tabs, Breadcrumb, Pagination
- `molecules/` — SearchBar, AvailabilitySlot, ReviewItem, FilterChipGroup, AddressPreview
- `organisms/` — ResultsGrid, VetHero, ServicesList, ReviewList, AvailabilityCalendar, BookingSidebar, AppointmentTimeline, CoverageMap, AddressSelector, RadiusSelector, Header, Footer, FilterDrawer
- `domain/` *(organisms)* — **VetCard**, AppointmentCard, PetProfileCard, SearchFilters

**`ui_kits/marketplace/`** — interactive web app: Homepage → Search → Vet Profile → Booking. See its `README.md`.

**`guidelines/`** — foundation specimen cards (colors, type, spacing, radius, shadows) shown in the Design System tab, plus **`atomic-design.md`** (the full Tokens→Atoms→Molecules→Organisms→Templates→Pages spec) and **`templates.md`** (the 7 page templates).

**`templates/`** — the 7 Atomic-Design Templates as Design Components: `marketing/`, `search/`, `profile/`, `booking/`, `dashboard/`, `auth/`, `admin/`. Each is a `.dc.html` that mounts organisms via `ds-base.js`; they appear in the Templates picker.

**`assets/brand/`** — the official PetNalia logo files + a Brand specimen card.

### Build coverage & roadmap
Delivered: full token foundation (light + dark), the complete Atomic Design stack — **52 components** across atoms, molecules, and 17 organisms, plus the **7 page Templates** (`templates/`) — and the marketplace web kit (4 screens). Specified in the brief but **not yet built** — good next iterations: real `<Page>` artifacts wiring templates to live data/state, Radix-backed overlay primitives (Dialog/Popover/Command/Toast) as standalone components, and a dedicated mobile (390px) kit.
