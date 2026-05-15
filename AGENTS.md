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

## Current Supabase Status

- Phase 0 Supabase project setup is complete.
- Phase 1 core tables are complete: `employees`, `jobs`, `job_crew`, `job_activity`.
- Phase 1 seed data has been inserted and verified in the remote Supabase project.
- Phase 2 read policies are pushed and verified.
- Jobs list reads from `jobs_list_view` through `/api/jobs`, with mock fallback.
- Job Detail now reads job, supervisor, crew, employees, and activity from Supabase, with mock fallback.
- Create Site inserts, job activity writes, documents/photos storage, time tracking, safety, daily reports, and auth are still pending.
