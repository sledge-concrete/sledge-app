import {
  type DailyAggregateReport,
  type DailyReportEmployeeSummary,
  type DailyReportSiteSummary,
  type WeatherSnapshot,
} from "@/lib/mock/daily-reports";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  DailyReportEmployeeHourRow,
  DailyReportRow,
  DailyReportSignatureRow,
  DailyReportSiteRow,
  DailyReportWeatherSnapshotRow,
  EmployeeRow,
  JobRow,
} from "@/lib/supabase/types";

type SupabaseClient = NonNullable<ReturnType<typeof createServerSupabaseClient>>;
type LookupRow = Pick<EmployeeRow | JobRow, "id" | "legacy_mock_id">;

export async function getDailyAggregateReports(): Promise<DailyAggregateReport[] | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  const { data: reports, error: reportsError } = await supabase
    .from("daily_reports")
    .select("*")
    .order("report_date", { ascending: false });

  if (reportsError) {
    console.error("Supabase daily reports fetch failed.", reportsError);
    return null;
  }

  if (!reports?.length) return [];

  const reportIds = reports.map((report) => report.id);
  const [sitesResult, employeeHoursResult, weatherResult, signaturesResult] = await Promise.all([
    supabase.from("daily_report_sites").select("*").in("report_id", reportIds),
    supabase.from("daily_report_employee_hours").select("*").in("report_id", reportIds),
    supabase.from("daily_report_weather_snapshots").select("*").in("report_id", reportIds),
    supabase.from("daily_report_signatures").select("*").in("report_id", reportIds),
  ]);

  if (sitesResult.error || employeeHoursResult.error || weatherResult.error || signaturesResult.error) {
    console.error("Supabase daily report detail fetch failed.", {
      sites: sitesResult.error,
      employeeHours: employeeHoursResult.error,
      weather: weatherResult.error,
      signatures: signaturesResult.error,
    });
    return null;
  }

  return reports.map((report) =>
    mapDailyReport(report, {
      sites: sitesResult.data ?? [],
      employeeHours: employeeHoursResult.data ?? [],
      weather: weatherResult.data ?? [],
      signatures: signaturesResult.data ?? [],
    }),
  );
}

export async function upsertDailyAggregateReport(report: DailyAggregateReport): Promise<DailyAggregateReport | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  const [employeesResult, jobsResult] = await Promise.all([
    supabase.from("employees").select("id, legacy_mock_id"),
    supabase.from("jobs").select("id, legacy_mock_id"),
  ]);

  if (employeesResult.error || jobsResult.error) {
    console.error("Supabase daily report lookup fetch failed.", {
      employees: employeesResult.error,
      jobs: jobsResult.error,
    });
    return null;
  }

  const employeeLookup = buildIdLookup(employeesResult.data ?? []);
  const jobLookup = buildIdLookup(jobsResult.data ?? []);
  const supervisorEmployeeId = resolveDbId(report.supervisorId, employeeLookup);

  const { data: reportRow, error: reportError } = await supabase
    .from("daily_reports")
    .upsert(
      {
        legacy_mock_id: isUuid(report.id) ? null : report.id,
        report_date: report.date,
        status: report.status,
        supervisor_employee_id: supervisorEmployeeId,
        supervisor_name: report.supervisorName,
        total_hours: report.totalHours,
        site_count: report.siteCount,
        employee_count: report.employeeCount,
        overall_progress_summary: report.overallProgressSummary,
        is_seed_data: false,
        seed_batch: null,
      },
      { onConflict: "report_date" },
    )
    .select("*")
    .single();

  if (reportError || !reportRow) {
    console.error("Supabase daily report upsert failed.", reportError);
    return null;
  }

  const cleared = await clearDailyReportChildren(supabase, reportRow.id);
  if (!cleared) return null;

  const { data: siteRows, error: siteError } = await supabase
    .from("daily_report_sites")
    .insert(
      report.siteSummaries.map((site) => ({
        report_id: reportRow.id,
        job_id: resolveDbId(site.jobId, jobLookup),
        legacy_job_id: isUuid(site.jobId) ? null : site.jobId,
        job_name: site.jobName,
        project_number: site.projectNumber,
        company: site.company,
        address: site.address,
        total_hours: site.totalHours,
        employee_count: site.employeeCount,
        progress_summary: site.progressSummary,
        safety_session_id: site.safety.sessionId && isUuid(site.safety.sessionId) ? site.safety.sessionId : null,
        safety_status: site.safety.status,
        safety_signatures: site.safety.signatures,
        hazards_identified: site.safety.hazardsIdentified,
        controls_implemented: site.safety.controlsImplemented,
        incidents: site.safety.incidents,
        near_misses: site.safety.nearMisses,
      })),
    )
    .select("*");

  if (siteError || !siteRows) {
    console.error("Supabase daily report sites insert failed.", siteError);
    return null;
  }

  const siteRowsByKey = new Map(siteRows.map((siteRow) => [getSiteKey(siteRow), siteRow]));
  const employeeHourPayload = report.siteSummaries.flatMap((site) => {
    const siteRow = siteRowsByKey.get(site.jobId);
    if (!siteRow) return [];

    return site.employeeSummary.map((employee) => {
      const siteHours = employee.sites.find((item) => item.jobId === site.jobId)?.hoursWorked ?? employee.totalHours;

      return {
        report_id: reportRow.id,
        site_id: siteRow.id,
        job_id: siteRow.job_id,
        employee_id: resolveDbId(employee.employeeId, employeeLookup),
        legacy_employee_id: isUuid(employee.employeeId) ? null : employee.employeeId,
        employee_name: employee.name,
        employee_role: employee.role,
        hours_worked: siteHours,
      };
    });
  });

  const weatherPayload = report.siteSummaries.flatMap((site) => {
    const siteRow = siteRowsByKey.get(site.jobId);
    if (!siteRow) return [];

    return site.weather.map((snapshot) => ({
      report_id: reportRow.id,
      site_id: siteRow.id,
      job_id: siteRow.job_id,
      snapshot_time: snapshot.time,
      temp: snapshot.temp,
      precip: snapshot.precip,
      wind: snapshot.wind,
      humidity: snapshot.humidity,
      override_temp: snapshot.override?.temp ?? null,
      override_precip: snapshot.override?.precip ?? null,
      override_wind: snapshot.override?.wind ?? null,
      override_humidity: snapshot.override?.humidity ?? null,
    }));
  });

  const [employeeHoursResult, weatherResult, signatureResult] = await Promise.all([
    employeeHourPayload.length
      ? supabase.from("daily_report_employee_hours").insert(employeeHourPayload).select("*")
      : Promise.resolve({ data: [], error: null }),
    weatherPayload.length
      ? supabase.from("daily_report_weather_snapshots").insert(weatherPayload).select("*")
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("daily_report_signatures")
      .insert({
        report_id: reportRow.id,
        signer_employee_id: supervisorEmployeeId,
        printed_name: report.signature.printedName,
        signature_data: report.signature.dataUrl,
        signed_at: new Date().toISOString(),
        signature_date: report.signature.date,
      })
      .select("*")
      .single(),
  ]);

  if (employeeHoursResult.error || weatherResult.error || signatureResult.error) {
    console.error("Supabase daily report child insert failed.", {
      employeeHours: employeeHoursResult.error,
      weather: weatherResult.error,
      signature: signatureResult.error,
    });
    return null;
  }

  return mapDailyReport(reportRow, {
    sites: siteRows,
    employeeHours: employeeHoursResult.data ?? [],
    weather: weatherResult.data ?? [],
    signatures: signatureResult.data ? [signatureResult.data] : [],
  });
}

async function clearDailyReportChildren(supabase: SupabaseClient, reportId: string): Promise<boolean> {
  const [signatureDelete, weatherDelete, employeeHoursDelete, sitesDelete] = await Promise.all([
    supabase.from("daily_report_signatures").delete().eq("report_id", reportId),
    supabase.from("daily_report_weather_snapshots").delete().eq("report_id", reportId),
    supabase.from("daily_report_employee_hours").delete().eq("report_id", reportId),
    supabase.from("daily_report_sites").delete().eq("report_id", reportId),
  ]);

  if (signatureDelete.error || weatherDelete.error || employeeHoursDelete.error || sitesDelete.error) {
    console.error("Supabase daily report child cleanup failed.", {
      signature: signatureDelete.error,
      weather: weatherDelete.error,
      employeeHours: employeeHoursDelete.error,
      sites: sitesDelete.error,
    });
    return false;
  }

  return true;
}

function mapDailyReport(
  report: DailyReportRow,
  rows: {
    sites: DailyReportSiteRow[];
    employeeHours: DailyReportEmployeeHourRow[];
    weather: DailyReportWeatherSnapshotRow[];
    signatures: DailyReportSignatureRow[];
  },
): DailyAggregateReport {
  const siteRows = rows.sites.filter((site) => site.report_id === report.id);
  const siteSummaries = siteRows.map((site) => mapSiteSummary(site, rows.employeeHours, rows.weather));
  const signature = rows.signatures.find((item) => item.report_id === report.id);

  return {
    id: report.legacy_mock_id ?? report.id,
    date: report.report_date,
    status: "signed",
    supervisorId: report.supervisor_employee_id ?? "",
    supervisorName: report.supervisor_name,
    totalHours: toNumber(report.total_hours),
    siteCount: report.site_count,
    employeeCount: report.employee_count,
    overallProgressSummary: report.overall_progress_summary,
    siteSummaries,
    employeeSummary: mergeEmployeeSummaries(siteSummaries.flatMap((site) => site.employeeSummary)),
    signature: {
      dataUrl: signature?.signature_data ?? "",
      printedName: signature?.printed_name ?? report.supervisor_name,
      date: signature?.signature_date ?? report.report_date,
    },
    createdAt: report.created_at,
    updatedAt: report.updated_at,
  };
}

function mapSiteSummary(
  site: DailyReportSiteRow,
  employeeHours: DailyReportEmployeeHourRow[],
  weather: DailyReportWeatherSnapshotRow[],
): DailyReportSiteSummary {
  const jobId = getSiteKey(site);

  return {
    jobId,
    jobName: site.job_name,
    projectNumber: site.project_number,
    company: site.company,
    address: site.address,
    totalHours: toNumber(site.total_hours),
    employeeCount: site.employee_count,
    employeeSummary: employeeHours
      .filter((row) => row.site_id === site.id)
      .map((row) => mapEmployeeSummary(row, jobId, site.job_name)),
    weather: weather
      .filter((row) => row.site_id === site.id)
      .map(mapWeatherSnapshot)
      .sort((a, b) => a.time.localeCompare(b.time)),
    safety: {
      jobId,
      sessionId: site.safety_session_id,
      status: site.safety_status,
      signatures: site.safety_signatures,
      hazardsIdentified: site.hazards_identified,
      controlsImplemented: site.controls_implemented,
      incidents: site.incidents,
      nearMisses: site.near_misses,
    },
    progressSummary: site.progress_summary,
  };
}

function mapEmployeeSummary(row: DailyReportEmployeeHourRow, jobId: string, jobName: string): DailyReportEmployeeSummary {
  const hoursWorked = toNumber(row.hours_worked);

  return {
    employeeId: row.legacy_employee_id ?? row.employee_id ?? row.id,
    name: row.employee_name,
    role: row.employee_role,
    totalHours: hoursWorked,
    sites: [{ jobId, jobName, hoursWorked }],
  };
}

function mapWeatherSnapshot(row: DailyReportWeatherSnapshotRow): WeatherSnapshot {
  const override =
    row.override_temp !== null ||
    row.override_precip !== null ||
    row.override_wind !== null ||
    row.override_humidity !== null
      ? {
          temp: row.override_temp === null ? undefined : toNumber(row.override_temp),
          precip: row.override_precip === null ? undefined : toNumber(row.override_precip),
          wind: row.override_wind === null ? undefined : toNumber(row.override_wind),
          humidity: row.override_humidity === null ? undefined : toNumber(row.override_humidity),
        }
      : undefined;

  return {
    time: row.snapshot_time,
    temp: toNumber(row.temp),
    precip: toNumber(row.precip),
    wind: toNumber(row.wind),
    humidity: toNumber(row.humidity),
    override,
  };
}

function mergeEmployeeSummaries(summaries: DailyReportEmployeeSummary[]): DailyReportEmployeeSummary[] {
  const byEmployee = new Map<string, DailyReportEmployeeSummary>();

  summaries.forEach((summary) => {
    const current = byEmployee.get(summary.employeeId);
    if (!current) {
      byEmployee.set(summary.employeeId, summary);
      return;
    }

    byEmployee.set(summary.employeeId, {
      ...current,
      totalHours: roundHours(current.totalHours + summary.totalHours),
      sites: [...current.sites, ...summary.sites],
    });
  });

  return [...byEmployee.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function buildIdLookup(rows: LookupRow[]) {
  const lookup = new Map<string, string>();

  rows.forEach((row) => {
    lookup.set(row.id, row.id);
    if (row.legacy_mock_id) lookup.set(row.legacy_mock_id, row.id);
  });

  return lookup;
}

function resolveDbId(value: string | null | undefined, lookup: Map<string, string>): string | null {
  if (!value) return null;
  return lookup.get(value) ?? (isUuid(value) ? value : null);
}

function getSiteKey(site: Pick<DailyReportSiteRow, "id" | "job_id" | "legacy_job_id">): string {
  return site.legacy_job_id ?? site.job_id ?? site.id;
}

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

function roundHours(value: number) {
  return Math.round(value * 100) / 100;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);
}
