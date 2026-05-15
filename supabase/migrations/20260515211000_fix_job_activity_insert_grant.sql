-- Fix Phase 2.3: Add missing GRANT for job_activity INSERT
-- The initial Phase 2.3 migration added the RLS policy but forgot the GRANT statement.

grant insert on public.job_activity to anon, authenticated;
