"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { CalendarDays, Clock, FileClock, LogIn, LogOut, Plus, Split, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { employees, getEmployee } from "@/lib/mock/employees";
import { jobs } from "@/lib/mock/jobs";
import { calculateEntryHours, getTodayDate } from "@/lib/mock/time";
import { useTimeTracking } from "./use-time-tracking";

const activeJobs = jobs.filter((job) => job.status === "active");
const assignableJobs = jobs.filter((job) => job.status !== "completed");
const defaultEmployeeId = employees.find((employee) => employee.role === "employee")?.id ?? employees[0]?.id ?? "";
const defaultJobId = activeJobs[0]?.id ?? jobs[0]?.id ?? "";
const timeOffTypes = ["Vacation", "Sick", "Personal"] as const;

type SplitRow = {
  id: string;
  jobId: string;
  startTime: string;
  endTime: string;
};

type TimeOffType = (typeof timeOffTypes)[number];

export function TimePageClient() {
  const { activeShifts, clockIn, clockOut, addEntry, addTimeOffRequest } = useTimeTracking();
  const [now, setNow] = useState(() => Date.now());
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId);
  const [clockJobId, setClockJobId] = useState(defaultJobId);
  const [lastClockOutHours, setLastClockOutHours] = useState<number | null>(null);
  const [manualValues, setManualValues] = useState({
    jobId: defaultJobId,
    date: getTodayDate(),
    startTime: "07:00",
    endTime: "15:30",
    breakMinutes: "30",
    notes: "",
  });
  const [splitDate, setSplitDate] = useState(getTodayDate());
  const [splitRows, setSplitRows] = useState<SplitRow[]>([
    { id: "split-1", jobId: defaultJobId, startTime: "07:00", endTime: "11:30" },
    { id: "split-2", jobId: assignableJobs[1]?.id ?? defaultJobId, startTime: "12:00", endTime: "15:30" },
  ]);
  const [timeOffType, setTimeOffType] = useState<TimeOffType>("Vacation");
  const [timeOffValues, setTimeOffValues] = useState({
    startDate: getTodayDate(),
    endDate: getTodayDate(),
    reason: "",
  });

  const activeShift = activeShifts.find((shift) => shift.employeeId === employeeId);
  const manualHours = calculateHours(manualValues.startTime, manualValues.endTime, Number(manualValues.breakMinutes) || 0);
  const splitTotalHours = splitRows.reduce((sum, row) => sum + calculateHours(row.startTime, row.endTime, 0), 0);
  const timeOffDuration = calculateDateDuration(timeOffValues.startDate, timeOffValues.endDate);
  const runningSeconds = activeShift ? calculateElapsedSeconds(activeShift.clockedInAt, now) : null;
  const clockStatus = activeShift ? "Clocked In" : lastClockOutHours === null ? "Ready" : "Clocked Out";
  const clockDetail = activeShift
    ? `Job locked to ${getJobName(activeShift.jobId)}`
    : lastClockOutHours === null
      ? "Select a job site to start"
      : "Last shift elapsed hours";
  const clockValue = activeShift ? formatDuration(runningSeconds ?? 0) : lastClockOutHours === null ? "0.00h" : `${lastClockOutHours.toFixed(2)}h`;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const employeeLabel = useMemo(() => {
    const employee = getEmployee(employeeId);
    return employee ? `${employee.name} / ${employee.role}` : "Unknown employee";
  }, [employeeId]);

  function handleClockSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeShift) {
      setLastClockOutHours(calculateElapsedHours(activeShift.clockedInAt, Date.now()));
      void clockOut(activeShift.id);
      return;
    }

    setLastClockOutHours(null);
    void clockIn(employeeId, clockJobId);
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void addEntry({
      employeeId,
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
      void addEntry({
        employeeId,
        jobId: row.jobId,
        date: splitDate,
        startTime: row.startTime,
        endTime: row.endTime,
        breakMinutes: 0,
        notes: `Split shift segment ${index + 1}`,
        source: "split",
      });
    });
  }

  function handleTimeOffSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = timeOffValues.reason.trim();

    void addTimeOffRequest({
      employeeId,
      startDate: timeOffValues.startDate,
      endDate: timeOffValues.endDate,
      reason: `${timeOffType}: ${reason}`,
    });
    setTimeOffValues((current) => ({ ...current, reason: "" }));
  }

  function updateSplitRow(rowId: string, values: Partial<SplitRow>) {
    setSplitRows((current) => current.map((row) => (row.id === rowId ? { ...row, ...values } : row)));
  }

  function addSplitRow() {
    setSplitRows((current) => [
      ...current,
      { id: `split-${Date.now()}`, jobId: defaultJobId, startTime: "15:30", endTime: "17:00" },
    ]);
  }

  function removeSplitRow(rowId: string) {
    setSplitRows((current) => (current.length === 1 ? current : current.filter((row) => row.id !== rowId)));
  }

  return (
    <div>
      <PageHeader title="Time Tracking" description="Clock activity, daily entries, split shifts, and time-off requests." />

      <div className="mx-auto max-w-3xl space-y-4">
        <section className="sticky top-3 z-20 rounded-md border bg-card/95 p-4 shadow-sm backdrop-blur">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] md:items-end">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">Logged-in Employee</div>
              <div className="mt-2 text-xl font-semibold">{employeeLabel}</div>
            </div>
            <Field label="Employee">
              <Select value={employeeId} onValueChange={setEmployeeId}>
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
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Clock In / Out
            </CardTitle>
            <CardDescription>Start or finish a live shift for the selected employee.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleClockSubmit} className="space-y-4">
              <Field label="Job Site">
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

              <StatusBar
                active={!!activeShift}
                status={clockStatus}
                detail={clockDetail}
                value={clockValue}
              />

              <Button type="submit" size="lg" className="min-h-12 w-full text-base">
                {activeShift ? <LogOut className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
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
            <CardDescription>Submit a completed shift for review.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <Field label="Job Site">
                <Select value={manualValues.jobId} onValueChange={(value) => setManualValues((current) => ({ ...current, jobId: value }))}>
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

              <div className="grid gap-3 sm:grid-cols-2">
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
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Start Time">
                  <Input
                    type="time"
                    value={manualValues.startTime}
                    onChange={(event) => setManualValues((current) => ({ ...current, startTime: event.target.value }))}
                    className="min-h-11"
                    required
                  />
                </Field>
                <Field label="End Time">
                  <Input
                    type="time"
                    value={manualValues.endTime}
                    onChange={(event) => setManualValues((current) => ({ ...current, endTime: event.target.value }))}
                    className="min-h-11"
                    required
                  />
                </Field>
              </div>

              <HoursBar label="Calculated Hours" value={`${manualHours.toFixed(2)}h`} />

              <Field label="Notes">
                <Textarea
                  value={manualValues.notes}
                  onChange={(event) => setManualValues((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Work completed, delays, materials, or corrections."
                />
              </Field>

              <Button type="submit" size="lg" className="min-h-11 w-full">
                Submit Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Split className="h-5 w-5 text-primary" />
              Split Shift
            </CardTitle>
            <CardDescription>Record one continuous day across multiple job sites.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSplitSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <Field label="Date">
                  <Input type="date" value={splitDate} onChange={(event) => setSplitDate(event.target.value)} className="min-h-11" required />
                </Field>
                <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm font-medium">
                  Total <span className="ml-2 text-lg">{splitTotalHours.toFixed(2)}h</span>
                </div>
              </div>

              <div>
                {splitRows.map((row, index) => (
                  <div key={row.id}>
                    <div className="rounded-md border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-medium">Job Block {index + 1}</div>
                        {index > 0 && (
                          <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove job block" onClick={() => removeSplitRow(row.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="mt-3 space-y-3">
                        <Field label="Job Site">
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
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Start Time">
                            <Input
                              type="time"
                              value={row.startTime}
                              onChange={(event) => updateSplitRow(row.id, { startTime: event.target.value })}
                              className="min-h-11"
                              required
                            />
                          </Field>
                          <Field label="End Time">
                            <Input
                              type="time"
                              value={row.endTime}
                              onChange={(event) => updateSplitRow(row.id, { endTime: event.target.value })}
                              className="min-h-11"
                              required
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                    {index < splitRows.length - 1 && <div className="mx-6 h-5 w-px bg-border" />}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="ghost" size="lg" className="min-h-11 justify-start" onClick={addSplitRow}>
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
            <CardDescription>Request time away for the selected employee.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTimeOffSubmit} className="space-y-4">
              <div className="grid grid-cols-3 rounded-md border bg-muted/30 p-1">
                {timeOffTypes.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={timeOffType === type ? "default" : "ghost"}
                    className="min-h-10"
                    onClick={() => setTimeOffType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="From">
                  <Input
                    type="date"
                    value={timeOffValues.startDate}
                    onChange={(event) => setTimeOffValues((current) => ({ ...current, startDate: event.target.value }))}
                    className="min-h-11"
                    required
                  />
                </Field>
                <Field label="To">
                  <Input
                    type="date"
                    value={timeOffValues.endDate}
                    onChange={(event) => setTimeOffValues((current) => ({ ...current, endDate: event.target.value }))}
                    className="min-h-11"
                    required
                  />
                </Field>
              </div>

              <HoursBar label="Duration" value={`${timeOffDuration} ${timeOffDuration === 1 ? "day" : "days"}`} />

              <Field label="Reason">
                <Textarea
                  value={timeOffValues.reason}
                  onChange={(event) => setTimeOffValues((current) => ({ ...current, reason: event.target.value }))}
                  placeholder="Reason or coverage notes."
                  required
                />
              </Field>

              <Button type="submit" size="lg" className="min-h-11 w-full">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBar({ active, status, detail, value }: { active: boolean; status: string; detail: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{status}</span>
          <span className="block truncate text-xs text-muted-foreground">{detail}</span>
        </span>
      </div>
      <span className="shrink-0 text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function HoursBar({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-4 py-3">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function getJobName(jobId: string) {
  return jobs.find((job) => job.id === jobId)?.name ?? "Unknown job";
}

function calculateHours(startTime: string, endTime: string, breakMinutes: number) {
  return calculateEntryHours({ startTime, endTime, breakMinutes });
}

function calculateElapsedSeconds(startedAt: string, endTime: number) {
  const started = new Date(startedAt).getTime();
  if (Number.isNaN(started) || endTime <= started) return 0;
  return Math.floor((endTime - started) / 1000);
}

function calculateElapsedHours(startedAt: string, endTime: number) {
  return Math.round((calculateElapsedSeconds(startedAt, endTime) / 60 / 60) * 100) / 100;
}

function calculateDateDuration(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T12:00:00`).getTime();
  const end = new Date(`${endDate}T12:00:00`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
