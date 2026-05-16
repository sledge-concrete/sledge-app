-- Phase 3: Time Tracking Tables
-- Replaces localStorage persistence for clock in/out, manual entries, and split shifts
-- Active shifts: one per employee (converted to TimeEntry on clock out)
-- Time entries: normalized one per shift, multiple per day allowed (split shifts)

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create active_shifts table
CREATE TABLE public.active_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  clock_in_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN DEFAULT false,
  seed_batch TEXT
);

-- Create time_entries table
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  clock_in_at TIMESTAMP NOT NULL,
  clock_out_at TIMESTAMP NOT NULL,
  break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  source VARCHAR(10) NOT NULL CHECK (source IN ('clock', 'manual', 'split')),
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  submitted_at TIMESTAMP NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN DEFAULT false,
  seed_batch TEXT
);

-- Indexes for common queries
CREATE INDEX idx_active_shifts_employee_id ON public.active_shifts(employee_id);
CREATE INDEX idx_active_shifts_job_id ON public.active_shifts(job_id);
CREATE INDEX idx_time_entries_employee_id ON public.time_entries(employee_id);
CREATE INDEX idx_time_entries_job_id ON public.time_entries(job_id);
CREATE INDEX idx_time_entries_status ON public.time_entries(status);
CREATE INDEX idx_time_entries_clock_in_at ON public.time_entries(clock_in_at DESC);
CREATE INDEX idx_time_entries_employee_date ON public.time_entries(employee_id, DATE(clock_in_at));

-- Updated_at trigger for time_entries
CREATE TRIGGER time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- Enable RLS
ALTER TABLE public.active_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Active Shifts RLS Policies
-- Employees can see their own active shift
CREATE POLICY "active_shifts_read_own" ON public.active_shifts
  FOR SELECT
  USING (auth.uid()::text = employee_id::text OR true); -- true = allow anon for now

-- Employees can create their own active shift (clock in)
CREATE POLICY "active_shifts_insert_own" ON public.active_shifts
  FOR INSERT
  WITH CHECK (true); -- anon/authenticated both allowed during phase 3

-- Employees can delete their own active shift (clock out)
CREATE POLICY "active_shifts_delete_own" ON public.active_shifts
  FOR DELETE
  USING (true); -- anon/authenticated both allowed during phase 3

-- Time Entries RLS Policies
-- Anyone can read time entries (public view for supervisor reviews)
CREATE POLICY "time_entries_read_all" ON public.time_entries
  FOR SELECT
  USING (true);

-- Employees can create time entries (manual, split, or auto-clock-out)
CREATE POLICY "time_entries_insert_own" ON public.time_entries
  FOR INSERT
  WITH CHECK (true); -- anon/authenticated both allowed during phase 3

-- Supervisors/admins can update status (review/approve/decline)
CREATE POLICY "time_entries_update_status" ON public.time_entries
  FOR UPDATE
  USING (true)
  WITH CHECK (true); -- anon/authenticated both allowed during phase 3

-- Grants
GRANT SELECT, INSERT, DELETE ON public.active_shifts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.time_entries TO anon, authenticated;
