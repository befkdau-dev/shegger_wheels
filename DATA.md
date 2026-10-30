# Data layer

## Storage keys
| Key | Store | Contents |
|---|---|---|
| `sw_users_v1` | localStorage | Users `{id,name,email,phone,roles[],status,createdAt}` |
| `sw_cars_v1` | localStorage | Cars `{id,ownerId,make,model,year,transmission,seats,city,neighbourhood,latitude,longitude,pricePerDay,photos[],description,status,unavailableDates[],createdAt,approvedAt}` |
| `sw_bookings_v1` | localStorage | Bookings with price snapshot `{...,days,pricePerDay,subtotal,fee,total,paymentStatus,paymentRef,status,createdAt,updatedAt}` |
| `sw_reviews_v1` | localStorage | Reviews `{id,bookingId,carId,renterId,ownerId,rating,comment,ownerReply,createdAt}` |
| `sw_disputes_v1` | localStorage | Disputes `{id,bookingId,openedBy,reason,description,status,resolutionNotes,resolvedBy,createdAt,resolvedAt,responses[]}` |
| `sw_announcements_v1` | localStorage | Announcements `{id,title,message,active,createdAt,createdBy}` |
| `sw_session_v1` | sessionStorage | `{userId, signedInAt}` |
| `sw_checkout_draft_v1` | sessionStorage | `{carId,startDate,endDate,savedAt}` |
| `sw_dismissed_v1` | sessionStorage | One-time UI flags (dismissed announcement IDs) |

No passwords, card numbers, phone PINs or secrets are stored. IDs use `crypto.randomUUID()` (fallback: timestamp). Dates are `YYYY-MM-DD`; timestamps are ISO strings.

## Modules and data flow
`lib/storage.js` (safe read/write) → `lib/data.js` (get/save per entity, seeding, reset) → domain modules (`auth, bookings, cars, reviews, disputes, admin, exports`) → `lib/hooks.js` (SWR) → components. Components never touch storage directly.

Helpers: `readStorage(key, fallback)`, `writeStorage(key, value)`, `initializeDemoData()`, `resetDemoData()`, `getCars/getBookings/getUsers/...`, `saveCar/saveBooking/...`. SWR keys (`sw:*`) are revalidated when `emitChange()` fires `sw:data` (same tab) or the browser `storage` event (other tabs). That is local refresh, not server-backed real-time sync.

## Rules and validation
- **Seeding:** runs once and only for keys that are absent; never overwrites user data on refresh. Seed dates are relative to "today".
- **Public cars:** `status === 'approved'` AND owner `active` (suspension hides cars).
- **Booking price:** snapshot of `pricePerDay`, `days` (inclusive), `subtotal`, `fee` (10%, rounded), `total` at request time. Max 30 days, start not in the past.
- **Availability:** a car is free for a range if no blocked date falls inside it and no `confirmed`/`in_progress`/`disputed` booking overlaps (inclusive ranges). Overlapping *requests* may coexist; only one can be *confirmed*.
- **Lifecycle:** `requested→confirmed|declined|cancelled`, `confirmed→in_progress|cancelled`, `in_progress→completed|disputed`, `completed→reviewed`, `disputed→resolved`; everything else is refused (`TRANSITIONS` in `lib/bookings.js`).
- **Reviews:** only the renter of a `completed` booking, one per booking, rating 1–5, comment 10–800 chars.
- **Forms:** email unique (case-insensitive), phone format, car price whole ETB 500–50,000, coordinates inside the Addis bounding box, description 20–600 chars, ≥1 photo.
- **CSV:** RFC-4180 quoting; cells beginning `= + - @` are prefixed with `'` against formula injection; exports include only the caller's permitted rows.

## Recovery behaviour
Missing key → empty/seeded. Malformed JSON, wrong shape or invalid records → ignored, a warning notice appears with a **Reset demo data** button (`StorageNotice`). Storage blocked/quota full → clear error message; browsing still works. A car/booking that no longer exists shows a "not found" state with a link back.
