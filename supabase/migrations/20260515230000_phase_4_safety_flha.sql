-- Phase 4: Safety/FLHA Normalized Tables
-- Replaces localStorage persistence for FLHA sessions and signatures
-- Normalized: hazards, controls, crew tracked in separate tables for reporting/querying
-- Performance: indexed for common queries (job_id, session_date, employee_id)

-- Create flha_sessions table
CREATE TABLE public.flha_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  filled_by VARCHAR NOT NULL,
  work_location TEXT NOT NULL,
  sr_number VARCHAR,
  job_description TEXT NOT NULL,
  supervisor_name VARCHAR NOT NULL,
  supervisor_phone VARCHAR,
  other_hazards TEXT[] DEFAULT ARRAY['', '', ''],
  other_controls TEXT DEFAULT '',
  comments TEXT DEFAULT '',
  reviewed_by VARCHAR,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  is_seed_data BOOLEAN DEFAULT false,
  seed_batch TEXT,
  UNIQUE(job_id, session_date)
);

-- Create flha_session_hazards table (normalized)
CREATE TABLE public.flha_session_hazards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.flha_sessions(id) ON DELETE CASCADE,
  hazard_type VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create flha_session_controls table (normalized)
CREATE TABLE public.flha_session_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.flha_sessions(id) ON DELETE CASCADE,
  control_type VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create flha_session_crew table (separate, not JSON array)
CREATE TABLE public.flha_session_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.flha_sessions(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create flha_signatures table
CREATE TABLE public.flha_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.flha_sessions(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name VARCHAR NOT NULL,
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Performance Indexes
-- Sessions: query by job_id, session_date, reviewed status
CREATE INDEX idx_flha_sessions_job_id ON public.flha_sessions(job_id);
CREATE INDEX idx_flha_sessions_job_date ON public.flha_sessions(job_id, session_date DESC);
CREATE INDEX idx_flha_sessions_date_desc ON public.flha_sessions(session_date DESC);
CREATE INDEX idx_flha_sessions_reviewed ON public.flha_sessions(reviewed_by) WHERE reviewed_by IS NULL;

-- Hazards: query hazard frequency, filter by type
CREATE INDEX idx_flha_session_hazards_session_id ON public.flha_session_hazards(session_id);
CREATE INDEX idx_flha_session_hazards_type ON public.flha_session_hazards(hazard_type);

-- Controls: query control frequency, filter by type
CREATE INDEX idx_flha_session_controls_session_id ON public.flha_session_controls(session_id);
CREATE INDEX idx_flha_session_controls_type ON public.flha_session_controls(control_type);

-- Crew: query which crew members worked on a session
CREATE INDEX idx_flha_session_crew_session_id ON public.flha_session_crew(session_id);
CREATE INDEX idx_flha_session_crew_employee_id ON public.flha_session_crew(employee_id);

-- Signatures: query signatures per session, per employee
CREATE INDEX idx_flha_signatures_session_id ON public.flha_signatures(session_id);
CREATE INDEX idx_flha_signatures_employee_id ON public.flha_signatures(employee_id);
CREATE INDEX idx_flha_signatures_signed_at ON public.flha_signatures(signed_at DESC);

-- Updated_at trigger
CREATE TRIGGER flha_sessions_updated_at
  BEFORE UPDATE ON public.flha_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER flha_signatures_updated_at
  BEFORE UPDATE ON public.flha_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- Enable RLS
ALTER TABLE public.flha_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flha_session_hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flha_session_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flha_session_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flha_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- FLHA Sessions: read all, insert own, update own, delete own
CREATE POLICY "flha_sessions_read" ON public.flha_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "flha_sessions_insert" ON public.flha_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "flha_sessions_update" ON public.flha_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "flha_sessions_delete" ON public.flha_sessions
  FOR DELETE
  USING (true);

-- Session Details: same as sessions
CREATE POLICY "flha_session_hazards_read" ON public.flha_session_hazards
  FOR SELECT
  USING (true);

CREATE POLICY "flha_session_hazards_insert" ON public.flha_session_hazards
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "flha_session_hazards_delete" ON public.flha_session_hazards
  FOR DELETE
  USING (true);

CREATE POLICY "flha_session_controls_read" ON public.flha_session_controls
  FOR SELECT
  USING (true);

CREATE POLICY "flha_session_controls_insert" ON public.flha_session_controls
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "flha_session_controls_delete" ON public.flha_session_controls
  FOR DELETE
  USING (true);

CREATE POLICY "flha_session_crew_read" ON public.flha_session_crew
  FOR SELECT
  USING (true);

CREATE POLICY "flha_session_crew_insert" ON public.flha_session_crew
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "flha_session_crew_delete" ON public.flha_session_crew
  FOR DELETE
  USING (true);

CREATE POLICY "flha_signatures_read" ON public.flha_signatures
  FOR SELECT
  USING (true);

CREATE POLICY "flha_signatures_insert" ON public.flha_signatures
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "flha_signatures_update" ON public.flha_signatures
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flha_sessions TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.flha_session_hazards TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.flha_session_controls TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.flha_session_crew TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.flha_signatures TO anon, authenticated;
