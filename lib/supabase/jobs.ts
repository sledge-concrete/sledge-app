import { createServerSupabaseClient } from "./server";
import type { EmployeeRow, JobActivityRow, JobCrewRow, JobRow } from "./types";
import type { ActivityEntry, Employee, Job } from "@/lib/mock/types";

export type SupabaseJobDetail = {
  job: Job;
  supervisor: Employee | undefined;
  crew: Employee[];
  employees: Employee[];
  activity: ActivityEntry[];
};

type SourceEmployee = Employee & { sourceId: string };

export async function getJobDetailByLegacyId(legacyJobId: string): Promise<SupabaseJobDetail | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  const { data: jobRow, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("legacy_mock_id", legacyJobId)
    .maybeSingle();

  if (jobError || !jobRow) {
    if (jobError) console.error("Supabase job detail fetch failed.", jobError);
    return null;
  }

  const [employeesResult, crewResult, activityResult] = await Promise.all([
    supabase.from("employees").select("id, legacy_mock_id, name, role, email, initials"),
    supabase
      .from("job_crew")
      .select("job_id, employee_id, role_on_job")
      .eq("job_id", jobRow.id),
    supabase
      .from("job_activity")
      .select("id, legacy_mock_id, activity_type, actor_employee_id, occurred_at, detail, job_id")
      .eq("job_id", jobRow.id)
      .order("occurred_at", { ascending: false }),
  ]);

  if (employeesResult.error || crewResult.error || activityResult.error) {
    console.error("Supabase related job detail fetch failed.", {
      employees: employeesResult.error,
      crew: crewResult.error,
      activity: activityResult.error,
    });
    return null;
  }

  const allEmployees = (employeesResult.data ?? []).map(mapEmployee);
  const crew = ((crewResult.data ?? []) as JobCrewRow[])
    .map((row) => allEmployees.find((employee) => employee.sourceId === row.employee_id))
    .filter((employee): employee is SourceEmployee => !!employee);
  const supervisor = allEmployees.find((employee) => employee.sourceId === jobRow.supervisor_employee_id);
  const employeeByUuid = new Map(allEmployees.map((employee) => [employee.sourceId, employee]));

  return {
    job: mapJob(jobRow, supervisor, crew),
    supervisor: supervisor ? stripSourceId(supervisor) : undefined,
    crew: crew.map(stripSourceId),
    employees: allEmployees.map(stripSourceId),
    activity: ((activityResult.data ?? []) as JobActivityRow[]).map((row) => mapActivity(row, legacyJobId, employeeByUuid)),
  };
}

function mapJob(row: JobRow, supervisor: Employee | undefined, crew: Employee[]): Job {
  return {
    id: row.legacy_mock_id ?? row.id,
    name: row.name,
    number: row.job_number,
    client_name: row.client_name,
    address: row.address,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    supervisorId: supervisor?.id ?? "",
    crew: crew.map((employee) => employee.id),
    hoursLogged: Number(row.hours_logged),
    worker_count: crew.length + (row.supervisor_employee_id ? 1 : 0),
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    service_type: row.service_type ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapEmployee(row: EmployeeRow): SourceEmployee {
  return {
    sourceId: row.id,
    id: row.legacy_mock_id ?? row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    initials: row.initials,
  };
}

function stripSourceId(employee: SourceEmployee): Employee {
  return {
    id: employee.id,
    name: employee.name,
    role: employee.role,
    email: employee.email,
    initials: employee.initials,
  };
}

function mapActivity(
  row: JobActivityRow,
  legacyJobId: string,
  employeeByUuid: Map<string, SourceEmployee>,
): ActivityEntry {
  const actor = row.actor_employee_id ? employeeByUuid.get(row.actor_employee_id) : undefined;

  return {
    id: row.legacy_mock_id ? `${legacyJobId}-${row.legacy_mock_id}` : row.id,
    jobId: legacyJobId,
    type: row.activity_type,
    actor: actor?.id ?? row.actor_employee_id ?? "",
    at: row.occurred_at,
    detail: row.detail,
  };
}
