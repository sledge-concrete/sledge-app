-- Phase 2.3: Job Activity Insert Policy
-- Grants INSERT on job_activity table to anon and authenticated roles.

grant insert on public.job_activity to anon, authenticated;

drop policy if exists "phase_2_3_insert_job_activity" on public.job_activity;
create policy "phase_2_3_insert_job_activity"
on public.job_activity
for insert
to anon, authenticated
with check (true);
