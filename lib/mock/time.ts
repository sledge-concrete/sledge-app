import type { ActiveShift, TimeEntry, TimeEntryStatus, TimeOffRequest } from "@/lib/time-types";

export function getTodayDate() {
  return formatDate(new Date());
}

export function getInitialActiveShifts(): ActiveShift[] {
  return [
    {
      id: "shift-u-jake-job-carstairs-driveway",
      employeeId: "u-jake",
      jobId: "job-carstairs-driveway",
      clockedInAt: `${getTodayDate()}T07:15:00.000`,
    },
  ];
}

export function getInitialTimeEntries(): TimeEntry[] {
  const today = getTodayDate();
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);

  return [
    makeEntry({
      id: "time-u-mike-riverfront-today",
      employeeId: "u-mike",
      jobId: "job-riverfront",
      date: today,
      startTime: "07:00",
      endTime: "15:30",
      breakMinutes: 30,
      notes: "Foundation prep and rebar staging.",
      source: "clock",
      status: "pending",
    }),
    makeEntry({
      id: "time-u-tanya-eastside-today",
      employeeId: "u-tanya",
      jobId: "job-eastside",
      date: today,
      startTime: "06:45",
      endTime: "14:45",
      breakMinutes: 30,
      notes: "Warehouse slab finishing.",
      source: "manual",
      status: "pending",
    }),
    makeEntry({
      id: "time-u-mike-riverfront-yesterday",
      employeeId: "u-mike",
      jobId: "job-riverfront",
      date: yesterday,
      startTime: "07:00",
      endTime: "11:30",
      breakMinutes: 15,
      notes: "Morning pour setup.",
      source: "split",
      status: "approved",
      reviewedBy: "Sarah Holm",
    }),
    makeEntry({
      id: "time-u-mike-maple-yesterday",
      employeeId: "u-mike",
      jobId: "job-maple",
      date: yesterday,
      startTime: "12:15",
      endTime: "16:45",
      breakMinutes: 0,
      notes: "Driveway forms and cleanup.",
      source: "split",
      status: "approved",
      reviewedBy: "Sarah Holm",
    }),
    makeEntry({
      id: "time-u-jake-carstairs-twodays",
      employeeId: "u-jake",
      jobId: "job-carstairs-driveway",
      date: twoDaysAgo,
      startTime: "07:30",
      endTime: "15:00",
      breakMinutes: 30,
      notes: "Base prep.",
      source: "manual",
      status: "declined",
      reviewedBy: "Ben Sledge",
    }),
  ];
}

export function getInitialTimeOffRequests(): TimeOffRequest[] {
  const today = getTodayDate();

  return [
    {
      id: "timeoff-u-tanya-next-week",
      employeeId: "u-tanya",
      startDate: addDays(today, 7),
      endDate: addDays(today, 8),
      reason: "Family appointment.",
      status: "pending",
      submittedAt: `${today}T10:20:00.000`,
      reviewedBy: null,
      reviewedAt: null,
    },
  ];
}

export function createTimeEntry(input: Omit<TimeEntry, "id" | "submittedAt" | "reviewedBy" | "reviewedAt" | "status">): TimeEntry {
  return {
    ...input,
    id: `time-${input.employeeId}-${input.jobId}-${Date.now()}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
  };
}

export function createTimeOffRequest(input: Omit<TimeOffRequest, "id" | "submittedAt" | "reviewedBy" | "reviewedAt" | "status">): TimeOffRequest {
  return {
    ...input,
    id: `timeoff-${input.employeeId}-${Date.now()}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
  };
}

export function calculateEntryHours(entry: Pick<TimeEntry, "startTime" | "endTime" | "breakMinutes">) {
  const start = timeToMinutes(entry.startTime);
  const end = timeToMinutes(entry.endTime);
  const totalMinutes = Math.max(0, end - start - entry.breakMinutes);
  return Math.round((totalMinutes / 60) * 100) / 100;
}

export function getStatusLabel(status: TimeEntryStatus) {
  if (status === "approved") return "Approved";
  if (status === "declined") return "Declined";
  return "Pending";
}

function makeEntry(input: Omit<TimeEntry, "submittedAt" | "reviewedAt" | "reviewedBy"> & { reviewedBy?: string }): TimeEntry {
  return {
    ...input,
    submittedAt: `${input.date}T16:30:00.000`,
    reviewedBy: input.reviewedBy ?? null,
    reviewedAt: input.reviewedBy ? `${input.date}T17:05:00.000` : null,
  };
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
