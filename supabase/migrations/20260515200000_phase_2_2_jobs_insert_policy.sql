-- Phase 2.2: Jobs insert policy
-- Grants INSERT on the jobs table to anon and authenticated roles.
-- Full role-based RLS will be enforced in Phase 7 (Auth).

grant insert on public.jobs to anon, authenticated;

create policy "jobs_insert_anon"
  on public.jobs
  for insert
  to anon, authenticated
  with check (true);
