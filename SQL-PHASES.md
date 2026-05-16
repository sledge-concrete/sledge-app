# SQL Phases

This file tracks database-only planning and progress for the Supabase migration.
Every time the database schema, migrations, seed data, storage buckets, RLS policies, or Supabase project setup changes, add a dated entry here.

## Rules

- Log database work in this file before the task is considered complete.
- Keep app UI/code changes out of this log unless they directly support database wiring.
- Never paste secrets, tokens, service-role keys, or real environment values here.
- Prefer phased migrations that can be tested locally before touching the remote Supabase project.
- Keep mock seed data in database seed files once the schema exists, not hardcoded app modules.

## Working Structure

- Work is split into database phases so each migration can be understood, pushed, verified, and logged.
- Migration files in `supabase/migrations/` are the source of truth for schema, views, grants, and RLS policies.
- `supabase/seed.sql` is the source of truth for mock/test database seed rows.
- `SQL-PHASES.md` is the source of truth for database decisions, progress, and next steps.
- `README.md` tracks broader app progress.
- `AGENTS.md` tracks future-agent operating instructions.
- Keep app wiring incremental. Read from Supabase first, keep mock fallback until the replacement flow is stable.
- Remove hardcoded mock data only after the matching Supabase-backed read/write flow is verified.

## Current Supabase Workflow

- The project is using a remote-first Supabase workflow for now.
- Docker/local Supabase was intentionally skipped by project-owner preference.
- The agent can create migrations, seed SQL, Supabase helper code, app read/write wiring, and docs.
- The project owner can manually run Supabase CLI commands and SQL Editor verification.
- Cloud schema changes should be applied with `npx supabase db push` after reviewing pending migrations.
- Cloud `db push` applies migration files only. It does not automatically run `supabase/seed.sql`.
- Seed data can be run manually in Supabase SQL Editor when needed.
- SQL Editor is also used to verify counts, views, and data shape after a push.
- Do not add a service-role key to `.env.local` during these phases.
- Current required app env vars are:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Manual Command Notes

- `npx supabase login`: authenticates the local CLI with Supabase.
- `npx supabase link --project-ref <project-ref>`: connects this repo to the remote Supabase project.
- `npx supabase db push`: applies migration files that have not already been applied to the linked remote database.
- `npx supabase db push` tracks applied migrations by migration filename/version in Supabase's migration history.
- If Phase 2 and Phase 3 migrations both exist and neither has been applied, one `db push` applies both in filename timestamp order.
- `npx supabase start` and `npx supabase db reset` require Docker; these are not part of the current workflow because Docker was skipped.

## Current Sprint Status

- Sprint 1 complete: Supabase project setup, Phase 1 core tables, seed data, remote verification.
- Sprint 2 complete: Jobs/Sites read and write path.
- Sprint 3 complete: Time Tracking schema, API routes, hook wiring, and seed data.
- Sprint 4 complete: Safety/FLHA schema, API routes, hook wiring, seed data, and build fixes.
- Current database focus: Phase 5 Daily Reports normalized snapshot tables.
- Later database focus:
  - Phase 6 Documents/photos/signatures in Supabase Storage.
  - Phase 7 Supabase Auth and stricter role-based RLS.

## Phase Overview

### Phase 0 - Supabase Project Setup

Goal: prepare local Supabase project structure, environment placeholders, and database workflow.

Status: Complete

Planned work:

- Initialize local Supabase project config. Done 2026-05-15.
- Confirm `.env.local` is ignored and ready for local credentials. Done 2026-05-15.
- Decide local-first versus remote-first workflow after Supabase project details are available.
- Document required environment variables without committing secret values.

### Phase 1 - Core Tables

Goal: create the base tables every working flow depends on.

Status: Complete

Candidate tables:

- `employees`
- `jobs`
- `job_crew`
- `job_activity`

### Phase 2 - Jobs / Sites Flow

Goal: move Sites, Job detail, Create Site, and job activity reads/writes from hardcoded mock data to Supabase.

Status: Complete

Completed database work:

- Job list/query migration. Complete.
- Job detail query migration. Complete for reads.
- Create Site insert path. Complete.
- Job activity insert/read path. Complete.

### Phase 3 - Time Tracking

Goal: replace browser `localStorage` time tracking persistence with Supabase tables.

Status: Complete

Tables created:

- `active_shifts` — temporary shift tracking (one per employee, deleted on clock out)
- `time_entries` — normalized per-shift entries (multiple per day allowed for split shifts)
- (time_off_requests moved to Scheduling phase, not included in Phase 3)

### Phase 4 - Safety / FLHA

Goal: replace browser `localStorage` FLHA persistence with Supabase tables.

Status: Complete

Tables created:

- `flha_sessions`
- `flha_signatures`
- `flha_session_hazards`
- `flha_session_controls`
- `flha_session_crew`

### Phase 5 - Daily Reports

Goal: store signed daily reports as database snapshots generated from time, safety, jobs, weather, and signatures.

Status: Complete

Tables:

- `daily_reports`
- `daily_report_sites`
- `daily_report_employee_hours`
- `daily_report_weather_snapshots`
- `daily_report_signatures`

### Phase 6 - Storage

Goal: move mock uploads and signature/media storage to Supabase Storage.

Status: Pending

Candidate buckets:

- `job-documents`
- `job-photos`
- `signatures`

### Phase 7 - Auth and RLS

Goal: replace mock user switching with Supabase Auth and enforce role-based access with RLS.

Status: Pending

Candidate database work:

- Auth/profile linkage.
- Role policies.
- Tablet access policy.
- Storage object policies.

## Database Progress Log

### 2026-05-15 - Phase 0 Started

- Created this database progress tracker.
- Confirmed `.env.local` exists, is empty, and is ignored by `.gitignore`.
- Confirmed no existing `supabase/` project folder or migration files were present before Phase 0 setup.
- No database tables, migrations, seed data, storage buckets, or RLS policies have been created yet.

### 2026-05-15 - Phase 0 Local Supabase Scaffold

- Ran `npx supabase init`.
- Added `supabase/config.toml` with the default local Supabase configuration for project id `sledge-app`.
- Added `supabase/migrations/.gitkeep` so migration files have a tracked home before Phase 1.
- Added `supabase/seed.sql` as an empty placeholder; no seed rows were inserted.
- Left `.env.local` empty because project URL/anon key values are not known yet and secrets must not be committed.
- No remote Supabase organization/project was linked.
- No database tables, migrations, seed rows, storage buckets, or RLS policies were created.

Required local environment variables once the Supabase project exists:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server-only variables may be added later only if a server-side operation requires them. Do not expose service-role keys to browser code.

## Project Decisions

- Workflow: app should be wired to Supabase, while migrations and phases can be run manually by the project owner.
- Auth: defer real auth/login until the last phase; keep mock user switching while database-backed data is introduced.
- IDs: use UUID primary keys with `legacy_mock_id` for migration mapping.
- Mock data: all database test/seed rows must be tagged so they can be removed before production.
- Signatures: use Supabase Storage long term, with SQL metadata.
- FLHA hazards/controls: use normalized rows based on long-term reporting/scalability, not fastest initial implementation.
- Time off: design table ownership so it can move into Scheduling later.
- Tenancy: single-company custom project for Sledge; no multi-tenant/company abstraction needed now.

## Schema Decisions

### 2026-05-15 - Direction From Project Owner

- Supabase should be connected throughout the app over phases.
- Database migrations can be run manually by the project owner.
- Real Supabase Auth/login should be done last.
- Mock/test data in the database must be easy to identify and remove before production.
- Time-off requests should eventually belong to Scheduling, even if they are currently displayed in Time Tracking.
- This is a single-company custom Sledge project, so Phase 1 should avoid unnecessary multi-tenant abstractions.

Resolved recommendations for Phase 1:

- Primary key strategy. Decision: use UUID primary keys with `legacy_mock_id` for migration mapping.
- Mock/test data tagging pattern. Decision: use `is_seed_data` and `seed_batch`.
- Signature storage strategy. Decision: use Supabase Storage for long-term signature files, with SQL metadata.
- FLHA hazard/control modeling strategy. Decision: use normalized rows for long-term reporting and maintainability.

### 2026-05-15 - Phase 1 Core Migration Drafted

- Added migration `supabase/migrations/20260515180000_phase_1_core_tables.sql`.
- Migration creates core enums:
  - `employee_role`
  - `job_status`
  - `job_activity_type`
- Migration creates core tables:
  - `employees`
  - `jobs`
  - `job_crew`
  - `job_activity`
- Migration uses UUID primary keys for long-term stability.
- Migration includes `legacy_mock_id` columns where useful for mapping current hardcoded data during the transition.
- Migration includes `is_seed_data` and `seed_batch` columns so mock/test rows can be removed before production.
- Migration adds basic indexes for status filters, crew lookups, job activity ordering, and seed cleanup.
- Migration adds an `updated_at` trigger helper for mutable tables.
- Migration adds `jobs_list_view` to support fast app reads for the Sites/Jobs list.
- Updated `supabase/seed.sql` with current employees, jobs, job crew, and job activity as tagged seed data.
- No app code was connected to Supabase yet.
- No remote Supabase project was linked.
- No auth, RLS, storage buckets, time tracking tables, safety tables, or daily report tables were created in this phase.
- Local apply validation is still pending because Docker/local Supabase was not running in this workspace.
- Manual validation command when Docker is running: `npx supabase db reset`.

### 2026-05-15 - Supabase Project Creation Choices

- Project owner created the remote Supabase project under the existing Supabase organization.
- Data API was enabled.
- Automatic exposure of new tables was disabled so API exposure is controlled intentionally.
- Automatic RLS was enabled for new public tables.
- Project owner chose to skip Docker/local Supabase for now and use remote-first CLI pushes plus SQL Editor checks.
- Project owner logged into the Supabase CLI and linked this repo to the remote project.
- No service-role key was added to `.env.local`.

### 2026-05-15 - Phase 1 Cloud Verification Complete

- Remote Supabase project was created and linked with the Supabase CLI.
- Phase 1 migration was pushed to the remote Supabase database.
- Seed data was run manually in Supabase SQL Editor because cloud `db push` applies migrations but does not run `supabase/seed.sql`.
- Verified table counts:
  - `employees`: 5
  - `jobs`: 16
  - `job_crew`: 28
  - `job_activity`: 9
- Verified `jobs_list_view` returns 16 rows sorted by job number.
- Verified seeded rows are tagged with `is_seed_data = true` and `seed_batch = phase_1_core_seed_2026_05_15`.
- Phase 1 database setup is complete.

### 2026-05-15 - Phase 2 Jobs List Wiring Drafted

- Added migration `supabase/migrations/20260515190000_phase_2_jobs_read_policies.sql`.
- Migration explicitly enables RLS on Phase 1 core tables.
- Migration grants read access for `anon` and `authenticated` roles on Phase 1 core tables and `jobs_list_view`.
- Migration adds read policies for:
  - `employees`
  - `jobs`
  - `job_crew`
  - `job_activity`
- Migration updates `jobs_list_view` with legacy supervisor and crew IDs so the existing Jobs UI can read from Supabase without breaking current mock-routed job detail pages.
- Migration sets `jobs_list_view` to `security_invoker = true` so view reads respect caller permissions and RLS policies.
- Added server-side Supabase helper and minimal database row types for `jobs_list_view`.
- Updated `/api/jobs` to read `jobs_list_view` from Supabase when env vars are configured.
- Added mock fallback for `/api/jobs` when Supabase env vars are missing or the Supabase read fails.
- Job detail, Create Site inserts, activity writes, documents/photos, time tracking, safety, and daily reports are not yet connected to Supabase.

### 2026-05-15 - Phase 2 Jobs List Verified

- Pushed Phase 2 read policy migration to the remote Supabase database.
- Restarted the local Next.js dev server with Supabase env vars loaded.
- Verified `/api/jobs` returns Supabase-backed data sorted by `job_number`.
- Verified first returned job is `job-glenmore`, confirming the route is not using the old mock array order.
- Jobs list read path is now wired to Supabase.

### 2026-05-15 - Phase 2 Job Detail Read Wiring Drafted

- Added a Supabase job detail read helper that loads one job plus its supervisor, crew, employee list, and activity rows from the Phase 1 core tables.
- Updated the Job Detail page to prefer Supabase-backed job, crew, supervisor, employees, and activity data when Supabase env vars are configured.
- Kept mock fallback data in place so the page still loads if Supabase is unavailable during the phased migration.
- No new database migration was required; this uses the existing Phase 1 tables and Phase 2 read policies.
- Fixed a Job Detail render blocker by loading the Leaflet map client-only through the existing map wrapper. This was required to verify the Supabase-backed Job Detail page.
- Verified `/dashboard/jobs/job-riverfront` returns `200 OK`.
- Verified rendered activity keys use the Supabase detail mapping shape, confirming the Job Detail activity feed is reading from the new helper.
- Verified `npx next build` passes after the detail read wiring and map wrapper fix.
- Create Site inserts, activity writes, documents/photos, time tracking, safety, and daily reports remain pending.

### 2026-05-15 - Phase 2.2 Create Site Insert Path Complete

- Added migration `supabase/migrations/20260515200000_phase_2_2_jobs_insert_policy.sql` with INSERT RLS policy for anon/authenticated roles.
- Implemented `insertJob()` Supabase helper function with null-safe error handling.
- Built `POST /api/jobs` API route with server-side job number generation (SC-YYYY-NNN format, incremented from DB max).
- Updated Create Site dialog to collect Client Name and Start Date (previously hardcoded).
- Wired Create Site form to POST to `/api/jobs` — fully Supabase-backed persistence (no silent mock fallback for writes).
- Added GPS coordinate auto-population to address field (format: "lat, lng").
- Integrated toast notification (sonner) on successful creation with auto-dismiss.
- Added `getJobDetailByUUID()` function to support UUID-based job lookups for newly created sites.
- Updated job detail page routing to try UUID lookup first, then legacy ID — resolves 404 errors on new sites.
- Phase 2.2 verified: new sites created through dialog appear in jobs list, read from Supabase.

### 2026-05-15 - Phase 2.3 Job Activity Insert Path Complete

- Added migration `supabase/migrations/20260515210000_phase_2_3_job_activity_insert_policy.sql` with INSERT RLS policy for anon/authenticated roles.
- Fixed missing GRANT in follow-up migration `20260515211000_fix_job_activity_insert_grant.sql` (`grant insert on public.job_activity to anon, authenticated;`).
- Implemented `insertJobActivity()` Supabase helper in `lib/supabase/jobs.ts` to insert note-type activities with occurred_at and detail.
- Built `POST /api/jobs/[jobId]/activity` route with UUID/legacy ID resolution — accepts either format, resolves to UUID before insert.
- Updated `ActivitySection` component to POST to the activity route with loading states, error/success toasts, and refetch on insert.
- Updated job detail page to pass `jobId` parameter to `ActivitySection`.
- Verified end-to-end: activity notes POST successfully, persist to Supabase, and are retrieved on page load.
- Phase 2.3 verified: new activities created via dialog appear in activity feed, read from Supabase on next detail page load.

## Phase 2 Complete

- Jobs list reads from Supabase (sorted newest first).
- Job detail reads from Supabase (job, crew, supervisor, employees, activity).
- Create Site persists to Supabase.
- Job activity notes persist to Supabase.
- Phase 2 read/write flow is fully Supabase-backed.

### 2026-05-15 - Phase 3 Time Tracking Schema Complete

- Reviewed existing time tracking workflow in `useTimeTracking` hook, `time-types.ts`, and mock data.
- Analyzed data patterns:
  - Active Shifts: one per employee, temporary (deleted on clock out)
  - Time Entries: one per shift per day, multiple allowed (split shifts)
  - Time Off Requests: moving to Scheduling phase
- Key design decisions:
  - Active shifts: simple tracking, lightweight, frequent deletes
  - Time entries: normalized per shift (not per day), includes source (clock|manual|split), status (pending|approved|declined)
  - Approval workflow: single reviewer (reviewed_by + reviewed_at in time_entry row, no separate table needed yet)
  - Timestamps: store single clock_in_at + clock_out_at in DB, app converts to date/time strings on read
- Created migration `20260515220000_phase_3_time_tracking.sql`:
  - Tables: `active_shifts`, `time_entries`
  - Indexes: employee_id, job_id, status, clock_in_at, employee+date combo
  - RLS policies: read all entries, insert own, update status (review)
  - Grants for anon/authenticated roles
  - Fixed: added `update_timestamp()` trigger function for updated_at tracking
- Created helper functions in `lib/supabase/time.ts`:
  - `clockIn()`, `clockOut()`, `addManualEntry()`, `getActiveShifts()`, `getTimeEntries()`, `reviewTimeEntry()`
  - Row converters: `rowToTimeEntry()`, `rowToActiveShift()`
- Pushed migration to remote Supabase (2026-05-15).
- Seeded test data:
  - 1 active shift: Jake clocked in at Carstairs (today 07:15)
  - 5 time entries: Mike (Riverfront clock/pending, Maple split/approved, Riverfront split/approved), Tanya (Eastside manual/pending), Jake (Carstairs manual/declined)
  - All tagged with `is_seed_data=true`, `seed_batch=phase_3_time_tracking_seed_2026_05_15`
- Data verified in SQL Editor: counts match, sources/statuses/dates correct.

### 2026-05-15 - Phase 3 App Wiring Complete

- Created API endpoints:
  - `POST /api/time/clock-in` - clock in a worker, creates active_shift
  - `POST /api/time/clock-out` - clock out, creates time_entry, deletes active_shift
  - `GET /api/time/entries` - fetch all time entries
  - `POST /api/time/entries` - add manual time entry
  - `GET /api/time` - fetch active shifts and entries (for initial load)
- Updated `useTimeTracking` hook:
  - Fetch from `/api/time` on mount instead of localStorage
  - Clock in/out/add entry now POST to APIs (async with fallback to local mock)
  - Maintains localStorage sync for resilience
  - All actions keep local state updates + Supabase persistence
- Phase 3 ready to test end-to-end.

## Phase 3 Complete

- Active shifts tracked in Supabase (clock in creates shift, clock out creates entry + deletes shift).
- Time entries normalized per shift (multiple per day for split shifts).
- Clock in/out/add entry fully wired via API endpoints with Supabase persistence.
- App hook (useTimeTracking) now async, calls APIs with localStorage fallback.
- Seed data verified: 1 active shift, 5 time entries with correct sources/statuses.
- Phase 3 read/write flow is fully Supabase-backed.

### 2026-05-15 - Phase 4 Safety/FLHA Schema & App Wiring Complete

- Analyzed FLHA workflow: sessions (one per job/date), hazards/controls (arrays), crew (names), signatures (one per worker)
- Key design: normalized hazards/controls/crew tables for reporting queries + performance indexes
- Created migration `20260515230000_phase_4_safety_flha.sql`:
  - Tables: `flha_sessions`, `flha_session_hazards`, `flha_session_controls`, `flha_session_crew`, `flha_signatures`
  - Indexes on job_id, session_date, reviewed_by, hazard_type, control_type, employee_id
  - RLS policies: read all, insert/update/delete with anon/authenticated
  - Updated_at triggers on sessions + signatures
- Created helpers in `lib/supabase/safety.ts`:
  - `createFlhaSession()` - batch insert session + hazards + controls + crew (parallel)
  - `getJobSessions()` - paginated (50/100 per page for performance)
  - `getTodaySession()` - quick lookup for current day
  - `addSignatureToSession()` - replace per-worker signature
  - `markSessionReviewed()` - supervisor approval
  - `updateFlhaSession()` - edit existing (replace hazards/controls)
  - `deleteFlhaSession()` - cascades to all related rows
- Created API endpoints with caching headers:
  - GET /api/safety/sessions (paginated, 30s cache)
  - POST /api/safety/sessions (create session)
  - GET /api/safety/sessions/by-job/[jobId] (per-job list + today lookup)
  - PUT /api/safety/sessions/[sessionId] (update)
  - DELETE /api/safety/sessions/[sessionId] (delete)
  - POST /api/safety/sessions/[sessionId]/signatures (add signature)
  - POST /api/safety/sessions/[sessionId]/review (mark reviewed)
- Updated `useFlhaSessions` hook:
  - Fetch from `/api/safety/sessions` on mount
  - All operations (add, sign, review, delete) POST to APIs with localStorage fallback
  - Maintains async/await pattern for fast response
- Added seed data:
  - 1 FLHA session (Riverfront yesterday)
  - 4 hazards (Fall hazards, Working Alone, Mechanical, Unsafe tools)
  - 4 controls (Hard hat, Fall protection, Additional Lighting, Stand by worker)
  - Crew: Mike, Jake, Tanya
  - 2 signatures (Mike, Jake both signed)
  - Session reviewed by Ben Sledge
  - All tagged: `is_seed_data=true`, `seed_batch=phase_4_safety_seed_2026_05_15`
- Phase 4 migration was created, pushed to the remote database, and wired into the app.

## Build Fixes for Vercel Deploy (2026-05-15)

Post-Phase 4 cleanup — resolving TypeScript build errors so production deploy works.

**Database type sync (CRITICAL):**
- `lib/supabase/types.ts` was missing all Phase 3 and Phase 4 tables. Every `.from("flha_*")` or `.from("active_shifts")` call failed TypeScript check.
- Added row types: `ActiveShiftRow`, `TimeEntryRow`, `FlhaSessionRow`, `FlhaSessionHazardRow`, `FlhaSessionControlRow`, `FlhaSessionCrewRow`, `FlhaSignatureRow`.
- Added Database table entries for all 7 new tables (Row/Insert/Update with `Partial<>` pattern).
- **Rule going forward:** updating `lib/supabase/types.ts` is part of the migration work, not a follow-up. Skipping means deferring errors to production build.

**Other build fixes:**
- Renamed dynamic route folders with literal backslashes: `app/api/safety/sessions/\[sessionId\]` → `[sessionId]`, `app/api/safety/sessions/by-job/\[jobId\]` → `[jobId]`. Filesystem-level fix.
- Job activity route handler (`app/api/jobs/[jobId]/activity/route.ts`) updated for Next.js 16 async params: `{ params }: { params: Promise<{ jobId: string }> }`.
- Removed `is_seed_data: false` from `JobInsertPayload` type and from `POST /api/jobs` insert payload — column has DB default, Supabase strict types reject excess properties.
- Cast hazards/controls in `rowToFlhaSession` (`lib/supabase/safety.ts`) to `FlhaHazard[]`/`FlhaControl[]` — DB returns generic `string`.
- Added supabase null check in `rowToFlhaSession` (parameter type is `SupabaseClient | null`).

**Component-level fix (relevant to future shadcn/base-ui work):**
- `components/ui/select.tsx` wrapped `Select` to filter null from `onValueChange` so all 8 callsites work as written. `@base-ui/react` v1.4.1 changed signature to `(value: string | null, ...)`.

**Result:** `npm run build` passes — all routes generate (static, SSG, dynamic). Vercel deploy unblocked.

## Supabase CLI Reconciliation (2026-05-16)

- Ran `npx supabase migration list`; all local migrations are present in remote migration history:
  - `20260515180000`
  - `20260515190000`
  - `20260515200000`
  - `20260515210000`
  - `20260515211000`
  - `20260515220000`
  - `20260515230000`
- Ran `npx supabase db push --dry-run`; CLI reported the remote database is up to date.
- Confirmed local migration files match the remote migration list through Phase 4.
- Confirmed that at reconciliation time, no Phase 5, Phase 6, or Phase 7 migration files existed yet.
- Corrected older status snapshots in this file that still described Sprint 2/Phase 2 as in progress and Phase 4 as pending.
- Verified `npm run build` passes after reconciliation.
- Added a guard in the Supabase job detail helper so legacy mock job IDs do not trigger UUID parse errors before falling back to the legacy lookup.

## Next Database Tasks

1. Phase 6: Documents/photos/signatures in Supabase Storage.
2. Phase 7: Supabase Auth and stricter role-based RLS.

### 2026-05-16 - Phase 5 Daily Reports Schema Drafted

- Created migration `supabase/migrations/20260516140000_phase_5_daily_reports.sql`.
- Added enums:
  - `daily_report_status`
  - `daily_report_safety_status`
  - `daily_report_weather_time`
- Added normalized snapshot tables:
  - `daily_reports`
  - `daily_report_sites`
  - `daily_report_employee_hours`
  - `daily_report_weather_snapshots`
  - `daily_report_signatures`
- Added indexes for report date, supervisor, site/job lookups, employee-hour reporting, weather site/time lookups, and seed cleanup.
- Added RLS policies and grants for anon/authenticated read/insert/update/delete, matching the pre-auth phased workflow.
- Added updated_at triggers for mutable report and signature tables.
- Updated `lib/supabase/types.ts` with Phase 5 table row types and Database table entries as part of the same phase.
- Added tagged Phase 5 seed rows to `supabase/seed.sql`: one signed aggregate report for yesterday, two site snapshots, per-site employee hours, weather snapshots, and a supervisor signature.
- Fixed the Phase 5 seed signature timestamp expression after Supabase SQL Editor rejected a concatenated date/time value.
- Fixed a pre-existing Phase 4 seed typo that referenced `flha_sessions.legacy_mock_id`, which does not exist.
- Verified `npm run build` passes after Phase 5 type updates.
- Verified `npx supabase db push --dry-run` detects exactly one pending migration: `20260516140000_phase_5_daily_reports.sql`.
- Project owner pushed Phase 5 migration with `npx supabase db push`.
- Verified `npx supabase migration list` shows `20260516140000` in both Local and Remote history.
- Project owner ran the Phase 5 seed block successfully in Supabase SQL Editor after the signature timestamp fix.
- Verified Phase 5 row counts in Supabase SQL Editor: reports/sites/employee-hours/weather/signatures = 1/2/2/6/1.
- Follow-up seed validation showed Phase 3 rows present but Phase 4 FLHA seed rows missing; updated `supabase/seed.sql` so Phase 4 FLHA parent seed updates on `(job_id, session_date)` conflicts instead of doing nothing.
- Replaced remaining Phase 3/4 date-time concatenation expressions in `supabase/seed.sql` with date + `TIME` arithmetic so manual SQL Editor reruns are safe.
- Project owner reran the Phase 4 seed block and verified FLHA row counts in Supabase SQL Editor: sessions/hazards/controls/crew/signatures = 1/4/4/3/2.
- Added `lib/supabase/daily-reports.ts` to map normalized Supabase rows into existing aggregate Daily Reports UI types and save signed snapshots back to Supabase.
- Added `/api/daily-reports` GET/POST route for reading and upserting aggregate daily reports.
- Updated `useDailyAggregateReports` to fetch/save through the API with localStorage fallback if Supabase is unavailable.
- Updated Daily Reports save flow to await the persisted report before expanding the saved row.
- Verified `npm run build` passes after Phase 5 app wiring.
- Phase 5 Daily Reports app wiring is complete; next SQL focus is Phase 6 Storage.

---

## UI & Component Overhaul Session (2026-05-15)

Working on app-wide UI consistency: fonts, spacing, container styling, and dropdown behavior.

**Sidebar Navigation:**
- Increased icon vertical gap from 0 to `gap-2` for breathing room.

**Job Detail Tabs (jobs/[id]/page.tsx):**
- Font: `text-base` → `text-lg` (larger tab labels).
- Layout: `justify-center` → `justify-between` (even distribution across top bar).
- Width: TabsList now `w-full` to span full width.

**Jobs List Counter Badge (jobs/jobs-view.tsx):**
- Font: added `text-base`.
- Shape: `rounded-lg` → `rounded-md` (less pill-shaped).
- Padding: added `px-4 py-2` (larger visual weight).

**Filter Buttons & Table Headers (jobs/jobs-view.tsx):**
- Filter label: `text-sm` → `text-base`.
- Filter buttons: padding `px-3 py-1.5` → `px-4 py-2`, font `text-xs` → `text-sm`.
- Table headers: height `h-11` → `h-12`, font `text-sm` → `text-base`.

**Admin Page Role Badges (dashboard/admin/page.tsx):**
- Added `rounded-md px-3 py-1.5` for consistent rectangular shape with padding.
- Icon: `h-3 w-3` → `h-4 w-4`.
- Font: `text-[10px]` → `text-xs`.

**Time Tracking Stat Cards (time/time-page-client.tsx):**
- Added `unit` prop to display measurement labels (active, h, pending, request).
- Stat value: number in `text-5xl`, unit in `text-lg`.
- Icon: repositioned to top-right corner using `absolute top-4 right-4`.
- Icon size: `h-6 w-6`.
- Title: `text-xs` → `text-sm`.
- Helper text: `text-xs` → `text-base`.

**Dropdown Accessibility Fix (components/ui/card.tsx + time/time-page-client.tsx):**
- **Root Cause:** Card component had `overflow-hidden` which clipped dropdown menus, forcing browser to reposition them at card top.
- **Fix:** Removed `overflow-hidden` from Card className to allow dropdowns to render below select triggers.
- **Replacement:** Replaced native `<select>` (NativeSelect component) with shadcn `Select` component.
  - Removed NativeSelect function definition.
  - Updated all 8 select usages (Clock In, Manual Entry, Split Shift, Time Off) to use shadcn Select API.
  - Styling: `SelectTrigger` with `min-h-11 w-full bg-background px-3`, `SelectContent` with `z-[60]` for proper stacking.
  - Dropdowns now position correctly below the trigger element.

**Summary:**
- 15+ UI/UX improvements across 6 components.
- 2 structural fixes (Card overflow, dropdown replacement).
- Consistent sizing, spacing, and shape language applied across the app.
