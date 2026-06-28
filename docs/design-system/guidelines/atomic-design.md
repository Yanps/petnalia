# PetNalia — Atomic Design System

Production documentation for the PetNalia Design System, organized by **Brad Frost's Atomic Design** methodology.

> **Tagline:** *Veterinário a domicílio, cuidado que chega até você.*
> **Stack:** React · Next.js · Tailwind CSS v4 · shadcn/ui · Radix UI · Lucide · WCAG AA
> **Primary:** `#0D9488` (teal) · 8px spacing grid · light + dark themes

## The hierarchy (never skip levels)

```
1 · Design Tokens  →  foundations (color, type, space, radius, shadow, z, breakpoints, motion, icons)
2 · Atoms          →  Button, Input, Badge, Chip, StatusDot…  (built on shadcn/ui + Radix)
3 · Molecules      →  SearchBar, AvailabilitySlot, ReviewItem… (groups of atoms)
4 · Organisms      →  VetCard, AppointmentCard, SearchFilters, Header… (groups of molecules)
5 · Templates      →  page skeletons / responsive layout (organisms in a grid, no real data)
6 · Pages          →  Homepage, Search, Vet Profile, Booking… (templates + real content)
```

**Composition rules**
- Pages are composed of **Templates**. Templates of **Organisms**. Organisms of **Molecules**. Molecules of **Atoms**. Atoms use **shadcn/ui** wherever an equivalent exists.
- **Never create a custom component when a shadcn/ui equivalent exists** — wrap and theme it instead. Every atom below lists its shadcn/ui + Radix mapping.
- All interactive elements: visible focus ring (`--ring`), ≥44px touch target, keyboard operable, AA contrast.

In this repo: tokens live in `tokens/`, atoms in `components/{core,forms,atoms}/`, molecules in `components/molecules/`, organisms in `components/domain/` + the kit's `Header`, templates + pages in `ui_kits/marketplace/`.

---

# 1 · Design Tokens

Single source of truth = `styles.css` → `tokens/*.css`. Reference **semantic aliases**, never raw values.

| Group | File | Highlights |
|---|---|---|
| **Color** | `colors.css` | Teal primary scale, blue secondary, green accent, slate neutrals, semantic (success/warning/error/info), full **light + dark** semantic remap via `[data-theme]` |
| **Typography** | `typography.css` | Inter (body/UI) + Plus Jakarta Sans (display); scale Display XL→Caption + Overline |
| **Spacing** | `spacing.css` | 8px grid `--space-0…12` (4px half-step only for icon gaps); container/control sizes |
| **Radius** | `radius-shadow.css` | sm 8 · md 12 · lg 16 · xl 24 · full |
| **Shadow** | `radius-shadow.css` | xs→xl subtle cool-tinted + `--shadow-brand`, `--shadow-focus` |
| **Z-index** | `zindex.css` | base 0 · dropdown 10 · sticky 20 · overlay 30 · drawer 40 · modal 50 · popover 60 · toast 70 · tooltip 80 |
| **Breakpoints** | `breakpoints.css` | sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440 (mobile-first) |
| **Motion** | `motion.css` | `--motion-fast 150ms` · `--motion-normal 250ms` · `--motion-slow 350ms`; ease-out & ease-in-out; subtle only; 0ms under reduced-motion |
| **Icons** | `components/core/Icon.jsx` | Lucide, embedded inline, stroke-width 2 |

**Tailwind v4 note:** expose these as `@theme` custom properties so utilities (`bg-brand`, `rounded-lg`, `z-modal`, `gap-4`, `duration-[250ms]`) resolve to the same tokens.

---

# 2 · Atoms

The smallest building blocks. Each is themed with tokens and maps to a shadcn/ui primitive.

### Standard atoms

| Atom | shadcn/ui · Radix | Variants | States | Notes |
|---|---|---|---|---|
| **Button** | Button | primary · accent · secondary · outline · ghost · destructive · link; sm/md/lg | hover · active(scale .99) · focus · disabled · loading | one primary per view; `accent` = confirm/availability |
| **Input** | Input | text · with icon · with error | default · hover · focus · invalid · disabled | label + hint/error wired via `aria-describedby` |
| **Label** | Label (Radix Label) | — required | — | always `htmlFor` the control id |
| **Textarea** | Textarea | — | default · invalid · disabled | vertical resize, 96px min |
| **Select Trigger** | Select (Radix Select) | placeholder · with value | default · focus · invalid · disabled | chevron affordance, matches Input height |
| **Checkbox** | Checkbox (Radix) | — | unchecked · checked · focus · disabled | 20px box, animated check |
| **Radio Group** | RadioGroup (Radix) | column · row | unchecked · checked · focus · disabled | 2–5 options; else use Select |
| **Switch** | Switch (Radix) | — | off · on · focus · disabled | instant-apply settings |
| **Badge** | Badge | neutral · brand · accent · success · warning · error · info; pill · solid | — | status & service tags, 1–2 words |
| **Avatar** | Avatar (Radix) | xs–xl | image · initials fallback · status dot | always pass `name` for alt |
| **Icon** | lucide-react | any glyph; size; strokeWidth | — | inherits `currentColor` |
| **Separator** | Separator (Radix) | horizontal · vertical | — | 1px hairline |
| **Tooltip** | Tooltip (Radix) | top | hover · focus-within | keyboard accessible |
| **Loading Skeleton** | Skeleton | block · circle | shimmer (reduced-motion → static) | mirror the shape it replaces |

### Domain atoms

| Atom | Built from | Purpose | Variants / States |
|---|---|---|---|
| **Pet Type Chip** | `Chip` | choose Cão / Gato / Outro | default · selected(aria-pressed) · disabled |
| **Filter Chip** | `Chip` | quick filter w/ optional remove × | default · selected · removable |
| **Rating Star** | `Rating` | average + count | filled / empty; `showValue` |
| **Verified CRMV Badge** | `Badge variant="brand"` + `shield-check` | trust signal | static |
| **Home Visit Badge** | `Badge variant="brand"` + `home` | service type | static |
| **Emergency Badge** | `Badge variant="error"` + `alert-triangle` | urgency | static (use sparingly) |
| **Calendar Day** | `CalendarDay` | one day cell | default · today · selected · disabled · available-dot |
| **Distance Indicator** | `DistanceIndicator` | km from user | sm · md |
| **Status Dot** | `StatusDot` | presence | online · busy · offline · emergency; `pulse` |
| **Price Tag** | `PriceTag` | pt-BR price | from · unit · strike; sm/md/lg |
| **Empty State Icon** | inside `EmptyState` | zero-data glyph | brand-tinted tile |

> The three service/trust "badges" are **canonical `Badge` usages, not new components** — honoring "never duplicate a shadcn primitive." See `components/core/Badge.prompt.md`.

---

# 3 · Molecules

Small functional groups of atoms. Each spec covers composition + the four required UX states.

### 3.1 Search Bar — `SearchBar`
- **Composition:** Address Input · Pet Type Select · Specialty Select · Search Button (atoms) in one elevated pill.
- **Responsive:** desktop = single row; < md collapses to a tappable field that opens a full-screen search **Sheet**.
- **States:** *empty* → placeholders + disabled-looking submit; *loading* → spinner in Button, inputs locked; *error* → inline message under the bar ("Não encontramos esse endereço"); *success* → navigates to results.
- **A11y:** each control labelled; submit on Enter; combobox listboxes via Radix.

### 3.2 Availability Slot — `AvailabilitySlot`
- **Composition:** single time button.
- **States:** **available** (default, selectable) · **occupied** (struck-through, `disabled`) · **selected** (teal). *Loading* → render `Skeleton` chips. *Empty* → EmptyState "Sem horários neste dia".
- **A11y:** `aria-pressed`; occupied uses `disabled`; group under a labelled heading per period (manhã/tarde/noite).

### 3.3 Review Item — `ReviewItem`
- **Composition:** Avatar · Name · Rating · review text · date.
- **States:** *loading* → avatar circle + 2 text-line Skeletons; *empty* (list level) → EmptyState "Ainda sem avaliações".
- **Responsive:** full-width stack; truncate long names, wrap text.

### 3.4 Pet Summary — `PetProfileCard` *(also serves as organism-lite)*
- **Composition:** Photo · Name · Species · Age (+ weight, sex, health badges).
- **States:** *empty* → "Adicione seu primeiro pet" CTA; *loading* → Skeleton vitals grid.

### 3.5 Appointment Summary — `AppointmentCard`
- **Composition:** Veterinarian · Pet · Date · Time · Address · Price + status Badge.
- **States:** status drives color (upcoming/confirmed/pending/completed/cancelled); *loading* → Skeleton; *error* → Alert("Não foi possível carregar").

### 3.6 Address Preview — `AddressPreview`
- **Composition:** Map preview (placeholder or `mapSrc`) · formatted address · Distance Indicator · inline "Alterar".
- **States:** *empty* → "Adicionar endereço" tile; *loading* → Skeleton thumbnail + lines; *error* → "Mapa indisponível" with retry.

### 3.7 Filter Chip Group — `FilterChipGroup`
- **Composition:** labelled wrap of `Chip` atoms (Dog · Cat · Emergency · Home Visit…).
- **States:** single or multi-select; selected chips drive the results query; clearing returns to all.
- **A11y:** `role="group"` + label; each chip toggles `aria-pressed`.

---

# 4 · Organisms

Self-contained sections composed of molecules + atoms. **17 production organisms**, grouped by domain. Each owns its empty / loading / error states internally where relevant.

### Marketplace
| Organism | Composition (molecules · atoms) | Variants / States | Responsive · shadcn |
|---|---|---|---|
| **VetCard** | Avatar · Rating · Badges · DistanceIndicator · PriceTag · Button | verified · home · online; hover-lift | 1–2 col · Card |
| **SearchFilters** | Switch · Checkbox · Select · Separator · FilterChipGroup · Button | — | sidebar → FilterDrawer · — |
| **ResultsGrid** | VetCard ×N · EmptyState · Skeleton | **loading** (skeletons) · **empty** (clear CTA) · loaded | cols prop → 1 under md · — |

### Booking
| Organism | Composition | Variants / States | Responsive · shadcn |
|---|---|---|---|
| **BookingSidebar** | Card · PriceTag · RadioGroup · Button · Separator | idle · date+time chosen (CTA enables) | sticky rail → fixed bottom bar · — |
| **AppointmentCard** | Avatar · Badge · Icon · Button | upcoming · confirmed · pending · completed · cancelled | full-width · Card |
| **AppointmentTimeline** | Icon · Badge (· Skeleton · EmptyState) | visit · online · vaccine · prescription · exam; loading · empty | stacks · — |

### Geolocation
| Organism | Composition | Variants / States | Responsive · shadcn |
|---|---|---|---|
| **CoverageMap** | Icon · Badge (+ map slot) | covered · out-of-area; `mapSrc` real / placeholder | fluid height · — |
| **AddressSelector** | Input · AddressPreview · Button · EmptyState | selected · empty (add CTA) | full-width · Radio-like list |
| **RadiusSelector** | range slider · CoverageMap | live `value`; result count | full-width · Slider |

### Veterinarian profile
| Organism | Composition | Variants / States | Responsive · shadcn |
|---|---|---|---|
| **VetHero** | Avatar · Rating · Badges · DistanceIndicator · StatusDot · Button | verified · online/busy/offline | CTA col wraps under md · — |
| **ServicesList** | Icon · PriceTag · Button · EmptyState | selectable; empty | full-width · — |
| **ReviewList** | Rating · ReviewItem (· Skeleton · EmptyState) | summary + distribution; loading · empty | full-width · — |
| **AvailabilityCalendar** | CalendarDay · AvailabilitySlot (· Skeleton · EmptyState) | day select · slot states; loading · empty | day strip scrolls-x · Calendar |

### Layout
| Organism | Composition | Variants / States | Responsive · shadcn |
|---|---|---|---|
| **Header** | logo · nav · Icon · Avatar · Button | signed-in · logged-out · compact | nav hides → menu/Drawer under md · NavigationMenu |
| **Footer** | logo · Icon · Separator · link columns | — | columns auto-fit → stack · — |
| **FilterDrawer** | scrim · Button + slot | open · closed; left/right | mobile filter host · **Sheet** (Radix Dialog) |
| **EmptyState** | Icon · Button | default · compact | centered · — |

**Cross-cutting rules**
- Empty / loading / error are owned at the organism level — a list shows Skeletons while loading, an `EmptyState` on zero results, an `Alert` on fetch failure.
- Overlay organisms (FilterDrawer) honor the **z-index ladder** (`--z-overlay` 30 / `--z-drawer` 40) and disable transforms under `prefers-reduced-motion`.
- **Never re-implement** a primitive inside an organism — compose the published atom/molecule. The service/trust badges are `Badge` usages, not new components.

---

# 5 · Templates

Page skeletons — responsive layout + organism slots, **no real data**. Built as Design Components in `templates/<slug>/` and shown in the Templates picker. Full spec: **`guidelines/templates.md`**.

| Template | Folder | Organisms composed | Layout (desktop → mobile) |
|---|---|---|---|
| **Marketing** | `templates/marketing` | Header · SearchBar · ReviewList · Footer | hero + auto-fit features → single stack |
| **Search** | `templates/search` | Header · SearchBar · SearchFilters · CoverageMap · ResultsGrid · Pagination · Footer | filters sidebar + results + map → FilterDrawer + 1-col |
| **Veterinarian Profile** | `templates/profile` | Header · VetHero · ServicesList · CoverageMap · ReviewList · BookingSidebar · Footer | content + sticky booking rail → 1-col + sticky CTA |
| **Booking** | `templates/booking` | Header · AvailabilityCalendar · BookingSidebar · Footer | step + summary rail → full-width step |
| **Dashboard** | `templates/dashboard` | sidebar · top nav · Metrics · AppointmentTimeline | persistent sidebar → drawer + stack |
| **Authentication** | `templates/auth` | Header · Input · Button | centered card at all breakpoints |
| **Admin** | `templates/admin` | sidebar · FilterChipGroup · Data Table · Detail Panel | split view → stacked |

**Grid:** 12-col, 24px gutters, max 1440px. Responsiveness uses intrinsic `flex-wrap` + `minmax(auto-fit)` reflow (no media queries needed for the DC inline-style constraint). Breakpoints sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440. **Mobile-first.** Each template documents its empty / loading / error / success states (see `guidelines/templates.md`).

> **Note for consumers via x-import:** a host that strips the reserved `name` attribute should use the alias props — `Icon glyph=…`, `Avatar full-name=…`, `VetHero vet-name=…` — which resolve to `name` internally.

---

# 6 · Pages

Templates + real content + state. Implemented click-through in `ui_kits/marketplace/`.

| Page | Template | Key organisms |
|---|---|---|
| **Homepage** | marketing + search | Header · SearchBar · VetCard grid |
| **Search Results** | Search Results | SearchFilters · VetCard list · Pagination |
| **Vet Profile** | Vet Profile | profile header · Reviews Panel · Booking rail |
| **Booking** | Booking | Booking Stepper · summary · success state |
| *(roadmap)* | Checkout · Dashboard · Messages · Pet Profile · Medical History · Settings | compose existing organisms |

Each page must define its **empty**, **loading**, **error**, and **success** states (see `readme.md` → component output format).

---

## Accessibility & responsive checklist (every level)
- ✅ AA contrast (verified in both themes) · visible focus rings · keyboard paths
- ✅ ≥44px touch targets · `prefers-reduced-motion` honored (motion → 0ms)
- ✅ Semantic roles via Radix primitives · labelled controls · `aria-*` states
- ✅ Mobile-first; test 390 / 768 / 1440 · respect z-index ladder for overlays
