create extension if not exists "pgcrypto" with schema "extensions";

create type public.employee_role as enum ('admin', 'supervisor', 'employee', 'tablet');
create type public.job_status as enum ('active', 'hold', 'completed');
create type public.job_activity_type as enum ('clock-in', 'clock-out', 'upload', 'note', 'sign-off');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  legacy_mock_id text unique,
  name text not null,
  role public.employee_role not null,
  email text not null unique,
  initials text not null,
  is_active boolean not null default true,
  is_seed_data boolean not null default false,
  seed_batch text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employees_seed_batch_required check (
    (is_seed_data = false and seed_batch is null)
    or (is_seed_data = true and seed_batch is not null)
  )
);

create trigger employees_set_updated_at
before update on public.employees
for each row
execute function public.set_updated_at();

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  legacy_mock_id text unique,
  name text not null,
  job_number text not null unique,
  client_name text not null,
  address text not null,
  status public.job_status not null default 'active',
  start_date date not null,
  end_date date,
  supervisor_employee_id uuid references public.employees(id) on delete set null,
  hours_logged numeric(10, 2) not null default 0 check (hours_logged >= 0),
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  service_type text,
  notes text,
  is_seed_data boolean not null default false,
  seed_batch text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_date_order check (end_date is null or end_date >= start_date),
  constraint jobs_seed_batch_required check (
    (is_seed_data = false and seed_batch is null)
    or (is_seed_data = true and seed_batch is not null)
  )
);

create index jobs_status_idx on public.jobs(status);
create index jobs_supervisor_employee_id_idx on public.jobs(supervisor_employee_id);
create index jobs_seed_batch_idx on public.jobs(seed_batch) where is_seed_data = true;

create trigger jobs_set_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

create table public.job_crew (
  job_id uuid not null references public.jobs(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  role_on_job text not null default 'crew',
  is_seed_data boolean not null default false,
  seed_batch text,
  created_at timestamptz not null default now(),
  primary key (job_id, employee_id),
  constraint job_crew_seed_batch_required check (
    (is_seed_data = false and seed_batch is null)
    or (is_seed_data = true and seed_batch is not null)
  )
);

create index job_crew_employee_id_idx on public.job_crew(employee_id);
create index job_crew_seed_batch_idx on public.job_crew(seed_batch) where is_seed_data = true;

create table public.job_activity (
  id uuid primary key default gen_random_uuid(),
  legacy_mock_id text,
  job_id uuid not null references public.jobs(id) on delete cascade,
  activity_type public.job_activity_type not null,
  actor_employee_id uuid references public.employees(id) on delete set null,
  occurred_at timestamptz not null,
  detail text not null,
  is_seed_data boolean not null default false,
  seed_batch text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_activity_seed_batch_required check (
    (is_seed_data = false and seed_batch is null)
    or (is_seed_data = true and seed_batch is not null)
  )
);

create unique index job_activity_job_legacy_mock_id_idx
on public.job_activity(job_id, legacy_mock_id)
where legacy_mock_id is not null;

create index job_activity_job_occurred_at_idx on public.job_activity(job_id, occurred_at desc);
create index job_activity_actor_employee_id_idx on public.job_activity(actor_employee_id);
create index job_activity_seed_batch_idx on public.job_activity(seed_batch) where is_seed_data = true;

create trigger job_activity_set_updated_at
before update on public.job_activity
for each row
execute function public.set_updated_at();

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
  j.updated_at
from public.jobs j;
