# PetNalia — Templates

Production documentation for the **Templates** layer (Atomic Design level 5). Templates are **layout structures with placeholder content only** — they define page skeletons, content regions, responsive behavior, and the composition of **existing organisms**. They contain no real data and create no new organisms.

**Where they live:** each template is a Design Component at `templates/<slug>/<Slug>.dc.html`, loading the system via `ds-base.js` and mounting organisms from `window.VetNaliaDesignSystem_7efbb4`. They appear in the **Templates** picker, not the card grid.

## Conventions used by every template
- **Composition:** real organisms (Header, Footer, ResultsGrid, VetHero, BookingSidebar, AvailabilityCalendar, CoverageMap, SearchFilters, AppointmentTimeline, FilterChipGroup…). Sections with no organism (Hero, Features, FAQ, CTA, Metrics, Data Table, Auth Card, Detail Panel, Progress Indicator) are **labeled placeholder regions** — they are not promoted to organisms.
- **Placeholder content:** organism *loading states* (ResultsGrid, ReviewList, AvailabilityCalendar, AppointmentTimeline) and neutral skeleton bars stand in for real data.
- **Responsive (mobile-first):** layouts use intrinsic `flex-wrap` + `min-width` reflow and `repeat(auto-fit, minmax())` grids, so multi-column desktop collapses to a single-column mobile stack with no media queries. Sidebars use `position: sticky`.
- **Theming:** everything is built on semantic tokens, so **light + dark** work automatically when an ancestor sets `[data-theme="dark"]`.
- **Accessibility (WCAG AA):** organisms carry their own roles/labels/focus rings; templates preserve landmark order (`header` → `main`/`aside` → `footer`), maintain logical heading hierarchy, and keep ≥44px targets.

---

## 1 · Marketing Template — `templates/marketing/`
**Purpose:** conversion-focused marketing pages — Homepage, Veterinarian Landing, Pricing, About.
**Organisms:** `Header`, `SearchBar`, `ReviewList` (testimonials), `Footer`.
**Layout regions:** Header → Hero (headline + SearchBar + trust strip) → Feature Sections (auto-fit grid) → Testimonials → FAQ → CTA band → Footer.
**Responsive:** hero single-column; features `repeat(auto-fit, minmax(220px,1fr))` (4→2→1); CTA full-bleed. Desktop multi-column → mobile single stack.
**Navigation:** top nav (Header) + in-page anchors; primary CTA repeated in hero and CTA band.
**States:** *empty* — n/a (static marketing); *loading* — testimonials show ReviewList skeletons; *error* — replace a section with an `Alert`.

## 2 · Search Template — `templates/search/`
**Purpose:** veterinarian search results.
**Organisms:** `Header`, `SearchBar`, `SearchFilters`, `CoverageMap` (map view), `ResultsGrid`, `Pagination`, `Footer` (+ `FilterDrawer` on mobile).
**Layout regions:** Header → SearchBar → [Filters sidebar | Main: Map view + results toolbar + ResultsGrid + Pagination] → Footer.
**Responsive:** **desktop** filters sidebar (sticky) beside results + map; **mobile** filters collapse into `FilterDrawer`, map becomes a toggle, results stack 1-col.
**Navigation:** sort control, pagination, filter chips; selecting a card → Profile template.
**States:** *loading* — ResultsGrid skeleton cards; *empty* — ResultsGrid `EmptyState` with "clear filters"; *error* — `Alert` above results.

## 3 · Veterinarian Profile Template — `templates/profile/`
**Purpose:** a single vet's profile + booking entry point.
**Organisms:** `Header`, `VetHero`, `ServicesList`, `CoverageMap`, `ReviewList`, `BookingSidebar`, `Footer`.
**Layout regions:** Header → VetHero → [Main: Services + Coverage Map + Reviews | sticky Booking Sidebar] → Footer.
**Responsive:** **desktop** two-column (content + sticky 320px booking rail); **mobile** single column, booking rail becomes a **sticky bottom CTA**.
**Navigation:** in-page tabs/anchors (About/Services/Reviews); booking CTA → Booking template.
**States:** *loading* — ReviewList skeletons, hero skeleton; *empty* — ServicesList/ReviewList empty states; *error* — `Alert` in the affected section.

## 4 · Booking Template — `templates/booking/`
**Purpose:** the appointment booking flow + confirmation.
**Organisms:** `Header` (compact), `AvailabilityCalendar` (step 1), `AddressSelector` (step 3), `BookingSidebar` (summary), `Footer`.
**Layout regions:** Progress Indicator (5 steps) → [Step Content | Summary Sidebar] → Navigation Actions (Back/Continue).
**Steps:** 1 Date & time · 2 Pet · 3 Address · 4 Reason · 5 Confirmation.
**Responsive:** **desktop** two-column (step + sticky summary); **mobile** single full-width step, summary collapses above actions, sticky action bar.
**Navigation:** linear stepper with Back/Continue; confirm → success state (AppointmentCard + confirmation).
**States:** *loading* — AvailabilityCalendar skeleton slots; *empty* — "Sem horários neste dia"; *error* — inline field errors + `Alert` ("Pagamento não aprovado"); *success* — confirmation screen.

## 5 · Dashboard Template — `templates/dashboard/`
**Purpose:** veterinarian dashboard, profile & availability management.
**Organisms:** persistent sidebar nav, top nav (`Avatar`), Metrics Widgets, `AppointmentTimeline` (content).
**Layout regions:** Sidebar Navigation | [Top Navigation → Metrics Widgets (auto-fit) → Content area].
**Responsive:** **desktop** persistent sidebar; **mobile** sidebar collapses into a drawer (hamburger), metrics stack, content single-column.
**Navigation:** sidebar sections + top-bar account menu; drawer toggle on mobile.
**States:** *loading* — AppointmentTimeline skeletons, metric skeletons; *empty* — "Sem consultas" empty state; *error* — `Alert` banner in content area.

## 6 · Authentication Template — `templates/auth/`
**Purpose:** Login, Register, Forgot Password.
**Organisms/atoms:** brand `Header` (logo), `Input` ×N, `Button` ×N, help links.
**Layout regions:** Brand Header → Authentication Card (fields + submit + alt action) → Help Links → trust note.
**Responsive:** centered single-column card (max 420px) at **all** breakpoints; full-width fields on mobile.
**Navigation:** switch between login/register/forgot via help links; submit → Dashboard/Home.
**States:** *loading* — submit button spinner; *empty* — pristine fields; *error* — field-level `Input` errors + form-level `Alert`; *success* — redirect / confirmation.

## 7 · Admin Template — `templates/admin/`
**Purpose:** internal ops — vet verification, appointment & user management.
**Organisms/molecules:** dark sidebar, top bar (`Avatar`), `FilterChipGroup` (filters), Data Table, Detail Panel (`Avatar` + `Button`s).
**Layout regions:** Sidebar | [Top bar → Filters → Data Table | Detail Panel] — a split view.
**Responsive:** **desktop** split view (table + detail side-by-side); **mobile** stacked — table first, detail opens as a full-width panel/sheet.
**Navigation:** sidebar sections, filter chips, row selection drives the detail panel; bulk actions in the table header.
**States:** *loading* — table row skeletons; *empty* — "Nenhum registro" empty state; *error* — `Alert` above the table; *success* — toast after an approve/reject action.

---

## Pages come next
Templates are intentionally data-free. A **Page** = a Template + real content + real state wiring (the marketplace web kit in `ui_kits/marketplace/` is the working reference for Homepage / Search / Profile / Booking). Do not add real data to templates — fork a page from a template instead.
