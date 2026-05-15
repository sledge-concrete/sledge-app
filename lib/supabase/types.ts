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
  is_seed_data: false;
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
