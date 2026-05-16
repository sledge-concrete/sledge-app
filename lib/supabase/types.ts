export type JobsListRow = {
  id: string;
  legacy_mock_id: string | null;
  name: string;
  job_number: string;
  client_name: string;
  address: string;
  status: "active" | "hold" | "completed";
  start_date: string;
  end_date: string | null;
  supervisor_employee_id: string | null;
  hours_logged: string | number;
  worker_count: number;
  latitude: string | number;
  longitude: string | number;
  service_type: string | null;
  notes: string | null;
  is_seed_data: boolean;
  seed_batch: string | null;
  created_at: string;
  updated_at: string;
  supervisor_legacy_mock_id: string | null;
  crew_legacy_mock_ids: string[];
};

export type EmployeeRow = {
  id: string;
  legacy_mock_id: string | null;
  name: string;
  role: "admin" | "supervisor" | "employee" | "tablet";
  email: string;
  initials: string;
};

export type JobRow = {
  id: string;
  legacy_mock_id: string | null;
  name: string;
  job_number: string;
  client_name: string;
  address: string;
  status: "active" | "hold" | "completed";
  start_date: string;
  end_date: string | null;
  supervisor_employee_id: string | null;
  hours_logged: string | number;
  latitude: string | number;
  longitude: string | number;
  service_type: string | null;
  notes: string | null;
};

export type JobCrewRow = {
  job_id: string;
  employee_id: string;
  role_on_job: string;
};

export type JobActivityRow = {
  id: string;
  legacy_mock_id: string | null;
  activity_type: "clock-in" | "clock-out" | "upload" | "note" | "sign-off";
  actor_employee_id: string | null;
  occurred_at: string;
  detail: string;
};

export type JobInsertPayload = {
  name: string;
  job_number: string;
  client_name: string;
  address: string;
  status: "active" | "hold" | "completed";
  start_date: string;
  latitude: number;
  longitude: number;
  service_type?: string | null;
  notes?: string | null;
};

export type ActiveShiftRow = {
  id: string;
  employee_id: string;
  job_id: string;
  clock_in_at: string;
  created_at: string;
};

export type TimeEntryRow = {
  id: string;
  employee_id: string;
  job_id: string;
  clock_in_at: string;
  clock_out_at: string;
  break_minutes: number | null;
  notes: string | null;
  source: "clock" | "manual" | "split";
  status: "pending" | "approved" | "declined";
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FlhaSessionRow = {
  id: string;
  job_id: string;
  session_date: string;
  filled_by: string;
  work_location: string;
  sr_number: string | null;
  job_description: string;
  supervisor_name: string;
  supervisor_phone: string | null;
  other_hazards: string[] | null;
  other_controls: string | null;
  comments: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FlhaSessionHazardRow = {
  id: string;
  session_id: string;
  hazard_type: string;
  created_at: string;
};

export type FlhaSessionControlRow = {
  id: string;
  session_id: string;
  control_type: string;
  created_at: string;
};

export type FlhaSessionCrewRow = {
  id: string;
  session_id: string;
  employee_id: string | null;
  employee_name: string;
  created_at: string;
};

export type FlhaSignatureRow = {
  id: string;
  session_id: string;
  employee_id: string | null;
  employee_name: string;
  signature_data: string;
  signed_at: string;
  created_at: string;
  updated_at: string;
};

export type DailyReportRow = {
  id: string;
  legacy_mock_id: string | null;
  report_date: string;
  status: "pending" | "signed";
  supervisor_employee_id: string | null;
  supervisor_name: string;
  total_hours: string | number;
  site_count: number;
  employee_count: number;
  overall_progress_summary: string;
  created_at: string;
  updated_at: string;
  is_seed_data: boolean;
  seed_batch: string | null;
};

export type DailyReportSiteRow = {
  id: string;
  report_id: string;
  job_id: string | null;
  legacy_job_id: string | null;
  job_name: string;
  project_number: string;
  company: string;
  address: string;
  total_hours: string | number;
  employee_count: number;
  progress_summary: string;
  safety_session_id: string | null;
  safety_status: "none" | "started" | "complete";
  safety_signatures: number;
  hazards_identified: number;
  controls_implemented: number;
  incidents: number;
  near_misses: number;
  created_at: string;
};

export type DailyReportEmployeeHourRow = {
  id: string;
  report_id: string;
  site_id: string;
  job_id: string | null;
  employee_id: string | null;
  legacy_employee_id: string | null;
  employee_name: string;
  employee_role: string;
  hours_worked: string | number;
  created_at: string;
};

export type DailyReportWeatherSnapshotRow = {
  id: string;
  report_id: string;
  site_id: string;
  job_id: string | null;
  snapshot_time: "08:00" | "12:00" | "17:00";
  temp: string | number;
  precip: string | number;
  wind: string | number;
  humidity: string | number;
  override_temp: string | number | null;
  override_precip: string | number | null;
  override_wind: string | number | null;
  override_humidity: string | number | null;
  created_at: string;
};

export type DailyReportSignatureRow = {
  id: string;
  report_id: string;
  signer_employee_id: string | null;
  printed_name: string;
  signature_data: string;
  signed_at: string;
  signature_date: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: EmployeeRow;
        Insert: Partial<EmployeeRow>;
        Update: Partial<EmployeeRow>;
        Relationships: [];
      };
      jobs: {
        Row: JobRow;
        Insert: Partial<JobRow>;
        Update: Partial<JobRow>;
        Relationships: [];
      };
      job_crew: {
        Row: JobCrewRow;
        Insert: Partial<JobCrewRow>;
        Update: Partial<JobCrewRow>;
        Relationships: [];
      };
      job_activity: {
        Row: JobActivityRow & {
          job_id: string;
        };
        Insert: Partial<JobActivityRow> & {
          job_id?: string;
        };
        Update: Partial<JobActivityRow> & {
          job_id?: string;
        };
        Relationships: [];
      };
      active_shifts: {
        Row: ActiveShiftRow;
        Insert: Partial<ActiveShiftRow>;
        Update: Partial<ActiveShiftRow>;
        Relationships: [];
      };
      time_entries: {
        Row: TimeEntryRow;
        Insert: Partial<TimeEntryRow>;
        Update: Partial<TimeEntryRow>;
        Relationships: [];
      };
      flha_sessions: {
        Row: FlhaSessionRow;
        Insert: Partial<FlhaSessionRow>;
        Update: Partial<FlhaSessionRow>;
        Relationships: [];
      };
      flha_session_hazards: {
        Row: FlhaSessionHazardRow;
        Insert: Partial<FlhaSessionHazardRow>;
        Update: Partial<FlhaSessionHazardRow>;
        Relationships: [];
      };
      flha_session_controls: {
        Row: FlhaSessionControlRow;
        Insert: Partial<FlhaSessionControlRow>;
        Update: Partial<FlhaSessionControlRow>;
        Relationships: [];
      };
      flha_session_crew: {
        Row: FlhaSessionCrewRow;
        Insert: Partial<FlhaSessionCrewRow>;
        Update: Partial<FlhaSessionCrewRow>;
        Relationships: [];
      };
      flha_signatures: {
        Row: FlhaSignatureRow;
        Insert: Partial<FlhaSignatureRow>;
        Update: Partial<FlhaSignatureRow>;
        Relationships: [];
      };
      daily_reports: {
        Row: DailyReportRow;
        Insert: Partial<DailyReportRow>;
        Update: Partial<DailyReportRow>;
        Relationships: [];
      };
      daily_report_sites: {
        Row: DailyReportSiteRow;
        Insert: Partial<DailyReportSiteRow>;
        Update: Partial<DailyReportSiteRow>;
        Relationships: [];
      };
      daily_report_employee_hours: {
        Row: DailyReportEmployeeHourRow;
        Insert: Partial<DailyReportEmployeeHourRow>;
        Update: Partial<DailyReportEmployeeHourRow>;
        Relationships: [];
      };
      daily_report_weather_snapshots: {
        Row: DailyReportWeatherSnapshotRow;
        Insert: Partial<DailyReportWeatherSnapshotRow>;
        Update: Partial<DailyReportWeatherSnapshotRow>;
        Relationships: [];
      };
      daily_report_signatures: {
        Row: DailyReportSignatureRow;
        Insert: Partial<DailyReportSignatureRow>;
        Update: Partial<DailyReportSignatureRow>;
        Relationships: [];
      };
    };
    Views: {
      jobs_list_view: {
        Row: JobsListRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
};
