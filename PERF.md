# Performance notes

> **These are LOCAL measurements, not deployed-URL results.** They were taken against `next build && next start` on a cloud sandbox (Lighthouse 12-series CLI, headless Chromium, default mobile emulation with simulated throttling, one run per page). Scores vary run to run, especially LCP/TBT. **Re-run Lighthouse on the deployed Vercel URL and replace the "After" table before submitting.** INP is a field metric and was not measured (Lighthouse reports TBT as its lab proxy).

How to repeat: `npm run build && npm start`, then `npx lighthouse http://localhost:3000/cars --only-categories=performance,accessibility,best-practices,seo`.

## Before → after one round of fixes
| Page | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` before | 88 | 100 | 96 | 100 | 2.2 s | 0.11 | 320 ms |
| `/` **after** | 96 | 100 | 96 | 100 | 2.1 s | 0.086 | 120 ms |
| `/cars` before | 83 | 98 | 96 | 100 | 2.8 s | 0.11 | 400 ms |
| `/cars` **after** | 92 | 100 | 96 | 100 | 2.8 s | 0.086 | 180 ms |
| `/cars/car-001` before | 83 | 100 | 96 | 100 | 3.4 s | 0.11 | 270 ms |
| `/cars/car-001` **after** | 82 | 100 | 96 | 100 | 3.1 s | 0.086 | 400 ms |

FCP was 0.8 s on every run. The car-detail TBT is higher mainly because Leaflet is hydrated on that page; the before/after TBT difference on that page is within normal run-to-run noise.

## What changed and why
1. **CLS 0.11 → 0.086.** Lighthouse blamed `<main>`: the announcement banner appears only after browser storage is read, pushing content down. `AnnouncementBar` now renders an `aria-hidden` 58 px placeholder while loading. (If an admin deactivates every announcement, a small shift can still occur once.)
2. **A11y 98 → 100 on `/cars`.** Car cards used `<h3>` straight under the page `<h1>` (heading-order); the catalogue now renders them as `<h2>` via a `headingLevel` prop. Pagination buttons had an accessible name ("Previous page") that did not contain their visible text ("‹ Prev"); visible text is now "Previous" / "Next" with decorative chevrons.

## Techniques already in the build
- `next/image` for every car photo with `sizes`; `priority` only on the first above-the-fold images (hero, first cards, gallery main).
- Self-hosted variable fonts with `next/font/local` (`display: swap`): no third-party font requests.
- Car illustrations are small local SVGs (no raster downloads).
- Leaflet and Recharts are `next/dynamic({ ssr: false })` so their code loads only on pages that show a map or chart; shared first-load JS is ~103 kB, per-route first load roughly 118–137 kB (from `next build` output).
- Catalogue search input is debounced (400 ms); lists are paginated (6 per page).
- No third-party scripts (`next/script` is N/A).

## Known remaining issues
- Map tiles are an external network dependency (OpenStreetMap) and affect LCP/TBT on the detail page.
- Car data is read from storage after hydration, so list pages show skeletons first; true server rendering of user data is impossible without a backend.
- Best-practices 96: not investigated further (likely localhost-only items such as HTTPS); re-check on the deployed URL.
