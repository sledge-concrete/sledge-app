insert into public.employees (
  legacy_mock_id,
  name,
  role,
  email,
  initials,
  is_seed_data,
  seed_batch
)
values
  ('u-ben', 'Ben Sledge', 'admin', 'ben@sledge.co', 'BS', true, 'phase_1_core_seed_2026_05_15'),
  ('u-sarah', 'Sarah Holm', 'supervisor', 'sarah@sledge.co', 'SH', true, 'phase_1_core_seed_2026_05_15'),
  ('u-mike', 'Mike Doran', 'employee', 'mike@sledge.co', 'MD', true, 'phase_1_core_seed_2026_05_15'),
  ('u-jake', 'Jake Reilly', 'employee', 'jake@sledge.co', 'JR', true, 'phase_1_core_seed_2026_05_15'),
  ('u-tanya', 'Tanya Webb', 'employee', 'tanya@sledge.co', 'TW', true, 'phase_1_core_seed_2026_05_15')
on conflict (legacy_mock_id) do update set
  name = excluded.name,
  role = excluded.role,
  email = excluded.email,
  initials = excluded.initials,
  is_seed_data = excluded.is_seed_data,
  seed_batch = excluded.seed_batch;

insert into public.jobs (
  legacy_mock_id,
  name,
  job_number,
  client_name,
  address,
  status,
  start_date,
  end_date,
  supervisor_employee_id,
  hours_logged,
  latitude,
  longitude,
  service_type,
  notes,
  is_seed_data,
  seed_batch
)
values
  (
    'job-riverfront',
    'Riverfront Commercial Build',
    'SC-2026-014',
    'Northgate Holdings',
    '1820 Riverfront Dr, Calgary, AB',
    'active',
    '2026-04-12',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    412,
    51.0421,
    -114.0533,
    'Foundation & Structural',
    'Large commercial foundation pour. Weather delays possible due to April conditions. Client requests weekly progress photos.',
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-maple',
    'Maple Street Residential',
    'SC-2026-018',
    'Holm Family',
    '44 Maple St, Calgary, AB',
    'active',
    '2026-04-28',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    96,
    51.0586,
    -114.0708,
    'Driveway & Patio',
    'Residential driveway replacement. Homeowners need driveway access for parking by May 15.',
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-hwy2',
    'Highway 2 Retaining Wall',
    'SC-2026-009',
    'AB Transportation',
    'Hwy 2 km 14, Airdrie, AB',
    'hold',
    '2026-03-02',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    184,
    51.2917,
    -114.0144,
    'Retaining Wall & Excavation',
    'Highway infrastructure project. Traffic control in place. Awaiting geotechnical assessment.',
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-eastside',
    'Eastside Warehouse Slab',
    'SC-2026-021',
    'BlueLine Logistics',
    '2200 32 Ave NE, Calgary, AB',
    'active',
    '2026-04-20',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    240,
    51.0884,
    -113.9842,
    'Warehouse Floor',
    'Large industrial warehouse concrete floor. Multiple pours planned over 3 weeks.',
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-glenmore',
    'Glenmore Sidewalk Replacement',
    'SC-2025-098',
    'City of Calgary',
    'Glenmore Trail SW, Calgary, AB',
    'completed',
    '2025-09-15',
    '2025-11-22',
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    612,
    50.9928,
    -114.1064,
    'Sidewalk & Path',
    'Municipal sidewalk repair completed ahead of schedule.',
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-okotoks',
    'Okotoks Foundation Pour',
    'SC-2025-104',
    'Stonebridge Homes',
    '85 Westridge Dr, Okotoks, AB',
    'completed',
    '2025-10-04',
    '2025-12-10',
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    488,
    50.7256,
    -113.9756,
    'Residential Foundation',
    'New home foundation completed. House framing started.',
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-sundre-plaza',
    'Sundre Town Plaza Expansion',
    'SC-2026-031',
    'Sundre Municipal',
    'Main St, Sundre, AB',
    'active',
    '2026-04-01',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    156,
    52.1289,
    -114.8689,
    'Municipal Plaza',
    null,
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-carstairs-driveway',
    'Carstairs Residential Driveway',
    'SC-2026-027',
    'Peterson Family',
    '1245 Railway Ave, Carstairs, AB',
    'active',
    '2026-05-02',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    72,
    51.6523,
    -114.0934,
    'Driveway & Patio',
    null,
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-olds-foundation',
    'Olds Commercial Foundation',
    'SC-2026-025',
    'Olds Business Corp',
    'Highway 27, Olds, AB',
    'active',
    '2026-04-15',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    328,
    51.7987,
    -114.2891,
    'Commercial Foundation',
    null,
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-didsbury-parking',
    'Didsbury Parking Lot',
    'SC-2026-029',
    'Didsbury County',
    '20 Ave, Didsbury, AB',
    'hold',
    '2026-03-20',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    144,
    51.9834,
    -114.2634,
    'Parking Lot',
    null,
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-cremona-slab',
    'Cremona Farm Concrete Slab',
    'SC-2026-033',
    'Rocky Mountain Farms',
    'Range Rd 40, Cremona, AB',
    'active',
    '2026-04-25',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    88,
    52.0412,
    -113.9876,
    'Agricultural Slab',
    null,
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-dogpound-pad',
    'Dog Pound Shed Pad',
    'SC-2026-026',
    'Dog Pound Equestrian',
    'Township Rd 300, Dog Pound, AB',
    'completed',
    '2026-02-10',
    '2026-03-15',
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    264,
    51.8267,
    -113.9854,
    'Agricultural Slab',
    null,
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-sundre-municipal',
    'Sundre Municipal Building Slab',
    'SC-2026-035',
    'Town of Sundre',
    'Centre St, Sundre, AB',
    'hold',
    '2026-03-10',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    216,
    52.1401,
    -114.8734,
    'Municipal Building',
    null,
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-carstairs-sidewalk',
    'Carstairs Sidewalk Repair',
    'SC-2025-099',
    'Carstairs MD',
    'Station Rd, Carstairs, AB',
    'completed',
    '2025-11-01',
    '2025-12-20',
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    320,
    51.6589,
    -114.0878,
    'Sidewalk & Path',
    null,
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-olds-warehouse',
    'Olds Industrial Warehouse Pour',
    'SC-2026-032',
    'Progressive Industries',
    'Industrial Park, Olds, AB',
    'active',
    '2026-04-08',
    null,
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    264,
    51.8045,
    -114.2756,
    'Warehouse Floor',
    null,
    true,
    'phase_1_core_seed_2026_05_15'
  ),
  (
    'job-didsbury-residential',
    'Didsbury Residential Complex',
    'SC-2026-028',
    'Didsbury Developments',
    '10 St, Didsbury, AB',
    'completed',
    '2025-12-01',
    '2026-02-28',
    (select id from public.employees where legacy_mock_id = 'u-sarah'),
    512,
    51.9756,
    -114.2567,
    'Residential Complex',
    null,
    true,
    'phase_1_core_seed_2026_05_15'
  )
on conflict (legacy_mock_id) do update set
  name = excluded.name,
  job_number = excluded.job_number,
  client_name = excluded.client_name,
  address = excluded.address,
  status = excluded.status,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  supervisor_employee_id = excluded.supervisor_employee_id,
  hours_logged = excluded.hours_logged,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  service_type = excluded.service_type,
  notes = excluded.notes,
  is_seed_data = excluded.is_seed_data,
  seed_batch = excluded.seed_batch;

insert into public.job_crew (
  job_id,
  employee_id,
  role_on_job,
  is_seed_data,
  seed_batch
)
select
  j.id,
  e.id,
  'crew',
  true,
  'phase_1_core_seed_2026_05_15'
from (
  values
    ('job-riverfront', 'u-mike'),
    ('job-riverfront', 'u-jake'),
    ('job-riverfront', 'u-tanya'),
    ('job-maple', 'u-mike'),
    ('job-maple', 'u-jake'),
    ('job-hwy2', 'u-tanya'),
    ('job-eastside', 'u-mike'),
    ('job-glenmore', 'u-jake'),
    ('job-glenmore', 'u-tanya'),
    ('job-okotoks', 'u-mike'),
    ('job-okotoks', 'u-jake'),
    ('job-sundre-plaza', 'u-mike'),
    ('job-sundre-plaza', 'u-tanya'),
    ('job-carstairs-driveway', 'u-jake'),
    ('job-olds-foundation', 'u-mike'),
    ('job-olds-foundation', 'u-jake'),
    ('job-olds-foundation', 'u-tanya'),
    ('job-didsbury-parking', 'u-mike'),
    ('job-cremona-slab', 'u-tanya'),
    ('job-dogpound-pad', 'u-jake'),
    ('job-dogpound-pad', 'u-tanya'),
    ('job-sundre-municipal', 'u-mike'),
    ('job-sundre-municipal', 'u-jake'),
    ('job-carstairs-sidewalk', 'u-tanya'),
    ('job-olds-warehouse', 'u-mike'),
    ('job-olds-warehouse', 'u-jake'),
    ('job-didsbury-residential', 'u-mike'),
    ('job-didsbury-residential', 'u-tanya')
) as crew(legacy_job_id, legacy_employee_id)
join public.jobs j on j.legacy_mock_id = crew.legacy_job_id
join public.employees e on e.legacy_mock_id = crew.legacy_employee_id
on conflict (job_id, employee_id) do update set
  role_on_job = excluded.role_on_job,
  is_seed_data = excluded.is_seed_data,
  seed_batch = excluded.seed_batch;

insert into public.job_activity (
  legacy_mock_id,
  job_id,
  activity_type,
  actor_employee_id,
  occurred_at,
  detail,
  is_seed_data,
  seed_batch
)
select
  activity.legacy_mock_id,
  j.id,
  activity.activity_type::public.job_activity_type,
  e.id,
  activity.occurred_at::timestamptz,
  activity.detail,
  true,
  'phase_1_core_seed_2026_05_15'
from (
  values
    ('a-1', 'job-riverfront', 'clock-in', 'u-mike', '2026-05-07T07:02:00Z', 'Clocked in'),
    ('a-2', 'job-riverfront', 'note', 'u-sarah', '2026-05-06T16:30:00Z', 'Weather delays expected tomorrow due to rain forecast. May need to reschedule concrete pour to next week.'),
    ('a-3', 'job-riverfront', 'upload', 'u-mike', '2026-05-04T16:11:00Z', 'Uploaded pour-day-east.jpg'),
    ('a-4', 'job-riverfront', 'sign-off', 'u-sarah', '2026-05-04T07:30:00Z', 'Daily safety sign-off'),
    ('a-5', 'job-riverfront', 'note', 'u-mike', '2026-05-03T15:45:00Z', 'East footing excavation complete. Ready for rebar placement on Monday.'),
    ('a-6', 'job-riverfront', 'note', 'u-jake', '2026-05-02T14:20:00Z', 'Materials delivered: 50 cu yards of ready-mix concrete. Stored at site north corner.'),
    ('a-7', 'job-riverfront', 'note', 'u-sarah', '2026-04-30T10:15:00Z', 'Client site walk-through completed. Approved foundation layout. No changes needed.'),
    ('a-4', 'job-maple', 'note', 'u-sarah', '2026-05-06T14:00:00Z', 'Foundation inspection scheduled'),
    ('a-5', 'job-hwy2', 'clock-out', 'u-tanya', '2026-04-20T17:00:00Z', 'Clocked out')
) as activity(legacy_mock_id, legacy_job_id, activity_type, legacy_actor_id, occurred_at, detail)
join public.jobs j on j.legacy_mock_id = activity.legacy_job_id
left join public.employees e on e.legacy_mock_id = activity.legacy_actor_id
on conflict (job_id, legacy_mock_id) where legacy_mock_id is not null do update set
  activity_type = excluded.activity_type,
  actor_employee_id = excluded.actor_employee_id,
  occurred_at = excluded.occurred_at,
  detail = excluded.detail,
  is_seed_data = excluded.is_seed_data,
  seed_batch = excluded.seed_batch;

-- Phase 3: Time Tracking Seed Data
insert into public.active_shifts (
  employee_id,
  job_id,
  clock_in_at,
  is_seed_data,
  seed_batch
)
select
  e.id,
  j.id,
  (CURRENT_DATE || ' 07:15:00')::timestamptz,
  true,
  'phase_3_time_tracking_seed_2026_05_15'
from public.employees e
join public.jobs j on true
where e.legacy_mock_id = 'u-jake' and j.legacy_mock_id = 'job-carstairs-driveway'
on conflict do nothing;

insert into public.time_entries (
  employee_id,
  job_id,
  clock_in_at,
  clock_out_at,
  break_minutes,
  notes,
  source,
  status,
  submitted_at,
  reviewed_by,
  reviewed_at,
  is_seed_data,
  seed_batch
)
select
  e.id,
  j.id,
  entry.clock_in_at,
  entry.clock_out_at,
  entry.break_minutes,
  entry.notes,
  entry.source,
  entry.status,
  entry.submitted_at,
  reviewer.id,
  entry.reviewed_at,
  true,
  'phase_3_time_tracking_seed_2026_05_15'
from (
  values
    -- Mike: Riverfront today, clock source, pending
    ((CURRENT_DATE || ' 07:00:00')::timestamptz, (CURRENT_DATE || ' 15:30:00')::timestamptz, 30, 'Foundation prep and rebar staging.', 'clock', 'pending', (CURRENT_DATE || ' 16:30:00')::timestamptz, null, null, 'u-mike', 'job-riverfront'),
    -- Tanya: Eastside today, manual source, pending
    ((CURRENT_DATE || ' 06:45:00')::timestamptz, (CURRENT_DATE || ' 14:45:00')::timestamptz, 30, 'Warehouse slab finishing.', 'manual', 'pending', (CURRENT_DATE || ' 16:30:00')::timestamptz, null, null, 'u-tanya', 'job-eastside'),
    -- Mike: Riverfront yesterday AM, split source, approved
    ((CURRENT_DATE - INTERVAL '1 day' || ' 07:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '1 day' || ' 11:30:00')::timestamptz, 15, 'Morning pour setup.', 'split', 'approved', (CURRENT_DATE - INTERVAL '1 day' || ' 16:30:00')::timestamptz, (CURRENT_DATE - INTERVAL '1 day' || ' 17:05:00')::timestamptz, 'u-sarah', 'u-mike', 'job-riverfront'),
    -- Mike: Maple yesterday PM, split source, approved
    ((CURRENT_DATE - INTERVAL '1 day' || ' 12:15:00')::timestamptz, (CURRENT_DATE - INTERVAL '1 day' || ' 16:45:00')::timestamptz, 0, 'Driveway forms and cleanup.', 'split', 'approved', (CURRENT_DATE - INTERVAL '1 day' || ' 16:30:00')::timestamptz, (CURRENT_DATE - INTERVAL '1 day' || ' 17:05:00')::timestamptz, 'u-sarah', 'u-mike', 'job-maple'),
    -- Jake: Carstairs 2 days ago, manual source, declined
    ((CURRENT_DATE - INTERVAL '2 days' || ' 07:30:00')::timestamptz, (CURRENT_DATE - INTERVAL '2 days' || ' 15:00:00')::timestamptz, 30, 'Base prep.', 'manual', 'declined', (CURRENT_DATE - INTERVAL '2 days' || ' 16:30:00')::timestamptz, (CURRENT_DATE - INTERVAL '2 days' || ' 17:05:00')::timestamptz, 'u-ben', 'u-jake', 'job-carstairs-driveway')
) as entry(clock_in_at, clock_out_at, break_minutes, notes, source, status, submitted_at, reviewed_at, reviewed_by_legacy, employee_legacy_id, job_legacy_id)
join public.employees e on e.legacy_mock_id = entry.employee_legacy_id
join public.jobs j on j.legacy_mock_id = entry.job_legacy_id
left join public.employees reviewer on reviewer.legacy_mock_id = entry.reviewed_by_legacy
on conflict do nothing;

-- Phase 4: Safety/FLHA Seed Data
insert into public.flha_sessions (
  job_id, session_date, filled_by, work_location, sr_number, job_description,
  supervisor_name, supervisor_phone, other_hazards, other_controls, comments,
  reviewed_by, reviewed_at, is_seed_data, seed_batch
)
select
  j.id,
  (CURRENT_DATE - INTERVAL '1 day')::date,
  'Sarah Holm',
  'Riverfront Commercial Build - Foundation Area',
  'SC-2026-014',
  'Foundation excavation and rebar placement',
  'Sarah Holm',
  '403-555-0184',
  ARRAY['Uneven ground surface', 'Heavy equipment on site', '']::text[],
  'Site supervisor present at all times',
  'Weather was clear. All hazards identified and controls in place.',
  'Ben Sledge',
  (CURRENT_DATE - INTERVAL '1 day' || ' 16:30:00')::timestamptz,
  true,
  'phase_4_safety_seed_2026_05_15'
from public.jobs j
where j.legacy_mock_id = 'job-riverfront'
on conflict (job_id, session_date) do nothing;

insert into public.flha_session_hazards (session_id, hazard_type)
select
  s.id,
  hazard_type
from public.flha_sessions s
cross join (
  values
    ('Fall hazards'),
    ('Working Alone'),
    ('Mechanical'),
    ('Unsafe tools/equipment')
) as hazards(hazard_type)
where s.is_seed_data = true and s.seed_batch = 'phase_4_safety_seed_2026_05_15'
  and s.session_date = (CURRENT_DATE - INTERVAL '1 day')::date
on conflict do nothing;

insert into public.flha_session_controls (session_id, control_type)
select
  s.id,
  control_type
from public.flha_sessions s
cross join (
  values
    ('Hard hat'),
    ('Fall protection'),
    ('Additional Lighting'),
    ('Stand by worker')
) as controls(control_type)
where s.is_seed_data = true and s.seed_batch = 'phase_4_safety_seed_2026_05_15'
  and s.session_date = (CURRENT_DATE - INTERVAL '1 day')::date
on conflict do nothing;

insert into public.flha_session_crew (session_id, employee_id, employee_name)
select
  s.id,
  e.id,
  e.name
from public.flha_sessions s
join public.jobs j on s.job_id = j.id
join public.employees e on e.legacy_mock_id IN ('u-mike', 'u-jake', 'u-tanya')
where s.is_seed_data = true and s.seed_batch = 'phase_4_safety_seed_2026_05_15'
  and s.session_date = (CURRENT_DATE - INTERVAL '1 day')::date
on conflict do nothing;

insert into public.flha_signatures (session_id, employee_id, employee_name, signature_data, signed_at)
select
  s.id,
  e.id,
  e.name,
  'data:image/svg+xml;utf8,<svg xmlns=''http://www.w3.org/2000/svg'' width=''420'' height=''120'' viewBox=''0 0 420 120''><path d=''M18 72 C55 20,94 104,132 54 S206 35,242 68 S318 87,390 38'' fill=''none'' stroke=''%231a1a1a'' stroke-width=''5'' stroke-linecap=''round''/><text x=''22'' y=''105'' font-size=''20'' fill=''%2352525b''>' || e.name || '</text></svg>',
  (CURRENT_DATE - INTERVAL '1 day' || ' 15:30:00')::timestamptz
from public.flha_sessions s
join public.employees e on e.legacy_mock_id IN ('u-mike', 'u-jake')
where s.is_seed_data = true and s.seed_batch = 'phase_4_safety_seed_2026_05_15'
  and s.session_date = (CURRENT_DATE - INTERVAL '1 day')::date
on conflict do nothing;

-- Phase 5: Daily Reports Seed Data
insert into public.daily_reports (
  legacy_mock_id,
  report_date,
  status,
  supervisor_employee_id,
  supervisor_name,
  total_hours,
  site_count,
  employee_count,
  overall_progress_summary,
  is_seed_data,
  seed_batch
)
select
  'daily-aggregate-yesterday',
  (CURRENT_DATE - INTERVAL '1 day')::date,
  'signed',
  supervisor.id,
  supervisor.name,
  8.75,
  2,
  1,
  'Riverfront morning pour setup and Maple Street driveway forms were completed from split-shift time entries.',
  true,
  'phase_5_daily_reports_seed_2026_05_16'
from public.employees supervisor
where supervisor.legacy_mock_id = 'u-sarah'
on conflict (report_date) do update set
  legacy_mock_id = excluded.legacy_mock_id,
  status = excluded.status,
  supervisor_employee_id = excluded.supervisor_employee_id,
  supervisor_name = excluded.supervisor_name,
  total_hours = excluded.total_hours,
  site_count = excluded.site_count,
  employee_count = excluded.employee_count,
  overall_progress_summary = excluded.overall_progress_summary,
  is_seed_data = excluded.is_seed_data,
  seed_batch = excluded.seed_batch;

insert into public.daily_report_sites (
  report_id,
  job_id,
  legacy_job_id,
  job_name,
  project_number,
  company,
  address,
  total_hours,
  employee_count,
  progress_summary,
  safety_session_id,
  safety_status,
  safety_signatures,
  hazards_identified,
  controls_implemented,
  incidents,
  near_misses
)
select
  report.id,
  job.id,
  site.legacy_job_id,
  job.name,
  job.job_number,
  job.client_name,
  job.address,
  site.total_hours,
  1,
  site.progress_summary,
  safety.id,
  site.safety_status::public.daily_report_safety_status,
  site.safety_signatures,
  site.hazards_identified,
  site.controls_implemented,
  0,
  0
from public.daily_reports report
join (
  values
    ('job-riverfront', 4.25, 'Morning pour setup completed and Riverfront safety sign-off reviewed.', 'complete', 2, 4, 4),
    ('job-maple', 4.50, 'Driveway forms and cleanup completed for Maple Street Residential.', 'none', 0, 0, 0)
) as site(legacy_job_id, total_hours, progress_summary, safety_status, safety_signatures, hazards_identified, controls_implemented) on true
join public.jobs job on job.legacy_mock_id = site.legacy_job_id
left join public.flha_sessions safety on safety.job_id = job.id
  and safety.session_date = report.report_date
where report.legacy_mock_id = 'daily-aggregate-yesterday'
on conflict (report_id, job_id) do update set
  legacy_job_id = excluded.legacy_job_id,
  job_name = excluded.job_name,
  project_number = excluded.project_number,
  company = excluded.company,
  address = excluded.address,
  total_hours = excluded.total_hours,
  employee_count = excluded.employee_count,
  progress_summary = excluded.progress_summary,
  safety_session_id = excluded.safety_session_id,
  safety_status = excluded.safety_status,
  safety_signatures = excluded.safety_signatures,
  hazards_identified = excluded.hazards_identified,
  controls_implemented = excluded.controls_implemented,
  incidents = excluded.incidents,
  near_misses = excluded.near_misses;

insert into public.daily_report_employee_hours (
  report_id,
  site_id,
  job_id,
  employee_id,
  legacy_employee_id,
  employee_name,
  employee_role,
  hours_worked
)
select
  report.id,
  report_site.id,
  job.id,
  employee.id,
  employee.legacy_mock_id,
  employee.name,
  employee.role,
  site_hours.hours_worked
from public.daily_reports report
join public.daily_report_sites report_site on report_site.report_id = report.id
join public.jobs job on job.id = report_site.job_id
join (
  values
    ('job-riverfront', 'u-mike', 4.25),
    ('job-maple', 'u-mike', 4.50)
) as site_hours(legacy_job_id, legacy_employee_id, hours_worked) on site_hours.legacy_job_id = job.legacy_mock_id
join public.employees employee on employee.legacy_mock_id = site_hours.legacy_employee_id
where report.legacy_mock_id = 'daily-aggregate-yesterday'
on conflict (report_id, site_id, employee_id) do update set
  job_id = excluded.job_id,
  legacy_employee_id = excluded.legacy_employee_id,
  employee_name = excluded.employee_name,
  employee_role = excluded.employee_role,
  hours_worked = excluded.hours_worked;

insert into public.daily_report_weather_snapshots (
  report_id,
  site_id,
  job_id,
  snapshot_time,
  temp,
  precip,
  wind,
  humidity
)
select
  report.id,
  report_site.id,
  report_site.job_id,
  weather.snapshot_time::public.daily_report_weather_time,
  weather.temp,
  weather.precip,
  weather.wind,
  weather.humidity
from public.daily_reports report
join public.daily_report_sites report_site on report_site.report_id = report.id
join (
  values
    ('08:00', 10, 0, 8, 70),
    ('12:00', 16, 0, 10, 60),
    ('17:00', 13, 0, 9, 68)
) as weather(snapshot_time, temp, precip, wind, humidity) on true
where report.legacy_mock_id = 'daily-aggregate-yesterday'
on conflict (site_id, snapshot_time) do update set
  temp = excluded.temp,
  precip = excluded.precip,
  wind = excluded.wind,
  humidity = excluded.humidity;

insert into public.daily_report_signatures (
  report_id,
  signer_employee_id,
  printed_name,
  signature_data,
  signed_at,
  signature_date
)
select
  report.id,
  supervisor.id,
  supervisor.name,
  'data:image/svg+xml;utf8,<svg xmlns=''http://www.w3.org/2000/svg'' width=''420'' height=''120'' viewBox=''0 0 420 120''><path d=''M24 76 C62 30,96 104,138 56 S212 34,252 70 S318 90,390 42'' fill=''none'' stroke=''%231a1a1a'' stroke-width=''5'' stroke-linecap=''round''/><text x=''22'' y=''105'' font-size=''20'' fill=''%2352525b''>' || supervisor.name || '</text></svg>',
  ((CURRENT_DATE - INTERVAL '1 day')::date + TIME '18:00:00')::timestamptz,
  (CURRENT_DATE - INTERVAL '1 day')::date
from public.daily_reports report
join public.employees supervisor on supervisor.legacy_mock_id = 'u-sarah'
where report.legacy_mock_id = 'daily-aggregate-yesterday'
on conflict (report_id) do update set
  signer_employee_id = excluded.signer_employee_id,
  printed_name = excluded.printed_name,
  signature_data = excluded.signature_data,
  signed_at = excluded.signed_at,
  signature_date = excluded.signature_date;
