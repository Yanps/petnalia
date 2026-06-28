---
name: petnalia-design
description: Use this skill to generate well-branded interfaces and assets for PetNalia, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation
- **Tokens:** `styles.css` is the single entry point — it `@import`s everything under `tokens/`. Link it and use semantic CSS variables (`--brand`, `--text`, `--surface`, `--border`, `--space-*`, `--radius-*`, `--shadow-*`). Light + dark themes via `[data-theme="dark"]`.
- **Components:** React, in `components/`. After the compiled `_ds_bundle.js` is loaded, read them off `window.VetNaliaDesignSystem_7efbb4` (e.g. `const { Button, VetCard } = window.VetNaliaDesignSystem_7efbb4`). Each component has a `.prompt.md` with a usage example.
- **Domain components:** `VetCard`, `AppointmentCard`, `PetProfileCard`, `SearchFilters` — the marketplace-specific building blocks.
- **UI kit:** `ui_kits/marketplace/` is a working reference for composing screens (Homepage, Search, Vet Profile, Booking).
- **Icons:** Lucide, embedded inline via the `Icon` component (`<Icon name="shield-check" />`).

## Brand non-negotiables
- Teal = trust/primary; green = availability/confirm only; slate = everything neutral.
- Sentence case, pt-BR product copy, address the user as **você**, no emoji, no cartoon pets.
- 8px spacing grid, subtle cool shadows (never heavy), WCAG AA, visible focus rings.
