"use client";

import { FormEvent, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileClock,
  LogIn,
  LogOut,
  Plus,
  Split,
  TimerReset,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { employees, getEmployee } from "@/lib/mock/employees";
import { jobs } from "@/lib/mock/jobs";
import { calculateEntryHours, getStatusLabel, getTodayDate } from "@/lib/mock/time";
import type { TimeEntry, TimeEntryStatus, TimeOffRequest } from "@/lib/time-types";
import { useTimeTracking } from "./use-time-tracking";

const activeJobs = jobs.filter((job) => job.status === "active");
const assignableJobs = jobs.filter((job) => job.status !== "completed");
const defaultEmployeeId = employees.find((employee) => employee.role === "employee")?.id ?? employees[0]?.id ?? "";
const defaultJobId = activeJobs[0]?.id ?? jobs[0]?.id ?? "";

type SplitRow = {
  id: string;
  jobId: string;
  startTime: string;
  endTime: string;
  breakMinutes: string;
};

export function TimePageClient() {
  const {
    activeShifts,
    entries,
    timeOffRequests,
    clockIn,
    clockOut,
    addEntry,
    addTimeOffRequest,
    reviewEntry,
    reviewTimeOffRequest,
  } = useTimeTracking();

  const [clockEmployeeId, setClockEmployeeId] = useState(defaultEmployeeId);
  const [clockJobId, setClockJobId] = useState(defaultJobId);
  const [manualValues, setManualValues] = useState({
    employeeId: defaultEmployeeId,
    jobId: defaultJobId,
    date: getTodayDate(),
    startTime: "07:00",
    endTime: "15:30",
    breakMinutes: "30",
    notes: "",
  });
  const [splitEmployeeId, setSplitEmployeeId] = useState(defaultEmployeeId);
  const [splitDate, setSplitDate] = useState(getTodayDate());
  const [splitRows, setSplitRows] = useState<SplitRow[]>([
    { id: "split-1", jobId: defaultJobId, startTime: "07:00", endTime: "11:30", breakMinutes: "15" },
    { id: "split-2", jobId: assignableJobs[1]?.id ?? defaultJobId, startTime: "12:00", endTime: "15:30", breakMinutes: "0" },
  ]);
  const [timeOffValues, setTimeOffValues] = useState({
    employeeId: defaultEmployeeId,
    startDate: getTodayDate(),
    endDate: getTodayDate(),
    reason: "",
  });

  const activeShift = activeShifts.find((shift) => shift.employeeId === clockEmployeeId);
  const todayEntries = entries.filter((entry) => entry.date === getTodayDate());
  const pendingEntries = entries.filter((entry) => entry.status === "pending");
  const pendingTimeOff = timeOffRequests.filter((request) => request.status === "pending");
  const todayHours = todayEntries.reduce((sum, entry) => sum + calculateEntryHours(entry), 0);

  const recentEntries = useMemo(
    () => [...entries].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 8),
    [entries],
  );

  function handleClockSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeShift) clockOut(activeShift.id);
    else clockIn(clockEmployeeId, clockJobId);
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addEntry({
      employeeId: manualValues.employeeId,
      jobId: manualValues.jobId,
      date: manualValues.date,
      startTime: manualValues.startTime,
      endTime: manualValues.endTime,
      breakMinutes: Number(manualValues.breakMinutes) || 0,
      notes: manualValues.notes,
      source: "manual",
    });
    setManualValues((current) => ({ ...current, notes: "" }));
  }

  function handleSplitSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    splitRows.forEach((row, index) => {
      addEntry({
        employeeId: splitEmployeeId,
        jobId: row.jobId,
        date: splitDate,
        startTime: row.startTime,
        endTime: row.endTime,
        breakMinutes: Number(row.breakMinutes) || 0,
        notes: `Split shift segment ${index + 1}`,
        source: "split",
      });
    });
  }

  function handleTimeOffSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addTimeOffRequest({
      employeeId: timeOffValues.employeeId,
      startDate: timeOffValues.startDate,
      endDate: timeOffValues.endDate,
      reason: timeOffValues.reason,
    });
    setTimeOffValues((current) => ({ ...current, reason: "" }));
  }

  function updateSplitRow(rowId: string, values: Partial<SplitRow>) {
    setSplitRows((current) => current.map((row) => (row.id === rowId ? { ...row, ...values } : row)));
  }

  function addSplitRow() {
    setSplitRows((current) => [
      ...current,
      { id: `split-${Date.now()}`, jobId: defaultJobId, startTime: "07:00", endTime: "15:30", breakMinutes: "0" },
    ]);
  }

  function removeSplitRow(rowId: string) {
    setSplitRows((current) => (current.length === 1 ? current : current.filter((row) => row.id !== rowId)));
  }

  return (
    <div>
      <PageHeader title="Time Tracking" description="Clock activity, daily entries, split shifts, time-off requests, and approvals." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Now" value={activeShifts.length} unit="active" icon={Clock} helper="clocked in" />
        <StatCard title="Today Hours" value={todayHours.toFixed(1)} unit="h" icon={TimerReset} helper="submitted today" />
        <StatCard title="Pending Time" value={pendingEntries.length} unit="pending" icon={FileClock} helper="awaiting approval" />
        <StatCard title="Time Off" value={pendingTimeOff.length} unit="request" icon={CalendarDays} helper="pending requests" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Clock In / Out
            </CardTitle>
            <CardDescription>Current job picker for live shifts.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleClockSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Employee">
                  <Select value={clockEmployeeId} onValueChange={setClockEmployeeId}>
                    <SelectTrigger className="min-h-11 w-full bg-background px-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start" className="z-[60]">
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Job">
                  <Select value={activeShift?.jobId ?? clockJobId} onValueChange={setClockJobId} disabled={!!activeShift}>
                    <SelectTrigger className="min-h-11 w-full bg-background px-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start" className="z-[60]">
                      {activeJobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="rounded-lg border bg-muted/40 p-4">
                {activeShift ? (
                  <div>
                    <Badge className="sledge-status-active rounded-lg uppercase tracking-[0.04em]">Clocked In</Badge>
                    <p className="mt-3 text-lg font-medium">{getJobName(activeShift.jobId)}</p>
                    <p className="mt-1 text-sm sledge-meta">Since {formatDateTime(activeShift.clockedInAt)}</p>
                  </div>
                ) : (
                  <div>
                    <Badge variant="outline" className="rounded-lg uppercase tracking-[0.04em]">
                      Ready
                    </Badge>
                    <p className="mt-3 text-lg font-medium">No active shift for {getEmployeeName(clockEmployeeId)}</p>
                    <p className="mt-1 text-sm sledge-meta">One active job per employee is allowed.</p>
                  </div>
                )}
              </div>

              <Button type="submit" size="lg" className="min-h-11 w-full">
                {activeShift ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                {activeShift ? "Clock Out" : "Clock In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileClock className="h-5 w-5 text-primary" />
              End-of-Day Entry
            </CardTitle>
            <CardDescription>Manual shift entry for review.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Employee">
                  <Select
                    value={manualValues.employeeId}
                    onValueChange={(value) => setManualValues((current) => ({ ...current, employeeId: value }))}
                  >
                    <SelectTrigger className="min-h-11 w-full bg-background px-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start" className="z-[60]">
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Job">
                  <Select
                    value={manualValues.jobId}
                    onValueChange={(value) => setManualValues((current) => ({ ...current, jobId: value }))}
                  >
                    <SelectTrigger className="min-h-11 w-full bg-background px-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start" className="z-[60]">
                      {assignableJobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Date">
                  <Input
                    type="date"
                    value={manualValues.date}
                    onChange={(event) => setManualValues((current) => ({ ...current, date: event.target.value }))}
                    className="min-h-11"
                    required
                  />
                </Field>
                <Field label="Break Minutes">
                  <Input
                    type="number"
                    min="0"
                    value={manualValues.breakMinutes}
                    onChange={(event) => setManualValues((current) => ({ ...current, breakMinutes: event.target.value }))}
                    className="min-h-11"
                    required
                  />
                </Field>
                <Field label="Start">
                  <Input
                    type="time"
                    value={manualValues.startTime}
                    onChange={(event) => setManualValues((current) => ({ ...current, startTime: event.target.value }))}
                    className="min-h-11"
                    required
                  />
                </Field>
                <Field label="End">
                  <Input
                    type="time"
                    value={manualValues.endTime}
                    onChange={(event) => setManualValues((current) => ({ ...current, endTime: event.target.value }))}
                    className="min-h-11"
                    required
                  />
                </Field>
              </div>
              <Field label="Notes">
                <Textarea
                  value={manualValues.notes}
                  onChange={(event) => setManualValues((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Work completed, delays, materials, or corrections."
                />
              </Field>
              <Button type="submit" size="lg" className="min-h-11">
                <Plus className="h-4 w-4" />
                Submit Entry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Split className="h-5 w-5 text-primary" />
              Split Shift
            </CardTitle>
            <CardDescription>Multiple jobs in one day for a single employee.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSplitSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Employee">
                  <Select value={splitEmployeeId} onValueChange={setSplitEmployeeId}>
                    <SelectTrigger className="min-h-11 w-full bg-background px-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start" className="z-[60]">
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Date">
                  <Input type="date" value={splitDate} onChange={(event) => setSplitDate(event.target.value)} className="min-h-11" required />
                </Field>
              </div>

              <div className="space-y-3">
                {splitRows.map((row, index) => (
                  <div key={row.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[minmax(180px,1fr)_120px_120px_120px_44px]">
                    <Field label={`Job ${index + 1}`}>
                      <Select value={row.jobId} onValueChange={(value) => updateSplitRow(row.id, { jobId: value })}>
                        <SelectTrigger className="min-h-11 w-full bg-background px-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start" className="z-[60]">
                          {assignableJobs.map((job) => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Start">
                      <Input
                        type="time"
                        value={row.startTime}
                        onChange={(event) => updateSplitRow(row.id, { startTime: event.target.value })}
                        className="min-h-11"
                        required
                      />
                    </Field>
                    <Field label="End">
                      <Input
                        type="time"
                        value={row.endTime}
                        onChange={(event) => updateSplitRow(row.id, { endTime: event.target.value })}
                        className="min-h-11"
                        required
                      />
                    </Field>
                    <Field label="Break">
                      <Input
                        type="number"
                        min="0"
                        value={row.breakMinutes}
                        onChange={(event) => updateSplitRow(row.id, { breakMinutes: event.target.value })}
                        className="min-h-11"
                        required
                      />
                    </Field>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" size="icon-lg" aria-label="Remove split row" onClick={() => removeSplitRow(row.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="lg" className="min-h-11" onClick={addSplitRow}>
                  <Plus className="h-4 w-4" />
                  Add Job
                </Button>
                <Button type="submit" size="lg" className="min-h-11">
                  Submit Split Shift
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
              Time-Off Request
            </CardTitle>
            <CardDescription>Simple request status for schedule planning.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTimeOffSubmit} className="space-y-4">
              <Field label="Employee">
                <Select
                  value={timeOffValues.employeeId}
                  onValueChange={(value) => setTimeOffValues((current) => ({ ...current, employeeId: value }))}
                >
                  <SelectTrigger className="min-h-11 w-full bg-background px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" className="z-[60]">
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Start Date">
                  <Input
                    type="date"
                    value={timeOffValues.startDate}
                    onChange={(event) => setTimeOffValues((current) => ({ ...current, startDate: event.target.value }))}
                    className="min-h-11"
                    required
                  />
                </Field>
                <Field label="End Date">
                  <Input
                    type="date"
                    value={timeOffValues.endDate}
                    onChange={(event) => setTimeOffValues((current) => ({ ...current, endDate: event.target.value }))}
                    className="min-h-11"
                    required
                  />
                </Field>
              </div>
              <Field label="Reason">
                <Textarea
                  value={timeOffValues.reason}
                  onChange={(event) => setTimeOffValues((current) => ({ ...current, reason: event.target.value }))}
                  placeholder="Reason or coverage notes."
                  required
                />
              </Field>
              <Button type="submit" size="lg" className="min-h-11">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ApprovalInbox
          pendingEntries={pendingEntries}
          pendingTimeOff={pendingTimeOff}
          onReviewEntry={reviewEntry}
          onReviewTimeOff={reviewTimeOffRequest}
        />
        <RecentEntries entries={recentEntries} />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  helper,
  unit,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  helper: string;
  unit: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="relative">
      <div className="absolute top-4 right-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <CardHeader className="space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-[0.04em] text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-2 text-5xl font-medium leading-none">{value} <span className="text-lg">{unit}</span></div>
        <p className="mt-3 text-base sledge-meta">{helper}</p>
      </CardContent>
    </Card>
  );
}

function ApprovalInbox({
  pendingEntries,
  pendingTimeOff,
  onReviewEntry,
  onReviewTimeOff,
}: {
  pendingEntries: TimeEntry[];
  pendingTimeOff: TimeOffRequest[];
  onReviewEntry: (entryId: string, status: "approved" | "declined", reviewedBy?: string) => void;
  onReviewTimeOff: (requestId: string, status: "approved" | "declined", reviewedBy?: string) => void;
}) {
  const hasPending = pendingEntries.length > 0 || pendingTimeOff.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approval Inbox</CardTitle>
        <CardDescription>Pending time entries and requests.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {!hasPending ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            No pending approvals.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#1a1a1a] [&_tr]:border-b-0">
              <TableRow className="hover:bg-[#1a1a1a]">
                <TableHead className="h-11 px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Item</TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 md:table-cell">Detail</TableHead>
                <TableHead className="h-11 px-4 text-right text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="px-4 whitespace-normal">
                    <div className="font-medium">{getEmployeeName(entry.employeeId)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{entry.date}</div>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal text-sm md:table-cell">
                    {getJobName(entry.jobId)} / {entry.startTime}-{entry.endTime} / {calculateEntryHours(entry)}h
                  </TableCell>
                  <TableCell className="px-4">
                    <ReviewActions onApprove={() => onReviewEntry(entry.id, "approved")} onDecline={() => onReviewEntry(entry.id, "declined")} />
                  </TableCell>
                </TableRow>
              ))}
              {pendingTimeOff.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="px-4 whitespace-normal">
                    <div className="font-medium">{getEmployeeName(request.employeeId)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Time off</div>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal text-sm md:table-cell">
                    {request.startDate} to {request.endDate}
                  </TableCell>
                  <TableCell className="px-4">
                    <ReviewActions
                      onApprove={() => onReviewTimeOff(request.id, "approved")}
                      onDecline={() => onReviewTimeOff(request.id, "declined")}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function RecentEntries({ entries }: { entries: TimeEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Entries</CardTitle>
        <CardDescription>Latest submitted time records.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-[#1a1a1a] [&_tr]:border-b-0">
            <TableRow className="hover:bg-[#1a1a1a]">
              <TableHead className="h-11 px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Employee</TableHead>
              <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 lg:table-cell">Job</TableHead>
              <TableHead className="h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Hours</TableHead>
              <TableHead className="h-11 px-4 text-right text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="px-4 whitespace-normal">
                  <div className="font-medium">{getEmployeeName(entry.employeeId)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {entry.date} / {entry.startTime}-{entry.endTime}
                  </div>
                </TableCell>
                <TableCell className="hidden whitespace-normal text-sm lg:table-cell">{getJobName(entry.jobId)}</TableCell>
                <TableCell>{calculateEntryHours(entry)}h</TableCell>
                <TableCell className="px-4 text-right">
                  <StatusBadge status={entry.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ReviewActions({ onApprove, onDecline }: { onApprove: () => void; onDecline: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" size="icon-lg" aria-label="Approve" onClick={onApprove}>
        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
      </Button>
      <Button type="button" variant="outline" size="icon-lg" aria-label="Decline" onClick={onDecline}>
        <XCircle className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

function StatusBadge({ status }: { status: TimeEntryStatus }) {
  if (status === "approved") {
    return <Badge className="rounded-lg border border-emerald-200 bg-emerald-100 text-emerald-800">{getStatusLabel(status)}</Badge>;
  }
  if (status === "declined") {
    return <Badge className="rounded-lg border border-red-200 bg-red-100 text-red-800">{getStatusLabel(status)}</Badge>;
  }
  return <Badge className="rounded-lg border border-amber-200 bg-amber-100 text-amber-800">{getStatusLabel(status)}</Badge>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}


function getEmployeeName(employeeId: string) {
  return getEmployee(employeeId)?.name ?? "Unknown";
}

function getJobName(jobId: string) {
  return jobs.find((job) => job.id === jobId)?.name ?? "Unknown job";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
