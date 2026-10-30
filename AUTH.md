# Authentication, roles and guardrails

> **These checks demonstrate frontend design only. They are NOT production security.** `localStorage`/`sessionStorage` are editable in DevTools; anyone can change their own role, impersonate any user, or edit any record. Real security needs a backend that authenticates users and authorises every request.

## Session model
- No passwords exist. Sign-in is a demo account picker or an e-mail lookup (`signInAsDemo`, `signInWithEmail`).
- Only `{ userId, signedInAt }` is stored in `sessionStorage` (`sw_session_v1`). The user record (roles, status) is looked up from `localStorage` on every read, so an admin suspending a user takes effect immediately.
- Sign-out clears the session and checkout-draft keys and navigates to `/` (`beginSignOut()` stops the route guard racing it to `/signin`).
- Public sign-up (`signUp`) only produces `['renter']` or `['renter','owner']`. Admin exists only as the seeded `admin@sheggar.demo`.

## Helpers (`lib/auth.js`)
`getCurrentSession()`, `signInAsDemo()`, `signOut()`, `hasRole()`, `requireRole(role)`, `safeReturnPath()`, plus `enableOwnerRole()` (add owner capability to your own account).

## Protected routes (UI guard: `RoleGate`)
`/dashboard /bookings* /checkout` need a renter; `/owner*` needs owner; `/admin*` needs admin. Signed-out visitors are redirected to `/signin?next=<path>`; suspended users see an "access blocked" message; wrong-role users get an explanation (and a one-click "Enable owner features" for renters). Pages additionally show "not yours" states for foreign IDs (`OwnedCar`, `getMyBooking`).

## Protected actions (the real guard)
Every write helper re-checks, in order: **session → suspended? → role → record exists → ownership/participation → current state**, and only then writes:
`createBooking, respondToRequest, cancelBooking, startRental, completeRental, createCar, updateCar, setCarActive, setUnavailableDates, moderateCar, createReview, replyToReview, raiseDispute, respondToDispute, resolveDispute, setUserStatus, createAnnouncement, setAnnouncementActive` and the CSV exports (which only export the caller's permitted rows). Hiding UI is never the only protection.

## Safe return path
`safeReturnPath(value, fallback)` accepts only same-site relative paths. It rejects absolute URLs, `//host`, `/\host`, `javascript:`, backslashes and control characters, and never returns to `/signin` or `/signup`.

## The three required negative tests (plus extras)
Run `npm run test:negative` (25 tests against the real modules with an in-memory storage). Also exercised in a real browser during development.
1. **Signed-out write:** `createBooking()` with no session returns `{ ok:false, error:'Not signed in' }`; booking count unchanged.
2. **Cross-user ownership:** Yonas calling `cancelBooking('book-003')` (Meron's) returns `'Not yours'`; record byte-identical afterwards.
3. **Unsafe return URL:** `/signin?next=https://example.com` (and `//evil.com`, `javascript:` …) ends on an internal page (`/dashboard`), never the external site.
4. **Extras:** an owner cannot edit another owner's car by ID; a renter cannot read another renter's booking; renter-only accounts cannot approve requests; only admins moderate/resolve; suspended users are refused; invalid lifecycle transitions and overlapping confirmations are refused with storage unchanged.
