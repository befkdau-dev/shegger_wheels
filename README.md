# Sheggar Wheels

A responsive peer-to-peer car rental frontend for Addis Ababa
Renters browse and book cars, owners list cars and handle requests, and a demo admin moderates listings, users and disputes.

## Features

| Actor                              | What they can do                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visitor / Renter                   | Browse, search, filter (neighbourhood, price, transmission, seats, dates), sort and paginate cars; car detail with gallery, specs, availability, reviews and Leaflet map; sign up / sign in; mock TeleBirr checkout; receipt; cancel eligible bookings; booking history with CSV export; simulated trip tracker; leave a review; raise an issue; in-app notifications |
| Owner (same account can also rent) | Create/edit/deactivate listings with demo photo picker; block dates on an accessible calendar; approve/decline requests; start/complete rentals (simulation); earnings chart + accessible table; utilization; CSV exports; reply to reviews; see disputes                                                                                                             |
| Admin (seeded account only)        | Platform metrics and charts; approve/reject listings; suspend/reinstate users; all bookings; resolve disputes with notes; mock 10% platform fee; CSV reports; publish announcements                                                                                                                                                                                   |

## Tech stack

Next.js 15 (App Router) · React 19 · SWR · Recharts · Leaflet (OpenStreetMap tiles) · self-hosted variable fonts via `next/font/local` · plain CSS tokens (`app/globals.css`). No UI framework, no database.

## Setup

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start

```

## Demo accounts (no passwords exist)

Open `/signin` and click an account, or type its email.

| Account                    | Email               | Roles                                   |
| -------------------------- | ------------------- | --------------------------------------- |
| Selam Mekonnen (**admin**) | admin@sheggar.demo  | admin                                   |
| Dawit Bekele               | dawit@sheggar.demo  | renter + owner (5 cars)                 |
| Hanna Tesfaye              | hanna@sheggar.demo  | renter + owner                          |
| Abel Girma                 | abel@sheggar.demo   | renter + owner (pending + rejected car) |
| Meron Alemu                | meron@sheggar.demo  | renter (bookings in every status)       |
| Yonas Haile                | yonas@sheggar.demo  | renter                                  |
| Kebede Tadesse             | kebede@sheggar.demo | renter, **suspended**                   |

Public sign-up can only create renter or renter+owner accounts, never admin.

## Suggested eight-minute walkthrough

1. Home → search Bole → open the Corolla → pick dates → sign in as Meron → checkout (mock) → receipt.
2. Sign out → sign in as Dawit → `/owner` → approve the request → start and complete the rental.
3. Back as Meron → leave a review.
4. Try `/owner/cars/car-003/edit` as Dawit (not yours) and `/bookings/book-005` as Meron (not yours).
5. Sign in as the admin → approve Abel's pending car → resolve the open dispute → publish an announcement → download a CSV.
6. Reset demo data any time: corrupt `sw_cars_v1` in DevTools and use the recovery notice, or clear site data.

## Deployment (Vercel)

Push to GitHub, import the repo in Vercel, set `NEXT_PUBLIC_SITE_URL` to the deployment URL, deploy. No other configuration is needed.

## Documentation

`STRATEGY.md` (rendering per route) · `BOUNDARY.md` (server/client split) · `AUTH.md` · `DATA.md` · `PERF.md` · `FUTURE.md`.
