alter table public.employees enable row level security;
alter table public.jobs enable row level security;
alter table public.job_crew enable row level security;
alter table public.job_activity enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.employees to anon, authenticated;
grant select on public.jobs to anon, authenticated;
grant select on public.job_crew to anon, authenticated;
grant select on public.job_activity to anon, authenticated;
create or replace view public.jobs_list_view as
select
  j.id,
  j.legacy_mock_id,
  j.name,
  j.job_number,
  j.client_name,
  j.address,
  j.status,
  j.start_date,
  j.end_date,
  j.supervisor_employee_id,
  j.hours_logged,
  (
    select count(distinct worker.employee_id)::integer
    from (
      select j.supervisor_employee_id as employee_id
      where j.supervisor_employee_id is not null
      union all
      select jc.employee_id
      from public.job_crew jc
      where jc.job_id = j.id
    ) worker
  ) as worker_count,
  j.latitude,
  j.longitude,
  j.service_type,
  j.notes,
  j.is_seed_data,
  j.seed_batch,
  j.created_at,
  j.updated_at,
  supervisor.legacy_mock_id as supervisor_legacy_mock_id,
  coalesce(
    (
      select array_agg(crew_employee.legacy_mock_id order by crew_employee.name)
      from public.job_crew jc
      join public.employees crew_employee on crew_employee.id = jc.employee_id
      where jc.job_id = j.id
    ),
    array[]::text[]
  ) as crew_legacy_mock_ids
from public.jobs j
left join public.employees supervisor on supervisor.id = j.supervisor_employee_id;

alter view public.jobs_list_view set (security_invoker = true);
grant select on public.jobs_list_view to anon, authenticated;

drop policy if exists "phase_2_public_read_employees" on public.employees;
create policy "phase_2_public_read_employees"
on public.employees
for select
to anon, authenticated
using (true);

drop policy if exists "phase_2_public_read_jobs" on public.jobs;
create policy "phase_2_public_read_jobs"
on public.jobs
for select
to anon, authenticated
using (true);

drop policy if exists "phase_2_public_read_job_crew" on public.job_crew;
create policy "phase_2_public_read_job_crew"
on public.job_crew
for select
to anon, authenticated
using (true);

drop policy if exists "phase_2_public_read_job_activity" on public.job_activity;
create policy "phase_2_public_read_job_activity"
on public.job_activity
for select
to anon, authenticated
using (true);
