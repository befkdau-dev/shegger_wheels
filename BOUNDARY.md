# Server / client boundary

`localStorage` and `sessionStorage` exist only in the browser, so every component that reads or writes demo data (or the session) is a Client Component (`'use client'`). Server Components are used only for static shells, metadata and the seeded-car SSG.

## Server Components (no directive)
- `app/layout.js` (fonts, metadata, demo banner, providers), `app/(public|renter|owner|admin)/layout.js`
- All `page.js` files (they `await params` and render a client component), `app/sitemap.js`, `app/robots.js`, `app/not-found.js`
- `components/cars/CarCard.jsx`, `HeroSearch.jsx`, `components/layout/SiteFooter.jsx`, `components/ui/States.jsx`, `StatusBadge.jsx`, `Pagination.jsx`, `Icons.jsx` (no hooks, so they work in either environment)
- `lib/seed.js`, `lib/site.js` (pure; used by the server for the 7 seeded cars)

## Client Components (`'use client'`)
- **Layout/auth:** `AppProviders`, `SiteHeader`, `UserMenu`, `NotificationBell`, `Popover`, `AnnouncementBar`, `StorageNotice`, `RoleGate`, `DashboardShell`, `OwnerShell`, `AdminShell`, `RenterTabs`
- **Catalogue:** `CatalogueClient`, `CarDetailClient`, `BookingWidget`, `FeaturedCars`, `CarMap`, `LeafletMap`
- **Auth forms:** `SignInClient`, `SignUpClient`
- **Renter:** `CheckoutClient`, `RenterDashboardClient`, `BookingsListClient`, `BookingDetailClient`, `TrackClient`, `ReviewClient`, `DisputePanel`
- **Owner:** `OwnerOverviewClient`, `OwnerCarsClient`, `CarForm`, `OwnedCar`, `OwnedCarViews`, `AvailabilityManager`, `CarBookingsClient`, `EarningsClient`, `EarningsChart`, `OwnerReviewsClient`, `OwnerDisputesClient`
- **Admin:** all `components/admin/*`
- **UI that needs state/effects:** `Toast`, `ConfirmDialog` (native `<dialog>`), `Field`, `Stars`, `CarImage`
- `lib/hooks.js` (SWR), and `lib/data.js`, `lib/storage.js`, `lib/auth.js` and the domain modules (browser-only at runtime, importable by Node tests via a storage stand-in)

## Rules we followed
- Server Components never import storage code paths at render time.
- Functions cannot be passed from a Server Component to a Client Component. `OwnedCar` takes a render function, so it is only used from the client wrappers in `OwnedCarViews.jsx` (this was an actual bug found in testing).
- Leaflet and Recharts touch `window`/measure the DOM, so they are loaded with `next/dynamic({ ssr: false })` and only on the pages that need them.
- Client Components can still be prerendered to HTML; they just show loading skeletons until storage is read after hydration.
