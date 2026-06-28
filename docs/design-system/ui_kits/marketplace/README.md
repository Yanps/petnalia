# PetNalia — Marketplace Web (UI kit)

High-fidelity, interactive recreation of the PetNalia marketplace web app. Composes the design-system primitives and domain components — it does not re-implement them.

## Screens & flow
`index.html` is a single-page click-through:

1. **Homepage** (`Homepage.jsx`) — hero with the brand promise + search bar, four value props, and a "Vets near you" grid of `VetCard`s.
2. **Search Results** (`SearchResults.jsx`) — `SearchFilters` sidebar + sortable list of `VetCard`s + `Pagination`.
3. **Vet Profile** (`VetProfile.jsx`) — identity header, `Tabs` (About / Reviews / Services), and a sticky booking rail.
4. **Booking** (`Booking.jsx`) — 3-step flow (slot → details → payment) with a live summary and a success state.

Navigate: search or click any vet card → profile → "Agendar consulta" → complete the booking.

## How it loads
React + Babel (pinned) → `_ds_bundle.js` (the compiled DS) → `data.js` (mock content) → screen JSX files (each exports to `window`) → the app script wires routing in component state.

## Notes
- Components are read from `window.VetNaliaDesignSystem_7efbb4`.
- Copy in Portuguese (pt-BR) — the product's primary market.
- Avatars use the initials fallback (no bundled photos). Drop real photos by passing `photo`/`src`.
- Responsive behaviour is desktop-first here (1200px container); production should collapse the two-column layouts to single column under 768px and move `SearchFilters` into a Sheet/Drawer.
