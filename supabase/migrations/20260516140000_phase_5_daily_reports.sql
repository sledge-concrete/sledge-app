-- Phase 5: Daily Reports Snapshot Tables
-- Stores one signed aggregate report per date, with normalized site, employee-hour,
-- weather, safety, and signature rows for reporting queries.

CREATE TYPE public.daily_report_status AS ENUM ('pending', 'signed');
CREATE TYPE public.daily_report_safety_status AS ENUM ('none', 'started', 'complete');
CREATE TYPE public.daily_report_weather_time AS ENUM ('08:00', '12:00', '17:00');

CREATE TABLE public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_mock_id TEXT UNIQUE,
  report_date DATE NOT NULL UNIQUE,
  status public.daily_report_status NOT NULL DEFAULT 'signed',
  supervisor_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  supervisor_name VARCHAR NOT NULL,
  total_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  site_count INTEGER NOT NULL DEFAULT 0,
  employee_count INTEGER NOT NULL DEFAULT 0,
  overall_progress_summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN DEFAULT false,
  seed_batch TEXT
);

CREATE TABLE public.daily_report_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  legacy_job_id TEXT,
  job_name VARCHAR NOT NULL,
  project_number VARCHAR NOT NULL,
  company VARCHAR NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  total_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  employee_count INTEGER NOT NULL DEFAULT 0,
  progress_summary TEXT NOT NULL DEFAULT '',
  safety_session_id UUID REFERENCES public.flha_sessions(id) ON DELETE SET NULL,
  safety_status public.daily_report_safety_status NOT NULL DEFAULT 'none',
  safety_signatures INTEGER NOT NULL DEFAULT 0,
  hazards_identified INTEGER NOT NULL DEFAULT 0,
  controls_implemented INTEGER NOT NULL DEFAULT 0,
  incidents INTEGER NOT NULL DEFAULT 0,
  near_misses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(report_id, job_id)
);

CREATE TABLE public.daily_report_employee_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.daily_report_sites(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  legacy_employee_id TEXT,
  employee_name VARCHAR NOT NULL,
  employee_role VARCHAR NOT NULL,
  hours_worked NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(report_id, site_id, employee_id)
);

CREATE TABLE public.daily_report_weather_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.daily_report_sites(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  snapshot_time public.daily_report_weather_time NOT NULL,
  temp NUMERIC(5,2) NOT NULL,
  precip NUMERIC(6,2) NOT NULL,
  wind NUMERIC(6,2) NOT NULL,
  humidity NUMERIC(5,2) NOT NULL,
  override_temp NUMERIC(5,2),
  override_precip NUMERIC(6,2),
  override_wind NUMERIC(6,2),
  override_humidity NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, snapshot_time)
);

CREATE TABLE public.daily_report_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL UNIQUE REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  signer_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  printed_name VARCHAR NOT NULL,
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  signature_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_reports_report_date_desc ON public.daily_reports(report_date DESC);
CREATE INDEX idx_daily_reports_supervisor ON public.daily_reports(supervisor_employee_id);
CREATE INDEX idx_daily_reports_seed_cleanup ON public.daily_reports(is_seed_data, seed_batch);

CREATE INDEX idx_daily_report_sites_report_id ON public.daily_report_sites(report_id);
CREATE INDEX idx_daily_report_sites_job_id ON public.daily_report_sites(job_id);
CREATE INDEX idx_daily_report_sites_safety_status ON public.daily_report_sites(safety_status);

CREATE INDEX idx_daily_report_employee_hours_report_id ON public.daily_report_employee_hours(report_id);
CREATE INDEX idx_daily_report_employee_hours_site_id ON public.daily_report_employee_hours(site_id);
CREATE INDEX idx_daily_report_employee_hours_employee_id ON public.daily_report_employee_hours(employee_id);
CREATE INDEX idx_daily_report_employee_hours_job_id ON public.daily_report_employee_hours(job_id);

CREATE INDEX idx_daily_report_weather_report_id ON public.daily_report_weather_snapshots(report_id);
CREATE INDEX idx_daily_report_weather_site_time ON public.daily_report_weather_snapshots(site_id, snapshot_time);

CREATE INDEX idx_daily_report_signatures_report_id ON public.daily_report_signatures(report_id);
CREATE INDEX idx_daily_report_signatures_signer ON public.daily_report_signatures(signer_employee_id);

CREATE TRIGGER daily_reports_updated_at
  BEFORE UPDATE ON public.daily_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER daily_report_signatures_updated_at
  BEFORE UPDATE ON public.daily_report_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_employee_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_weather_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_reports_read" ON public.daily_reports
  FOR SELECT
  USING (true);

CREATE POLICY "daily_reports_insert" ON public.daily_reports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "daily_reports_update" ON public.daily_reports
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "daily_reports_delete" ON public.daily_reports
  FOR DELETE
  USING (true);

CREATE POLICY "daily_report_sites_read" ON public.daily_report_sites
  FOR SELECT
  USING (true);

CREATE POLICY "daily_report_sites_insert" ON public.daily_report_sites
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "daily_report_sites_update" ON public.daily_report_sites
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "daily_report_sites_delete" ON public.daily_report_sites
  FOR DELETE
  USING (true);

CREATE POLICY "daily_report_employee_hours_read" ON public.daily_report_employee_hours
  FOR SELECT
  USING (true);

CREATE POLICY "daily_report_employee_hours_insert" ON public.daily_report_employee_hours
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "daily_report_employee_hours_update" ON public.daily_report_employee_hours
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "daily_report_employee_hours_delete" ON public.daily_report_employee_hours
  FOR DELETE
  USING (true);

CREATE POLICY "daily_report_weather_snapshots_read" ON public.daily_report_weather_snapshots
  FOR SELECT
  USING (true);

CREATE POLICY "daily_report_weather_snapshots_insert" ON public.daily_report_weather_snapshots
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "daily_report_weather_snapshots_update" ON public.daily_report_weather_snapshots
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "daily_report_weather_snapshots_delete" ON public.daily_report_weather_snapshots
  FOR DELETE
  USING (true);

CREATE POLICY "daily_report_signatures_read" ON public.daily_report_signatures
  FOR SELECT
  USING (true);

CREATE POLICY "daily_report_signatures_insert" ON public.daily_report_signatures
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "daily_report_signatures_update" ON public.daily_report_signatures
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "daily_report_signatures_delete" ON public.daily_report_signatures
  FOR DELETE
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_reports TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_sites TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_employee_hours TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_weather_snapshots TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_signatures TO anon, authenticated;
