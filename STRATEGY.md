# Rendering strategy

Because all data lives in browser storage, the server can only prerender **page shells**. Anything that reads cars, bookings or the session is a Client Component that runs after hydration. `lib/seed.js` is used on the server only for the 7 seeded public cars.

| Route | Rendering | Why |
|---|---|---|
| `/` | Static (prerendered) + client islands (stats, featured cars) | Marketing shell is identical for everyone; car data comes from storage |
| `/cars` | Static shell + client catalogue in `<Suspense>` | Filters live in the URL (`useSearchParams`); results depend on storage |
| `/cars/[id]` | SSG via `generateStaticParams` for seeded approved cars; `dynamicParams = true` for others | Seeded cars get real `<title>`, canonical, Open Graph and JSON-LD at build time. Cars created in a browser render on demand as a client-only page |
| `/signin`, `/signup` | Static shell + client form | `next=` return path validated in the browser |
| `/dashboard`, `/bookings`, `/checkout` | Static shell, client-driven, `noindex` | Session and checkout draft are in sessionStorage |
| `/bookings/[id]`, `/bookings/[id]/track`, `/bookings/[id]/review` | Dynamic (server-rendered shell, any ID) + client | Bookings exist only in the browser, so the ID cannot be known at build time; ownership is checked client-side |
| `/owner`, `/owner/cars`, `/owner/cars/new`, `/owner/earnings`, `/owner/reviews`, `/owner/disputes` | Static shell + client | Role-gated by `RoleGate`; storage data |
| `/owner/cars/[id]/edit`, `/availability`, `/bookings` | Dynamic shell + client | Same reason as booking detail |
| `/admin`, `/admin/listings`, `/admin/users`, `/admin/bookings`, `/admin/disputes`, `/admin/reports`, `/admin/announcements` | Static shell + client | Admin role gate; charts loaded lazily |
| `/admin/users/[id]`, `/admin/disputes/[id]` | Dynamic shell + client | IDs only exist in storage |
| `/sitemap.xml`, `/robots.txt` | Static (generated at build) | Public routes + seeded car URLs; private areas disallowed |
| `not-found`, `error` | Static / client boundary | Recovery UI |

**Incremental/ISR is not used**: there is no server data source to revalidate. **Route Handlers and Server Actions are not used**; the equivalent domain functions live in `lib/*.js` and would become API routes/actions when a backend exists (see `FUTURE.md`).
