import { getEmployee } from "./employees";
import { jobs } from "./jobs";
import type { ActiveShift, TimeEntry } from "@/lib/time-types";

export type DailyReportStatus = "pending" | "signed";

export type WeatherSnapshot = {
  time: "08:00" | "12:00" | "17:00";
  temp: number;
  precip: number;
  wind: number;
  humidity: number;
  override?: {
    temp?: number;
    precip?: number;
    wind?: number;
    humidity?: number;
  };
};

export type EmployeeAttendance = {
  employeeId: string;
  name: string;
  hoursWorked: number;
  role: string;
};

export type SafetySignOff = {
  hazardsIdentified: number;
  controlsImplemented: number;
  incidents: number;
  nearMisses: number;
};

export type DailyReportSignature = {
  dataUrl: string;
  printedName: string;
  date: string;
};

export type DailyReport = {
  id: string;
  jobId: string;
  projectNumber: string;
  jobName: string;
  company: string;
  date: string;
  status: DailyReportStatus;
  supervisor: string;
  weather: WeatherSnapshot[];
  progressSummary: string;
  employeeSummary: {
    notes: string;
    attendance: EmployeeAttendance[];
    onSiteCount: number;
    plannedCount: number;
    materialsDelivered: string;
  };
  safety: SafetySignOff | null;
  signature: DailyReportSignature | null;
  createdAt: string;
  updatedAt: string;
};

export type DailyReportEmployeeSiteHours = {
  jobId: string;
  jobName: string;
  hoursWorked: number;
};

export type DailyReportEmployeeSummary = {
  employeeId: string;
  name: string;
  role: string;
  totalHours: number;
  sites: DailyReportEmployeeSiteHours[];
};

export type DailyReportSafetyEntry = {
  jobId: string;
  sessionId: string | null;
  status: "none" | "started" | "complete";
  signatures: number;
  hazardsIdentified: number;
  controlsImplemented: number;
  incidents: number;
  nearMisses: number;
};

export type DailyReportSiteSummary = {
  jobId: string;
  jobName: string;
  projectNumber: string;
  company: string;
  address: string;
  totalHours: number;
  employeeCount: number;
  employeeSummary: DailyReportEmployeeSummary[];
  weather: WeatherSnapshot[];
  safety: DailyReportSafetyEntry;
  progressSummary: string;
};

export type DailyAggregateReport = {
  id: string;
  date: string;
  status: "signed";
  supervisorId: string;
  supervisorName: string;
  totalHours: number;
  siteCount: number;
  employeeCount: number;
  overallProgressSummary: string;
  siteSummaries: DailyReportSiteSummary[];
  employeeSummary: DailyReportEmployeeSummary[];
  signature: DailyReportSignature;
  createdAt: string;
  updatedAt: string;
};

export type WorkedSiteSummary = {
  jobId: string;
  jobName: string;
  projectNumber: string;
  company: string;
  address: string;
  totalHours: number;
  employeeCount: number;
  employeeSummary: DailyReportEmployeeSummary[];
};

export const dailyReports: DailyReport[] = [
  {
    id: "report-riverfront-001",
    jobId: "job-riverfront",
    projectNumber: "SC-2026-014",
    jobName: "Riverfront Commercial Build",
    company: "Northgate Holdings",
    date: "2026-05-07",
    status: "pending",
    supervisor: "u-sarah",
    weather: [
      { time: "08:00", temp: 12, precip: 0, wind: 8, humidity: 65 },
      { time: "12:00", temp: 18, precip: 0, wind: 12, humidity: 55 },
      { time: "17:00", temp: 14, precip: 0.5, wind: 15, humidity: 70 },
    ],
    progressSummary:
      "East footing excavation completed as scheduled. Rebar staging area prepared. Weather cleared midday, allowing full work hours. Concrete delivery confirmed for May 9th.",
    employeeSummary: {
      notes: "All crew members present. No incidents. Good productivity day.",
      attendance: [
        { employeeId: "u-mike", name: "Mike Doran", hoursWorked: 8, role: "Lead Operator" },
        { employeeId: "u-jake", name: "Jake Reilly", hoursWorked: 8, role: "Excavator" },
        { employeeId: "u-tanya", name: "Tanya Webb", hoursWorked: 8, role: "Safety Lead" },
      ],
      onSiteCount: 3,
      plannedCount: 3,
      materialsDelivered: "50 cu yards ready-mix staged. Formwork materials on site.",
    },
    safety: null,
    signature: null,
    createdAt: "2026-05-07T06:00:00Z",
    updatedAt: "2026-05-07T18:00:00Z",
  },
  {
    id: "report-maple-001",
    jobId: "job-maple",
    projectNumber: "SC-2026-018",
    jobName: "Maple Street Residential",
    company: "Holm Family",
    date: "2026-05-06",
    status: "signed",
    supervisor: "u-sarah",
    weather: [
      { time: "08:00", temp: 10, precip: 0, wind: 6, humidity: 72 },
      { time: "12:00", temp: 16, precip: 0, wind: 10, humidity: 60 },
      { time: "17:00", temp: 13, precip: 0, wind: 8, humidity: 68 },
    ],
    progressSummary:
      "Foundation inspection completed and approved by municipal inspector. All forms passed inspection. Ready to proceed with concrete pour on May 8th. Grading work 95% complete.",
    employeeSummary: {
      notes: "Two crew members on-site. Foundation inspection went smoothly. Client walkthrough at 2pm — all satisfied with progress.",
      attendance: [
        { employeeId: "u-mike", name: "Mike Doran", hoursWorked: 8, role: "Lead Operator" },
        { employeeId: "u-jake", name: "Jake Reilly", hoursWorked: 8, role: "Grading Specialist" },
      ],
      onSiteCount: 2,
      plannedCount: 2,
      materialsDelivered: "Gravel and fill materials delivered and spread.",
    },
    safety: {
      hazardsIdentified: 2,
      controlsImplemented: 2,
      incidents: 0,
      nearMisses: 0,
    },
    signature: {
      dataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      printedName: "Sarah Holm",
      date: "2026-05-06",
    },
    createdAt: "2026-05-06T06:00:00Z",
    updatedAt: "2026-05-06T18:30:00Z",
  },
];

export const aggregateDailyReports: DailyAggregateReport[] = [
  {
    id: "daily-aggregate-2026-05-07",
    date: "2026-05-07",
    status: "signed",
    supervisorId: "u-sarah",
    supervisorName: "Sarah Holm",
    totalHours: 24,
    siteCount: 1,
    employeeCount: 3,
    overallProgressSummary:
      "Riverfront crew completed excavation and rebar staging. Concrete delivery remains on schedule.",
    siteSummaries: [
      {
        jobId: "job-riverfront",
        jobName: "Riverfront Commercial Build",
        projectNumber: "SC-2026-014",
        company: "Northgate Holdings",
        address: "1820 Riverfront Dr, Calgary, AB",
        totalHours: 24,
        employeeCount: 3,
        employeeSummary: [
          makeEmployeeSummary("u-mike", [{ jobId: "job-riverfront", hoursWorked: 8 }]),
          makeEmployeeSummary("u-jake", [{ jobId: "job-riverfront", hoursWorked: 8 }]),
          makeEmployeeSummary("u-tanya", [{ jobId: "job-riverfront", hoursWorked: 8 }]),
        ],
        weather: [
          { time: "08:00", temp: 12, precip: 0, wind: 8, humidity: 65 },
          { time: "12:00", temp: 18, precip: 0, wind: 12, humidity: 55 },
          { time: "17:00", temp: 14, precip: 0.5, wind: 15, humidity: 70 },
        ],
        safety: {
          jobId: "job-riverfront",
          sessionId: null,
          status: "none",
          signatures: 0,
          hazardsIdentified: 0,
          controlsImplemented: 0,
          incidents: 0,
          nearMisses: 0,
        },
        progressSummary:
          "East footing excavation completed. Rebar staging area prepared and delivery confirmed.",
      },
    ],
    employeeSummary: [
      makeEmployeeSummary("u-mike", [{ jobId: "job-riverfront", hoursWorked: 8 }]),
      makeEmployeeSummary("u-jake", [{ jobId: "job-riverfront", hoursWorked: 8 }]),
      makeEmployeeSummary("u-tanya", [{ jobId: "job-riverfront", hoursWorked: 8 }]),
    ],
    signature: {
      dataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      printedName: "Sarah Holm",
      date: "2026-05-07",
    },
    createdAt: "2026-05-07T18:00:00Z",
    updatedAt: "2026-05-07T18:00:00Z",
  },
];

export const getDailyReport = (id: string) => dailyReports.find((r) => r.id === id);
export const getDailyReportsByJob = (jobId: string) => dailyReports.filter((r) => r.jobId === jobId);

export function createAggregateDailyReport(input: {
  date: string;
  supervisorId: string;
  overallProgressSummary: string;
  siteSummaries: DailyReportSiteSummary[];
  signature: DailyReportSignature;
}): DailyAggregateReport {
  const now = new Date().toISOString();
  const supervisor = getEmployee(input.supervisorId);
  const employeeSummary = mergeEmployeeSummaries(input.siteSummaries.flatMap((site) => site.employeeSummary));
  const totalHours = roundHours(input.siteSummaries.reduce((sum, site) => sum + site.totalHours, 0));

  return {
    id: `daily-aggregate-${input.date}`,
    date: input.date,
    status: "signed",
    supervisorId: input.supervisorId,
    supervisorName: supervisor?.name ?? "Unknown",
    totalHours,
    siteCount: input.siteSummaries.length,
    employeeCount: employeeSummary.length,
    overallProgressSummary: input.overallProgressSummary,
    siteSummaries: input.siteSummaries,
    employeeSummary,
    signature: input.signature,
    createdAt: now,
    updatedAt: now,
  };
}

export function getWorkedSiteSummariesForDate({
  date,
  entries,
  activeShifts,
}: {
  date: string;
  entries: TimeEntry[];
  activeShifts: ActiveShift[];
}): WorkedSiteSummary[] {
  const summaries = new Map<string, Map<string, number>>();

  entries
    .filter((entry) => entry.date === date)
    .forEach((entry) => addHours(summaries, entry.jobId, entry.employeeId, calculateEntryHours(entry)));

  activeShifts
    .filter((shift) => getLocalDate(shift.clockedInAt) === date)
    .forEach((shift) => addHours(summaries, shift.jobId, shift.employeeId, calculateActiveShiftHours(shift.clockedInAt)));

  return [...summaries.entries()]
    .map(([jobId, employeeHours]) => {
      const job = jobs.find((item) => item.id === jobId);
      const employeeSummary = [...employeeHours.entries()].map(([employeeId, hoursWorked]) =>
        makeEmployeeSummary(employeeId, [{ jobId, hoursWorked }]),
      );
      const totalHours = roundHours(employeeSummary.reduce((sum, employee) => sum + employee.totalHours, 0));

      return {
        jobId,
        jobName: job?.name ?? "Unknown job",
        projectNumber: job?.number ?? jobId,
        company: job?.client_name ?? "Unknown client",
        address: job?.address ?? "",
        totalHours,
        employeeCount: employeeSummary.length,
        employeeSummary,
      };
    })
    .sort((a, b) => a.jobName.localeCompare(b.jobName));
}

export function createEmptySafetyEntry(jobId: string): DailyReportSafetyEntry {
  return {
    jobId,
    sessionId: null,
    status: "none",
    signatures: 0,
    hazardsIdentified: 0,
    controlsImplemented: 0,
    incidents: 0,
    nearMisses: 0,
  };
}

export function createFallbackWeather(): WeatherSnapshot[] {
  return [
    { time: "08:00", temp: 10, precip: 0, wind: 8, humidity: 70 },
    { time: "12:00", temp: 16, precip: 0, wind: 10, humidity: 60 },
    { time: "17:00", temp: 13, precip: 0, wind: 9, humidity: 68 },
  ];
}

function makeEmployeeSummary(
  employeeId: string,
  siteHours: { jobId: string; hoursWorked: number }[],
): DailyReportEmployeeSummary {
  const employee = getEmployee(employeeId);
  const sites = siteHours.map(({ jobId, hoursWorked }) => {
    const job = jobs.find((item) => item.id === jobId);
    return {
      jobId,
      jobName: job?.name ?? "Unknown job",
      hoursWorked: roundHours(hoursWorked),
    };
  });

  return {
    employeeId,
    name: employee?.name ?? "Unknown",
    role: employee?.role ?? "employee",
    totalHours: roundHours(sites.reduce((sum, site) => sum + site.hoursWorked, 0)),
    sites,
  };
}

function mergeEmployeeSummaries(summaries: DailyReportEmployeeSummary[]): DailyReportEmployeeSummary[] {
  const byEmployee = new Map<string, { role: string; name: string; siteHours: Map<string, number> }>();

  summaries.forEach((summary) => {
    const current = byEmployee.get(summary.employeeId) ?? {
      role: summary.role,
      name: summary.name,
      siteHours: new Map<string, number>(),
    };

    summary.sites.forEach((site) => {
      current.siteHours.set(site.jobId, roundHours((current.siteHours.get(site.jobId) ?? 0) + site.hoursWorked));
    });

    byEmployee.set(summary.employeeId, current);
  });

  return [...byEmployee.entries()]
    .map(([employeeId, summary]) => ({
      employeeId,
      name: summary.name,
      role: summary.role,
      sites: [...summary.siteHours.entries()].map(([jobId, hoursWorked]) => {
        const job = jobs.find((item) => item.id === jobId);
        return {
          jobId,
          jobName: job?.name ?? "Unknown job",
          hoursWorked: roundHours(hoursWorked),
        };
      }),
      totalHours: roundHours([...summary.siteHours.values()].reduce((sum, hoursWorked) => sum + hoursWorked, 0)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function addHours(summaries: Map<string, Map<string, number>>, jobId: string, employeeId: string, hours: number) {
  const employeeHours = summaries.get(jobId) ?? new Map<string, number>();
  employeeHours.set(employeeId, roundHours((employeeHours.get(employeeId) ?? 0) + hours));
  summaries.set(jobId, employeeHours);
}

function calculateEntryHours(entry: Pick<TimeEntry, "startTime" | "endTime" | "breakMinutes">) {
  const start = timeToMinutes(entry.startTime);
  const end = timeToMinutes(entry.endTime);
  const totalMinutes = Math.max(0, end - start - entry.breakMinutes);
  return roundHours(totalMinutes / 60);
}

function calculateActiveShiftHours(clockedInAt: string) {
  const start = new Date(clockedInAt).getTime();
  const end = Date.now();
  if (Number.isNaN(start) || end <= start) return 0;
  return roundHours((end - start) / 1000 / 60 / 60);
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function getLocalDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function roundHours(value: number) {
  return Math.round(value * 100) / 100;
}
