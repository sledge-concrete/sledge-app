export type TimeEntryStatus = "pending" | "approved" | "declined";

export type TimeEntrySource = "clock" | "manual" | "split";

export type ActiveShift = {
  id: string;
  employeeId: string;
  jobId: string;
  clockedInAt: string;
};

export type TimeEntry = {
  id: string;
  employeeId: string;
  jobId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  notes: string;
  source: TimeEntrySource;
  status: TimeEntryStatus;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type TimeOffRequest = {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: TimeEntryStatus;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
};
