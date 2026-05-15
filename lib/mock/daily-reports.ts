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

export const getDailyReport = (id: string) => dailyReports.find((r) => r.id === id);
export const getDailyReportsByJob = (jobId: string) => dailyReports.filter((r) => r.jobId === jobId);
