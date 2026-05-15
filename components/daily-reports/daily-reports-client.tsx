"use client";

import { Fragment, type FormEvent, type ReactNode, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, CloudSun, Eye, FilePlus2, Search, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { employees } from "@/lib/mock/employees";
import { jobs } from "@/lib/mock/jobs";
import { getTodayDate } from "@/lib/mock/time";
import {
  createAggregateDailyReport,
  createEmptySafetyEntry,
  createFallbackWeather,
  getWorkedSiteSummariesForDate,
  type DailyAggregateReport,
  type DailyReportEmployeeSummary,
  type DailyReportSafetyEntry,
  type DailyReportSiteSummary,
  type WeatherSnapshot,
  type WorkedSiteSummary,
} from "@/lib/mock/daily-reports";
import { useFlhaSessions } from "@/components/safety/use-flha-sessions";
import { SignatureCanvas } from "./signature-canvas";
import { useDailyAggregateReports } from "./use-daily-aggregate-reports";
import { useTimeTracking } from "@/components/time/use-time-tracking";

type WeatherState = {
  loading: boolean;
  weather: WeatherSnapshot[] | null;
  error: boolean;
};

const reportPeople = employees.filter((employee) => employee.role === "admin" || employee.role === "supervisor");
const defaultSupervisorId = reportPeople[0]?.id ?? employees[0]?.id ?? "";
const reportTimes: WeatherSnapshot["time"][] = ["08:00", "12:00", "17:00"];

export function DailyReportsClient() {
  const { reports, upsertReport } = useDailyAggregateReports();
  const { entries, activeShifts } = useTimeTracking();
  const { sessions } = useFlhaSessions();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [dateFilter, setDateFilter] = useState("");
  const [supervisorId, setSupervisorId] = useState(defaultSupervisorId);
  const [overallProgressSummary, setOverallProgressSummary] = useState("");
  const [siteProgress, setSiteProgress] = useState<Record<string, string>>({});
  const [signatureData, setSignatureData] = useState("");
  const [weatherByJobId, setWeatherByJobId] = useState<Record<string, WeatherState>>({});
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const workedSites = useMemo(
    () => getWorkedSiteSummariesForDate({ date: selectedDate, entries, activeShifts }),
    [activeShifts, entries, selectedDate],
  );

  const employeePreview = useMemo(() => mergeEmployeeSummaries(workedSites.flatMap((site) => site.employeeSummary)), [workedSites]);

  const filteredReports = useMemo(
    () => reports.filter((report) => !dateFilter || report.date === dateFilter).sort((a, b) => b.date.localeCompare(a.date)),
    [dateFilter, reports],
  );

  function handleStartReport() {
    setOpen(true);
    void refreshWeather(selectedDate);
  }

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setSiteProgress({});
    setSignatureData("");
    void refreshWeather(date);
  }

  async function refreshWeather(date: string) {
    const sites = getWorkedSiteSummariesForDate({ date, entries, activeShifts });
    const loadingState = Object.fromEntries(
      sites.map((site) => [site.jobId, { loading: true, weather: null, error: false } satisfies WeatherState]),
    );
    setWeatherByJobId(loadingState);

    const results = await Promise.all(
      sites.map(async (site) => {
        const weather = await fetchWeatherForSite(site.jobId, date);
        return [site.jobId, weather] as const;
      }),
    );

    setWeatherByJobId(
      Object.fromEntries(
        results.map(([jobId, weather]) => [
          jobId,
          {
            loading: false,
            weather: weather ?? createFallbackWeather(),
            error: !weather,
          } satisfies WeatherState,
        ]),
      ),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (workedSites.length === 0) {
      window.alert("No worked sites were found for this date.");
      return;
    }
    if (!signatureData) {
      window.alert("Please sign the report before saving.");
      return;
    }

    const supervisor = employees.find((employee) => employee.id === supervisorId);
    const report = createAggregateDailyReport({
      date: selectedDate,
      supervisorId,
      overallProgressSummary: overallProgressSummary.trim(),
      siteSummaries: buildSiteSummaries(workedSites, weatherByJobId, siteProgress, selectedDate, sessions),
      signature: {
        dataUrl: signatureData,
        printedName: supervisor?.name ?? "Unknown",
        date: selectedDate,
      },
    });

    upsertReport(report);
    setOpen(false);
    setOverallProgressSummary("");
    setSiteProgress({});
    setSignatureData("");
    setExpandedReportId(report.id);
  }

  return (
    <div>
      <PageHeader
        title="Daily Reports"
        description="One signed report per day, generated from worked sites, crew time, weather, and safety records."
        action={
          <Button type="button" size="lg" className="min-h-12 px-5 text-base" onClick={handleStartReport}>
            <FilePlus2 className="h-5 w-5" />
            Generate Daily Report
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-end md:justify-between">
        <Field label="Filter by date">
          <div className="flex gap-2">
            <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="min-h-11" />
            {dateFilter && (
              <Button type="button" variant="outline" size="lg" className="min-h-11" onClick={() => setDateFilter("")}>
                Clear
              </Button>
            )}
          </div>
        </Field>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline" className="rounded-lg">
            {reports.length} total
          </Badge>
          <Badge className="rounded-lg border border-emerald-200 bg-emerald-100 text-emerald-800">
            {reports.filter((report) => report.status === "signed").length} signed
          </Badge>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        {filteredReports.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <Search className="h-8 w-8" />
            <p>No daily reports match the current filter.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#1a1a1a] [&_tr]:border-b-0">
              <TableRow className="hover:bg-[#1a1a1a]">
                <TableHead className="h-11 px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Date</TableHead>
                <TableHead className="h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Sites</TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 md:table-cell">Crew</TableHead>
                <TableHead className="h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Hours</TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 lg:table-cell">Supervisor</TableHead>
                <TableHead className="h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Status</TableHead>
                <TableHead className="h-11 px-4 text-right text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => {
                const expanded = expandedReportId === report.id;
                return (
                  <Fragment key={report.id}>
                    <TableRow>
                      <TableCell className="px-4 font-medium">{report.date}</TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="font-medium">
                          {report.siteCount} {report.siteCount === 1 ? "site" : "sites"}
                        </div>
                        <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {report.siteSummaries.map((site) => site.jobName).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{report.employeeCount}</TableCell>
                      <TableCell>{report.totalHours.toFixed(1)}h</TableCell>
                      <TableCell className="hidden lg:table-cell">{report.supervisorName}</TableCell>
                      <TableCell>
                        <Badge className="rounded-lg border border-emerald-200 bg-emerald-100 text-emerald-800">Signed</Badge>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="min-h-11"
                            onClick={() => setExpandedReportId(expanded ? null : report.id)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="bg-muted/30 p-0">
                          <ReportDetails report={report} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100vh-4rem)] max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-5xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b p-5">
              <DialogTitle className="text-2xl">Generate Daily Report</DialogTitle>
              <DialogDescription>
                Select a date, review the auto-filled information, add progress notes, and sign the report.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[calc(100vh-13rem)] overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Report Date">
                  <Input type="date" value={selectedDate} onChange={(event) => handleDateChange(event.target.value)} className="min-h-11" required />
                </Field>
                <Field label="Supervisor">
                  <Select value={supervisorId} onValueChange={(value) => value && setSupervisorId(value)}>
                    <SelectTrigger className="min-h-11 w-full bg-background px-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start" className="z-[60]">
                      {reportPeople.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="rounded-lg border bg-muted/40 p-3">
                  <div className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">Auto-filled</div>
                  <div className="mt-2 text-sm">
                    {workedSites.length} sites / {employeePreview.length} crew /{" "}
                    {workedSites.reduce((sum, site) => sum + site.totalHours, 0).toFixed(1)}h
                  </div>
                </div>
              </div>

              {workedSites.length === 0 ? (
                <div className="mt-5 rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
                  No time entries or active clock-ins were found for this date.
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  <section className="rounded-lg border">
                    <div className="border-b px-4 py-3">
                      <h3 className="text-lg font-medium">Progress Summary</h3>
                    </div>
                    <div className="space-y-4 p-4">
                      <Field label="Overall Progress">
                        <Textarea
                          value={overallProgressSummary}
                          onChange={(event) => setOverallProgressSummary(event.target.value)}
                          placeholder="Overall progress, blockers, materials, inspections, and next steps for the day."
                          className="min-h-28"
                          required
                        />
                      </Field>
                      <div className="grid gap-4 lg:grid-cols-2">
                        {workedSites.map((site) => (
                          <Field key={site.jobId} label={site.jobName}>
                            <Textarea
                              value={siteProgress[site.jobId] ?? ""}
                              onChange={(event) => setSiteProgress((current) => ({ ...current, [site.jobId]: event.target.value }))}
                              placeholder="Site-specific progress notes."
                              required
                            />
                          </Field>
                        ))}
                      </div>
                    </div>
                  </section>

                  <AutoFilledPreview
                    workedSites={workedSites}
                    employeePreview={employeePreview}
                    weatherByJobId={weatherByJobId}
                    selectedDate={selectedDate}
                    safetyByJobId={Object.fromEntries(
                      workedSites.map((site) => [site.jobId, getSafetyEntry(site.jobId, selectedDate, sessions)]),
                    )}
                  />

                  <section className="rounded-lg border">
                    <div className="border-b px-4 py-3">
                      <h3 className="text-lg font-medium">Supervisor Sign-Off</h3>
                    </div>
                    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                      <div>
                        <Label className="mb-2">Signature</Label>
                        <SignatureCanvas onSignatureChange={setSignatureData} isLocked={false} />
                      </div>
                      <div className="rounded-lg border bg-muted/40 p-4">
                        <div className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">Printed Name</div>
                        <p className="mt-2 text-lg font-medium">{employees.find((employee) => employee.id === supervisorId)?.name}</p>
                        <p className="mt-2 text-sm sledge-meta">Signing saves this daily report as signed immediately.</p>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>

            <DialogFooter className="mx-0 mb-0 px-5 py-4">
              <Button type="button" variant="outline" size="lg" className="min-h-11" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="lg" className="min-h-11" disabled={workedSites.length === 0 || !signatureData}>
                <CheckCircle2 className="h-4 w-4" />
                Sign & Save Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AutoFilledPreview({
  workedSites,
  employeePreview,
  weatherByJobId,
  selectedDate,
  safetyByJobId,
}: {
  workedSites: WorkedSiteSummary[];
  employeePreview: DailyReportEmployeeSummary[];
  weatherByJobId: Record<string, WeatherState>;
  selectedDate: string;
  safetyByJobId: Record<string, DailyReportSafetyEntry>;
}) {
  return (
    <section className="rounded-lg border">
      <div className="border-b px-4 py-3">
        <h3 className="text-lg font-medium">Auto-Filled Report Data</h3>
      </div>
      <div className="space-y-5 p-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4 text-primary" />
            Worked Sites / {selectedDate}
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-3">Site</TableHead>
                  <TableHead>Crew</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead className="hidden md:table-cell">Safety</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workedSites.map((site) => {
                  const safety = safetyByJobId[site.jobId] ?? createEmptySafetyEntry(site.jobId);
                  return (
                    <TableRow key={site.jobId}>
                      <TableCell className="px-3 whitespace-normal">
                        <div className="font-medium">{site.jobName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{site.projectNumber}</div>
                      </TableCell>
                      <TableCell>{site.employeeCount}</TableCell>
                      <TableCell>{site.totalHours.toFixed(1)}h</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {safety.status === "none" ? "No FLHA" : `${safety.signatures} signatures`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            Employee Summary
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-3">Employee</TableHead>
                  <TableHead className="hidden md:table-cell">Sites</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeePreview.map((employee) => (
                  <TableRow key={employee.employeeId}>
                    <TableCell className="px-3 font-medium">{employee.name}</TableCell>
                    <TableCell className="hidden whitespace-normal md:table-cell">
                      {employee.sites.map((site) => `${site.jobName} (${site.hoursWorked.toFixed(1)}h)`).join(", ")}
                    </TableCell>
                    <TableCell>{employee.totalHours.toFixed(1)}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {workedSites.map((site) => (
            <div key={site.jobId} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium">{site.jobName}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{site.address}</p>
                </div>
                <Badge variant="outline" className="rounded-lg">
                  {site.totalHours.toFixed(1)}h
                </Badge>
              </div>
              <WeatherPreview weatherState={weatherByJobId[site.jobId]} />
              <SafetyPreview safety={safetyByJobId[site.jobId] ?? createEmptySafetyEntry(site.jobId)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WeatherPreview({ weatherState }: { weatherState?: WeatherState }) {
  if (!weatherState || weatherState.loading) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <CloudSun className="h-4 w-4" />
        Loading weather from API...
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <CloudSun className="h-4 w-4 text-primary" />
        Weather {weatherState.error && <span className="text-xs text-muted-foreground">(fallback)</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {(weatherState.weather ?? createFallbackWeather()).map((snapshot) => (
          <div key={snapshot.time} className="rounded-lg bg-muted/50 p-2 text-xs">
            <div className="font-medium">{snapshot.time}</div>
            <div className="mt-1">{snapshot.temp} C</div>
            <div className="text-muted-foreground">{snapshot.precip}mm / {snapshot.wind}km/h / {snapshot.humidity}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SafetyPreview({ safety }: { safety: DailyReportSafetyEntry }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Safety
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-muted/50 p-2">
          <div className="text-muted-foreground">Status</div>
          <div className="mt-1 font-medium">{safety.status === "none" ? "No FLHA" : safety.status}</div>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <div className="text-muted-foreground">Signed</div>
          <div className="mt-1 font-medium">{safety.signatures}</div>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <div className="text-muted-foreground">Hazards</div>
          <div className="mt-1 font-medium">{safety.hazardsIdentified}</div>
        </div>
      </div>
    </div>
  );
}

function ReportDetails({ report }: { report: DailyAggregateReport }) {
  return (
    <div className="space-y-5 p-4">
      <div>
        <div className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">Overall Progress</div>
        <p className="mt-2 whitespace-pre-wrap text-sm">{report.overallProgressSummary}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {report.siteSummaries.map((site) => (
          <div key={site.jobId} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-medium">{site.jobName}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{site.projectNumber}</p>
              </div>
              <Badge variant="outline" className="rounded-lg">
                {site.totalHours.toFixed(1)}h
              </Badge>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{site.progressSummary}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-muted/50 p-2">
                <div className="text-muted-foreground">Crew</div>
                <div className="mt-1 font-medium">{site.employeeCount}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <div className="text-muted-foreground">Safety</div>
                <div className="mt-1 font-medium">{site.safety.status === "none" ? "No FLHA" : site.safety.signatures}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <div className="text-muted-foreground">Weather</div>
                <div className="mt-1 font-medium">{site.weather[1]?.temp ?? site.weather[0]?.temp} C</div>
              </div>
            </div>
          </div>
        ))}
      </div>
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

function buildSiteSummaries(
  workedSites: WorkedSiteSummary[],
  weatherByJobId: Record<string, WeatherState>,
  siteProgress: Record<string, string>,
  date: string,
  sessions: { id: string; job_id: string; session_date: string; signatures: unknown[]; hazards: unknown[]; controls: unknown[] }[],
): DailyReportSiteSummary[] {
  return workedSites.map((site) => ({
    ...site,
    weather: weatherByJobId[site.jobId]?.weather ?? createFallbackWeather(),
    safety: getSafetyEntry(site.jobId, date, sessions),
    progressSummary: siteProgress[site.jobId]?.trim() ?? "",
  }));
}

function getSafetyEntry(
  jobId: string,
  date: string,
  sessions: { id: string; job_id: string; session_date: string; signatures: unknown[]; hazards: unknown[]; controls: unknown[] }[],
): DailyReportSafetyEntry {
  const session = sessions.find((item) => item.job_id === jobId && item.session_date === date);
  if (!session) return createEmptySafetyEntry(jobId);

  return {
    jobId,
    sessionId: session.id,
    status: session.signatures.length > 0 ? "complete" : "started",
    signatures: session.signatures.length,
    hazardsIdentified: session.hazards.length,
    controlsImplemented: session.controls.length,
    incidents: 0,
    nearMisses: 0,
  };
}

function mergeEmployeeSummaries(summaries: DailyReportEmployeeSummary[]) {
  const byEmployee = new Map<string, DailyReportEmployeeSummary>();

  summaries.forEach((summary) => {
    const current = byEmployee.get(summary.employeeId);
    if (!current) {
      byEmployee.set(summary.employeeId, summary);
      return;
    }

    byEmployee.set(summary.employeeId, {
      ...current,
      totalHours: current.totalHours + summary.totalHours,
      sites: [...current.sites, ...summary.sites],
    });
  });

  return [...byEmployee.values()]
    .map((summary) => ({
      ...summary,
      totalHours: roundHours(summary.totalHours),
      sites: summary.sites.map((site) => ({ ...site, hoursWorked: roundHours(site.hoursWorked) })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchWeatherForSite(jobId: string, date: string): Promise<WeatherSnapshot[] | null> {
  const job = jobs.find((item) => item.id === jobId);
  if (!job) return null;

  const endpoint = date < getTodayDate()
    ? "https://archive-api.open-meteo.com/v1/archive"
    : "https://api.open-meteo.com/v1/forecast";
  const params = new URLSearchParams({
    latitude: String(job.lat),
    longitude: String(job.lng),
    start_date: date,
    end_date: date,
    hourly: "temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timezone: "auto",
  });

  try {
    const response = await fetch(`${endpoint}?${params}`);
    if (!response.ok) return null;
    const data = (await response.json()) as WeatherApiResponse;
    if (!data.hourly?.time?.length) return null;

    return reportTimes.map((time) => readWeatherSnapshot(data, time));
  } catch {
    return null;
  }
}

type WeatherApiResponse = {
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    precipitation?: number[];
    wind_speed_10m?: number[];
    relative_humidity_2m?: number[];
  };
};

function readWeatherSnapshot(data: WeatherApiResponse, time: WeatherSnapshot["time"]): WeatherSnapshot {
  const hourly = data.hourly;
  const index = Math.max(0, hourly?.time?.findIndex((value) => value.endsWith(`T${time}`)) ?? 0);

  return {
    time,
    temp: Math.round(hourly?.temperature_2m?.[index] ?? 0),
    precip: roundHours(hourly?.precipitation?.[index] ?? 0),
    wind: Math.round(hourly?.wind_speed_10m?.[index] ?? 0),
    humidity: Math.round(hourly?.relative_humidity_2m?.[index] ?? 0),
  };
}

function roundHours(value: number) {
  return Math.round(value * 100) / 100;
}
