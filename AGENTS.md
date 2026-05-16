<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Operating Rules

- Keep changes surgical and directly related to the current task.
- Preserve existing structure, conventions, styles, and dependencies unless the user explicitly asks for a broader change.
- Ask before making assumptions that could change architecture, data ownership, auth, billing, or production behavior.
- Log meaningful progress in the relevant markdown file before considering a task complete.
- Never print, commit, or document real secrets, tokens, service-role keys, or environment variable values.
- Treat `.env.local` as local-only. It should contain `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for this phase, but never a service-role key.
- Use `rg` or `rg --files` for search when possible.
- Use `apply_patch` for manual file edits.
- Before changing Next.js App Router behavior, read the relevant docs in `node_modules/next/dist/docs/`.

## Supabase Migration Workflow

- The project is moving from hardcoded mock data to Supabase in phases.
- Database progress, schema decisions, migration status, and Supabase workflow live in `SQL-PHASES.md`.
- The user prefers a remote-first Supabase workflow and has chosen to skip Docker/local Supabase for now.
- The agent can create and edit migrations, seed files, app wiring, and docs.
- The user runs cloud Supabase commands when needed, especially `npx supabase db push`, and can run SQL manually in Supabase SQL Editor.
- SQL Editor is mainly for manual verification and seed execution. Migration files remain the source of truth for schema and policies.
- Auth is intentionally deferred until the last Supabase phase. Keep current mock user switching until then.
- Current database design uses UUID primary keys plus `legacy_mock_id` mapping so existing routes can keep working during migration.
- All test/mock database rows must be tagged with `is_seed_data` and `seed_batch` for future cleanup before production.
- Use normalized rows for long-term reporting data, especially safety/FLHA, daily reports, and time tracking.
- Signatures and uploaded files should move to Supabase Storage in a later phase, with SQL metadata.

## Current Supabase Status (as of 2026-05-15)

- Phase 0 Supabase project setup is complete.
- Phase 1 core tables complete: `employees`, `jobs`, `job_crew`, `job_activity` with seed data.
- Phase 2 COMPLETE:
  - Read policies on all Phase 1 tables (employees, jobs, job_crew, job_activity)
  - Jobs list reads from `jobs_list_view` via `/api/jobs` (newest first, mock fallback)
  - Job Detail reads job, supervisor, crew, employees, activity via Supabase helpers (mock fallback)
  - Create Site inserts via `POST /api/jobs` with auto-generated job numbers (SC-YYYY-NNN)
  - Job Activity notes insert via `POST /api/jobs/[jobId]/activity` with UUID/legacy ID resolution
- Phase 3 COMPLETE:
  - Tables: `active_shifts`, `time_entries` with normalized per-shift design
  - RLS policies for read/insert/update with anon/authenticated grants
  - Seed data: 1 active shift, 5 time entries (various sources/statuses) tagged for cleanup
  - Helper functions: clockIn, clockOut, addManualEntry, getTimeEntries, reviewTimeEntry
  - API endpoints: POST /api/time/clock-in, POST /api/time/clock-out, GET/POST /api/time/entries, GET /api/time
  - App wiring: useTimeTracking hook calls APIs with localStorage fallback
- Phase 4 COMPLETE:
  - Tables: `flha_sessions`, `flha_session_hazards`, `flha_session_controls`, `flha_session_crew`, `flha_signatures`
  - Normalized hazards/controls for reporting queries + performance indexes
  - Seed data: 1 session (Riverfront) with hazards, controls, crew, 2 signatures, reviewed
  - Helper functions: createFlhaSession, getJobSessions, getTodaySession, addSignatureToSession, markSessionReviewed, updateFlhaSession, deleteFlhaSession
  - API endpoints: GET/POST /api/safety/sessions, GET by-job, PUT/DELETE sessions, POST signatures/review
  - App wiring: useFlhaSessions hook calls APIs with localStorage fallback
- Build fixes for Vercel deploy COMPLETE (2026-05-15):
  - `lib/supabase/types.ts` Database type updated with all Phase 3 + Phase 4 tables (active_shifts, time_entries, flha_sessions + 4 normalized tables)
  - Renamed dynamic route folders with literal backslashes (`\[sessionId\]` → `[sessionId]`, `\[jobId\]` → `[jobId]`)
  - Job activity route handler updated to Next.js 16 async params signature
  - Removed `is_seed_data: false` from `JobInsertPayload` (DB default handles it)
  - `components/ui/select.tsx` wrapper now filters `null` from `onValueChange` (handles `@base-ui/react` v1.4.1 signature change at one place)
  - `npm run build` passes — production deploy unblocked
- Phase 5-7 pending (Daily Reports, Storage, Auth). See SQL-PHASES.md for details.

## Conventions Learned This Phase

- When adding new Supabase tables in any phase, update `lib/supabase/types.ts` Database type immediately. Skipping this defers TypeScript errors to production build.
- Next.js 16 App Router route handlers with dynamic segments require `params: Promise<T>` signature. Verify all existing routes when bumping Next.js.
- When creating dynamic route folders, verify with `ls` that brackets are literal (`[id]`) not escaped (`\[id\]`).
- For shadcn-style component wrappers (`components/ui/*.tsx`) over `@base-ui/react`, apply type-narrowing fixes (e.g. null filtering) at the wrapper level so callsites stay clean.
