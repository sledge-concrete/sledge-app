-- Phase 3 Test Queries
-- Run these in Supabase SQL Editor after pushing migration and seed data
-- Verifies tables, indexes, RLS policies, and data

-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('active_shifts', 'time_entries')
ORDER BY table_name;

-- Count active shifts
SELECT COUNT(*) as active_shifts_count FROM public.active_shifts WHERE is_seed_data = true;

-- Count time entries
SELECT COUNT(*) as time_entries_count FROM public.time_entries WHERE is_seed_data = true;

-- List active shifts (currently clocked in)
SELECT
  s.id,
  e.full_name,
  j.job_number,
  s.clock_in_at
FROM public.active_shifts s
JOIN public.employees e ON s.employee_id = e.id
JOIN public.jobs j ON s.job_id = j.id
WHERE s.is_seed_data = true
ORDER BY s.clock_in_at DESC;

-- List time entries with reviewer info
SELECT
  t.id,
  e.full_name as employee,
  j.job_number,
  DATE(t.clock_in_at) as entry_date,
  TO_CHAR(t.clock_in_at, 'HH24:MI') as clock_in,
  TO_CHAR(t.clock_out_at, 'HH24:MI') as clock_out,
  t.break_minutes,
  t.source,
  t.status,
  r.full_name as reviewed_by
FROM public.time_entries t
JOIN public.employees e ON t.employee_id = e.id
JOIN public.jobs j ON t.job_id = j.id
LEFT JOIN public.employees r ON t.reviewed_by = r.id
WHERE t.is_seed_data = true
ORDER BY t.clock_in_at DESC;

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename IN ('active_shifts', 'time_entries')
ORDER BY indexname;

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('active_shifts', 'time_entries')
ORDER BY tablename;

-- Check policies
SELECT schemaname, tablename, policyname FROM pg_policies
WHERE tablename IN ('active_shifts', 'time_entries')
ORDER BY tablename, policyname;
