This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Progress Log

### Project Operating Structure

- Work is being handled in small phases, with direct implementation only after the requirement is clear.
- Keep UI fixes separate from database migration work unless the UI change is required to verify the data flow.
- Keep database planning and progress in `SQL-PHASES.md`.
- Keep future-agent operating rules in `AGENTS.md`; `CLAUDE.md` points there too.
- Supabase is being introduced remote-first. The user chose to skip Docker/local Supabase for now.
- The agent drafts migrations, seed files, app wiring, and documentation. The user can run Supabase CLI pushes and SQL Editor verification manually.
- Do not add service-role keys to `.env.local`. Current app wiring only needs the Supabase project URL and anon/publishable key.

### Supabase Migration, Phase 0 Through Phase 2

- Added Supabase project scaffolding under `supabase/`.
- Added `SQL-PHASES.md` as the database progress tracker and source of truth for schema phases.
- Created Phase 1 core database migration for employees, jobs, job crew, and job activity.
- Added tagged seed data in `supabase/seed.sql` using `is_seed_data` and `seed_batch` for future cleanup before production.
- Chose UUID database primary keys with `legacy_mock_id` mapping so existing mock-routed screens can be migrated gradually.
- Chose normalized rows for future reporting-heavy modules.
- Chose Supabase Storage as the long-term direction for signatures and uploaded media, with SQL metadata later.
- Auth is deferred until the final Supabase phase.
- Pushed and verified Phase 1 in the remote Supabase project.
- Ran seed SQL manually in Supabase SQL Editor and verified counts:
  - `employees`: 5
  - `jobs`: 16
  - `job_crew`: 28
  - `job_activity`: 9
- Created Phase 2 read-policy migration for the current jobs flow.
- Configured app-side Supabase reads with mock fallbacks so the app remains usable if Supabase env vars are missing or a read fails.
- Wired `/api/jobs` to `jobs_list_view`; verified the jobs list is Supabase-backed and sorted by job number.
- Wired Job Detail reads to Supabase for job, supervisor, crew, employees, and activity.
- Fixed the Job Detail map wrapper to load Leaflet client-only, resolving the `window is not defined` render/build blocker.
- Verified `/dashboard/jobs/job-riverfront` returns `200 OK`.
- Verified `npx next build` passes after the Supabase read wiring and map fix.

### Phase 2.3 Job Activity Insert Path (2026-05-15)

- Created `supabase/migrations/20260515210000_phase_2_3_job_activity_insert_policy.sql` — INSERT RLS policy for anon/authenticated.
- Fixed missing GRANT in `20260515211000_fix_job_activity_insert_grant.sql`.
- Added `insertJobActivity()` helper in `lib/supabase/jobs.ts`.
- Built `POST /api/jobs/[jobId]/activity` route with UUID/legacy ID resolution.
- Updated `ActivitySection` component: POST with loading states, error/success toasts.
- Updated job detail page to pass `jobId` to `ActivitySection`.
- Verified: Activities insert, persist to Supabase, display on page refresh.

**Phase 2 Complete** — jobs list, detail, create site, and activity notes all read/write from Supabase.

### Phase 3 Time Tracking (2026-05-15)

**Schema & Migration:**
- Analyzed existing time tracking workflow: active shifts (one per employee), time entries (one per shift, multiple per day for split shifts), time-off requests (moved to Scheduling phase).
- Created migration `20260515220000_phase_3_time_tracking.sql`:
  - Tables: `active_shifts` (temporary, converted to entries on clock out), `time_entries` (normalized per shift with source + status)
  - Indexes on employee_id, job_id, status, clock_in_at, employee+date combo
  - RLS policies: read all, insert own, update status
  - Added `update_timestamp()` trigger function for updated_at tracking
  - Timestamps stored as single clock_in_at + clock_out_at (app converts to date/time strings)

**Seeding & Testing:**
- Created seed data: 1 active shift (Jake/Carstairs today), 5 time entries (Mike/Tanya/Jake with various sources + statuses)
- All tagged with `is_seed_data=true`, `seed_batch=phase_3_time_tracking_seed_2026_05_15`
- Verified in SQL Editor: counts correct, sources/statuses/dates match design

**Supabase Helpers:**
- Created `lib/supabase/time.ts` with functions: `clockIn()`, `clockOut()`, `addManualEntry()`, `getActiveShifts()`, `getTimeEntries()`, `reviewTimeEntry()`
- Row converters: `rowToTimeEntry()`, `rowToActiveShift()` (convert DB timestamps to app format)

**API Endpoints & App Wiring:**
- Created endpoints: `POST /api/time/clock-in`, `POST /api/time/clock-out`, `GET/POST /api/time/entries`, `GET /api/time` (initial load)
- Updated `useTimeTracking` hook: fetch from `/api/time` on mount, clock in/out/add entry POST to APIs with async/await
- Kept localStorage fallback for resilience; all actions update local state + persist to Supabase
- All methods now async with try/catch, graceful fallback to mock if Supabase unavailable

**Phase 3 Complete** — time tracking fully Supabase-backed with API layer and hook wiring.

### Phase 4 Safety/FLHA (2026-05-15)

**Schema & Migration:**
- Analyzed FLHA workflow: sessions (one per job/date), hazards/controls (arrays), crew (names), signatures (one per worker).
- Normalized design: separate tables for hazards, controls, crew (not JSON arrays) for reporting/querying.
- Created migration `20260515230000_phase_4_safety_flha.sql`:
  - Tables: `flha_sessions`, `flha_session_hazards`, `flha_session_controls`, `flha_session_crew`, `flha_signatures`
  - Indexes on job_id, session_date, hazard_type, control_type, employee_id for fast queries
  - RLS policies: read all, insert/update/delete
  - Updated_at triggers for sessions + signatures

**Supabase Helpers:**
- Created `lib/supabase/safety.ts` with functions: `createFlhaSession()`, `getJobSessions()`, `getTodaySession()`, `addSignatureToSession()`, `markSessionReviewed()`, `updateFlhaSession()`, `deleteFlhaSession()`
- Batch operations for performance (insert session + hazards + controls + crew in parallel)
- Pagination support (50-100 sessions per page for mobile)

**API Endpoints & App Wiring:**
- Created endpoints: GET/POST /api/safety/sessions, GET by-job/[jobId], PUT/DELETE /api/safety/sessions/[sessionId], POST signatures, POST review
- Updated `useFlhaSessions` hook: fetch from API on mount, all operations async with localStorage fallback
- Added cache headers (30s) for performance on mobile networks
- Maintains same public API (components don't change)

**Seeding & Performance:**
- Seed data: 1 session (Riverfront yesterday) with 4 hazards, 4 controls, crew (Mike/Jake/Tanya), 2 signatures, reviewed by Ben
- All tagged with `is_seed_data=true`, `seed_batch=phase_4_safety_seed_2026_05_15`
- Normalized tables optimize for: frequency queries ("most common hazards?"), crew tracking ("who was on site?"), signature lookups

**Phase 4 Complete** — safety FLHA fully Supabase-backed with normalized schema for reporting.

### Build Fixes for Vercel Deploy (2026-05-15)

Post-Phase 4 cleanup session — resolved TypeScript build errors blocking production deploy.

**Root causes identified:**
- Dynamic route folders created with literal backslashes (`\[sessionId\]`, `\[jobId\]`) — filesystem issue.
- Next.js 16 App Router: dynamic route params are now `Promise<T>` — job activity route still using old signature.
- `JobInsertPayload` declared `is_seed_data: false` (literal), rejected by Supabase strict insert type (`never` for excess properties).
- `@base-ui/react` v1.4.1 `Select.onValueChange` now passes `string | null` — 8 callsites in time-page-client failed type check.
- `lib/supabase/types.ts` Database type missing all Phase 3/4 tables — every `.from("flha_*")` and `.from("active_shifts")` failed.
- DB-returned strings cast to union types (`FlhaHazard`/`FlhaControl`) without explicit cast.

**Surgical fixes (one place, broad impact):**
- Renamed offending route folders to proper Next.js dynamic syntax.
- Updated job activity `POST` handler to `params: Promise<{ jobId: string }>`.
- Removed dead `is_seed_data: false` from `JobInsertPayload` type + API route insert payload.
- Wrapped `Select` in `components/ui/select.tsx` to filter null in `onValueChange` — no callsite changes needed.
- Added Phase 3 (active_shifts, time_entries) and Phase 4 (flha_sessions + 4 normalized tables) row types and Database table entries in `types.ts`.
- Cast `hazards`/`controls` to `FlhaHazard[]`/`FlhaControl[]` in `rowToFlhaSession`.
- Added supabase null guard in `rowToFlhaSession`.

**Result:** `npm run build` passes cleanly. All static, SSG, and dynamic routes generate. Vercel deploy unblocked.

**Lesson for future phases:** when adding Supabase tables, update `lib/supabase/types.ts` Database type immediately as part of the same change — don't defer.

Current Supabase next steps:

- Phase 5: Daily Reports signed database snapshots — schema drafted, pending push/verification and app wiring.
- Phase 6: Documents/photos/signatures in Supabase Storage.
- Phase 7: Supabase Auth and stricter role-based RLS.

### Phase 5 Daily Reports Schema Draft (2026-05-16)

- Created `supabase/migrations/20260516140000_phase_5_daily_reports.sql` for normalized daily report snapshots.
- Added tables for daily reports, report sites, employee hours, weather snapshots, and report signatures.
- Added RLS policies, anon/authenticated grants, indexes, and updated_at triggers for the Phase 5 tables.
- Updated `lib/supabase/types.ts` immediately with Phase 5 Database table entries.
- Added tagged Phase 5 seed data to `supabase/seed.sql` for one signed aggregate report with two site snapshots, per-site employee hours, weather, and a supervisor signature.
- Fixed the Phase 5 seed signature timestamp expression after Supabase SQL Editor rejected the first date/time concatenation.
- Fixed a pre-existing Phase 4 seed typo that referenced a nonexistent `flha_sessions.legacy_mock_id` column.
- Verified `npm run build` passes.
- Verified `npx supabase db push --dry-run` reports one pending migration: `20260516140000_phase_5_daily_reports.sql`.
- Project owner pushed the Phase 5 migration with `npx supabase db push`.
- Verified `npx supabase migration list` shows `20260516140000` in both Local and Remote history.
- Project owner ran the Phase 5 seed block successfully in Supabase SQL Editor after the signature timestamp fix.
- Verified Phase 5 row counts in Supabase SQL Editor: reports/sites/employee-hours/weather/signatures = 1/2/2/6/1.
- App wiring is intentionally still pending.

### Log Reconciliation (2026-05-16)

- Re-read the project markdown logs and compared them against local migrations, API routes, Supabase helper files, and dashboard routes.
- Checked Supabase CLI migration history with `npx supabase migration list`; every local migration through Phase 4 is present remotely.
- Checked `npx supabase db push --dry-run`; CLI reported the remote database is up to date.
- Updated stale log language so Phase 2, Phase 3, and Phase 4 are consistently marked complete, with Phase 5 as the next database phase.
- Verified `npm run build` still passes.
- Added a UUID-format guard to the Supabase job detail UUID lookup so static legacy job routes skip the UUID query and avoid non-fatal Postgres `22P02` fallback logs during build.

### Landing Page Legacy iPad Compatibility Test (2026-05-16)

- Reworked only the root landing page styling into `app/page.module.css` to test older iPad Safari rendering.
- Removed landing-page reliance on backdrop blur, Tailwind opacity utility output, flex gaps, and newer viewport units.
- Kept dashboard/internal app pages unchanged until the landing-page test is verified on the 2013 iPad Air.
- Created the `retro-fit` branch for continued old-browser compatibility work away from `main`.
- Added a scoped legacy WebKit fallback block in `app/globals.css` for old iPad Safari: `svh` fallback, Tailwind 4 transform fallbacks, momentum scrolling, and flex-gap spacing fallbacks.
- Updated the PostCSS pipeline on `retro-fit` to unwrap Tailwind 4 cascade layers after generation, because iOS 12 Safari does not understand `@layer` and can otherwise ignore most of the app stylesheet.

### Daily Reports Tablet Modal Fixes

- Replaced the native supervisor dropdown in the Generate Daily Report modal with the app `Select` component so tablet-sized views do not show the browser-native dropdown in the wrong place.
- Adjusted the Generate Daily Report modal footer spacing so Cancel and Sign & Save Report are not tight against the bottom edge.

### Daily Reports Aggregate Flow

- Reworked the Daily Reports landing page around one signed daily report per date instead of bulky per-job report cards.
- Added a large Generate Daily Report action with a modal form, blurred backdrop, date picker, supervisor selector, progress summaries, and supervisor signature.
- Auto-fills worked sites from time entries and active clock-ins for the selected date, including multi-site employee hours.
- Auto-fills weather snapshots through the Open-Meteo API and safety summaries from matching FLHA sessions.
- Added local browser persistence for generated daily aggregate reports while real database storage is still pending.

### Time Tracking Module

- Replaced the Time module shell with a mock-data time tracking dashboard for clock in/out, manual daily entries, split-shift entries, time-off requests, approvals, and recent entries.
- Added local browser persistence for time tracking test flows using the same `localStorage` pattern as the Safety module.
- Added time tracking seed data and domain types to help validate the future database shape before wiring real persistence.
- Note: time-off requests may move into Scheduling later, but remain on Time Tracking for now to test request and approval data flow.
- Superseded by Phase 3: active shifts and time entries now read/write through Supabase-backed API routes with localStorage fallback.

### Browser Tab Favicon

- Added an App Router `app/icon.svg` sledge hammer icon so browsers can use an SVG tab favicon while keeping the existing `.ico` fallback.

### Safety Detail Back Link

- Doubled the Safety back-link label size on the safety job detail view for better readability.

### Safety Detail Flow

- Reworked the job safety detail view around a large daily Safety Sign-Off action, current-day signature collection, and an expandable previous-sheets table.

### Safety Sign-off Module

- Added FLHA domain types and mock data for `flha_sessions` and `flha_signatures`, including the requested Riverfront, Maple Street, and Highway 2 scenarios.
- Added tablet-first routes for `/dashboard/safety`, `/dashboard/safety/[jobId]`, and `/dashboard/safety/review`.
- Digitized the FLHA header fields, hazard checklist, required controls checklist, comments, validation, read-only submitted view, worker signature flow, review table, and on-demand PDF export with `@react-pdf/renderer`.
- At this stage, mock persistence was browser-local through `localStorage`; no real database writes had been added yet.
- Superseded by Phase 4: FLHA sessions, normalized hazards/controls/crew, signatures, review, update, and delete flows now read/write through Supabase-backed API routes with localStorage fallback.

### Phase 2.2 Create Site Insert & Safety Fixes (2026-05-15)

**Safety Sign-off Fixes:**
- Fixed edit flow: preserved `session_date` in form defaults so editing existing sessions updates instead of creating new ones.

**Create Site Insert Path (Supabase Phase 2.2):**
- Created `supabase/migrations/20260515200000_phase_2_2_jobs_insert_policy.sql` — grants INSERT on `jobs` table to anon/authenticated roles.
- Added `insertJob()` helper in `lib/supabase/jobs.ts` for Supabase writes.
- Implemented `POST /api/jobs` handler with server-side job number generation (SC-YYYY-NNN format).
- Enhanced Create Site dialog: added Client Name + Start Date fields, GPS coordinate auto-population, error handling, loading states.
- Wired dialog to call API instead of in-memory mock — real Supabase persistence.
- Added toast notification on successful site creation (sonner) with checkmark icon, auto-dismiss after 4s.
- Dialog closes immediately on success instead of delayed close.

**Job Detail UUID Lookup:**
- Added `getJobDetailByUUID()` function to handle Supabase-created jobs (UUID-based IDs).
- Updated job detail page to try UUID lookup first, then legacy ID fallback — fixes 404 for newly created sites.

**UI & Styling Updates:**
- Replaced all red colors with brand color `#c0392b` across Create Site dialog (title, button, error box, delete button, select focus rings, file upload hover).
- Increased font sizes: "Active Sites" label, Review button, "New Site" button, "Back to All Sites" link, status badge on job detail, activity feed text, Add Site Note dialog title.
- Changed job detail tab navigation: pill-shaped (`rounded-full`) → rectangular with rounded corners (`rounded-lg`).
- Enlarged "Add Site Note" dialog: `max-w-lg` → `max-w-4xl`, textarea `min-h-24` → `min-h-40`, fonts increased across title/textarea/buttons.
- Increased textarea font to 18px with inline style.
- Changed jobs list sort order: ascending by job_number → descending by created_at (newest first).
- GPS button now populates address field with coordinate string (lat, lng format).

### UI & Component Overhaul Session (2026-05-15)

**Objective:** Improve font sizing, spacing, and component consistency across the app. Address dropdown positioning bug caused by overflow constraints.

**Changes by Section:**

**Sidebar Navigation (app-sidebar.tsx):**
- Increased vertical gap between icons: `gap-0` → `gap-2`.

**Job Detail Tabs (jobs/[id]/page.tsx):**
- Tab font size: `text-base` → `text-lg`.
- Tab layout: centered → full-width even distribution (`justify-between`).
- Achieved with: TabsList `w-full flex justify-between` instead of `justify-center`.

**Jobs List Counter Badge (jobs/jobs-view.tsx):**
- Added: `text-base` font size + `px-4 py-2` padding.
- Shape: `rounded-lg` → `rounded-md` (less pill-shaped).
- Result: larger, more rectangular badge with proper breathing room.

**Filter Section & Table Headers (jobs/jobs-view.tsx):**
- Filter by Status label: `text-sm` → `text-base`.
- Filter buttons: padding `px-3 py-1.5` → `px-4 py-2`, font `text-xs` → `text-sm`.
- Table headers: height `h-11` → `h-12`, font `text-sm` → `text-base`.

**Admin Page Role Badges (dashboard/admin/page.tsx):**
- Shape: added `rounded-md` for consistent rectangular styling.
- Padding: `px-3 py-1.5` for balanced breathing room.
- Icon: `h-3 w-3` → `h-4 w-4`.
- Font: `text-[10px]` → `text-xs`.

**Time Tracking Stat Cards (time/time-page-client.tsx):**
- **New feature:** Added unit labels (active, h, pending, request) displayed next to values.
- **Layout:** Units in `text-lg`, slightly smaller than value `text-5xl`.
- **Icon repositioning:** Moved from inline with title to `absolute top-4 right-4` (top-right corner).
- **Icon size:** `h-6 w-6`.
- **Typography improvements:** Title `text-xs` → `text-sm`, helper text `text-xs` → `text-base`.

**Dropdown Component Fix (Card + Select):**
- **Root cause:** Card component had `overflow-hidden` CSS class which clipped dropdown menus, forcing the browser to reposition them at the card's top edge instead of below the select trigger.
- **Solution:** Removed `overflow-hidden` from `components/ui/card.tsx` to allow dropdowns to render outside card bounds.
- **Component replacement:** Replaced native HTML `<select>` (via NativeSelect wrapper) with shadcn `Select` component across time page.
  - Removed `NativeSelect` function definition from `time-page-client.tsx`.
  - Updated all 8 select usages: Clock In (employee, job), Manual Entry (employee, job), Split Shift (employee, jobs), Time Off (employee).
  - New structure: `<Select>` → `<SelectTrigger>` → `<SelectContent>` → `<SelectItem>` (items).
  - Styling: triggers get `min-h-11 w-full bg-background px-3`, content gets `z-[60]` for proper z-index stacking.
- **Result:** Dropdowns now position correctly below the trigger, matching the style of daily reports supervisor dropdown.

**Impact Summary:**
- 15+ individual UI/UX improvements across 6 major components.
- 2 architectural fixes (overflow constraint removal, dropdown replacement).
- Consistent sizing, spacing, and shape language applied throughout the app.
- Dropdown behavior now matches user expectations (appears below trigger, not at page top).
- All changes preserve existing functionality while improving visual consistency and usability.
