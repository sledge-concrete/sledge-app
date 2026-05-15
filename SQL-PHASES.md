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
- Sprint 2 in progress: Jobs/Sites read path.
- Complete in Sprint 2:
  - Jobs list read migration and RLS policies.
  - `/api/jobs` Supabase read wiring.
  - Jobs list UI verified against Supabase data.
  - Job Detail Supabase read helper.
  - Job Detail page Supabase read wiring for job, supervisor, crew, employees, and activity.
- Pending in Sprint 2:
  - Create Site insert path.
  - Job activity insert path.
  - Documents/photos migration to Storage, likely later in Phase 6 unless needed sooner.

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

Status: In progress

Candidate database work:

- Job list/query migration. Complete.
- Job detail query migration. Complete for reads.
- Create Site insert path.
- Job activity insert/read path.

### Phase 3 - Time Tracking

Goal: replace browser `localStorage` time tracking persistence with Supabase tables.

Status: Pending

Candidate tables:

- `active_shifts`
- `time_entries`
- `time_off_requests`

### Phase 4 - Safety / FLHA

Goal: replace browser `localStorage` FLHA persistence with Supabase tables.

Status: Pending

Candidate tables:

- `flha_sessions`
- `flha_signatures`
- `flha_session_hazards`
- `flha_session_controls`

### Phase 5 - Daily Reports

Goal: store signed daily reports as database snapshots generated from time, safety, jobs, weather, and signatures.

Status: Pending

Candidate tables:

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

## Next Database Tasks

1. Add a cleanup/testing query for seed data by `seed_batch` before production planning.
2. Job activity insert path.
3. Decide whether activity notes are enough or if documents/photos Storage work should happen first.
