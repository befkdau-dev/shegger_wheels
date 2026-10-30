# What was simulated, cut, and what comes next

## Simulated (must move to a backend)
| Area | Today | Needed |
|---|---|---|
| Storage | Browser localStorage, per visitor | Database + validated API; shared data across users |
| Authentication | Demo picker, no passwords, editable session | Real auth, password hashing/OAuth, secure cookies, server-side authorisation on every request |
| Booking conflicts | Client-side overlap check | Transactional, conflict-safe booking on the server |
| Payment | Mock TeleBirr button, fake reference | Real provider integration, webhooks, refunds, compliance |
| Notifications | Derived from records on render | E-mail/SMS/push, background jobs |
| Real-time | `storage` event between tabs only | Server-Sent Events or WebSockets |
| Tracking | Marker steps through predefined points | Real GPS only with consent, privacy controls and legal review |
| Photos | Pick from a built-in SVG library | Real uploads to object storage, moderation |
| Route Handlers / Server Actions | Not used; domain functions in `lib/` are the seam | Wrap `lib/*.js` functions in API routes/actions |
| SEO for user cars | Only the 7 seeded cars are server-rendered/sitemapped | Server data → per-car metadata, sitemap, dynamic OG images |

## Cut or limited
No dynamic Open Graph image; no ISR (no server data); no automated browser-test suite in the repo (domain tests only; the manual checklist in the brief was run with a throwaway Playwright script); no live deployment or Lighthouse run from this environment; no dark mode; no i18n (Amharic) or ETB/USD switching; owners cannot reorder photos; cancellation fees/deposits/insurance are not modelled.

## Prioritised next steps
1. Add a backend (Postgres + API) and move `lib/data.js` calls behind it; keep the helper names.
2. Real authentication and server-side authorisation; remove frontend-only trust.
3. Server-side booking transactions and availability.
4. Deploy, then record Lighthouse/Web Vitals in `PERF.md`.
5. Real payments, notifications and image uploads.
6. Automated tests (Playwright) in CI; Amharic localisation; accessibility audit with assistive technology.
