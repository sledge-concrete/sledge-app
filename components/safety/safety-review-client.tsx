"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlhaReadonlyAssessment } from "./flha-assessment";
import { FlhaPdfLink } from "./flha-pdf-link";
import { useFlhaSessions } from "./use-flha-sessions";
import { getSafetyJob, getSafetyJobs } from "@/lib/mock/flha";

export function SafetyReviewClient() {
  const { sessions, markReviewed } = useFlhaSessions();
  const [jobFilter, setJobFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | undefined>();
  const safetyJobs = getSafetyJobs();

  const visibleSessions = [...sessions]
    .filter((session) => jobFilter === "all" || session.job_id === jobFilter)
    .filter((session) => !dateFilter || session.session_date === dateFilter)
    .sort((a, b) => b.session_date.localeCompare(a.session_date));

  return (
    <div>
      <PageHeader
        title="FLHA Review"
        description="Supervisor and admin review for all safety sign-off sessions."
        action={
          <Link href="/dashboard/safety" className={buttonVariants({ variant: "outline", size: "lg", className: "min-h-11 px-4" })}>
            <ArrowLeft className="h-4 w-4" />
            Safety
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <label className="space-y-1.5">
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.04em] text-muted-foreground">Job</span>
          <select
            value={jobFilter}
            onChange={(event) => setJobFilter(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All jobs</option>
            {safetyJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.04em] text-muted-foreground">Date</span>
          <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="min-h-11" />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        {visibleSessions.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <Search className="h-8 w-8" />
            <p>No FLHA sessions match the current filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#1a1a1a] [&_tr]:border-b-0">
              <TableRow className="hover:bg-[#1a1a1a]">
                <TableHead className="h-11 px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                  Job
                </TableHead>
                <TableHead className="h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">Date</TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 md:table-cell">
                  Completed By
                </TableHead>
                <TableHead className="h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                  Signed
                </TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 lg:table-cell">
                  Review
                </TableHead>
                <TableHead className="h-11 px-4 text-right text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleSessions.map((session) => {
                const job = getSafetyJob(session.job_id);
                const expanded = expandedId === session.id;
                return (
                  <Fragment key={session.id}>
                    <TableRow className="align-top">
                      <TableCell className="px-4 font-medium whitespace-normal">
                        <div>{job?.name ?? session.job_id}</div>
                        <div className="mt-1 text-xs text-muted-foreground md:hidden">{session.filled_by}</div>
                      </TableCell>
                      <TableCell>{session.session_date}</TableCell>
                      <TableCell className="hidden md:table-cell">{session.filled_by}</TableCell>
                      <TableCell>{session.signatures.length}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {session.reviewed_at ? (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            {session.reviewed_by}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex flex-col items-end gap-2 xl:flex-row xl:justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="min-h-11 px-4"
                            onClick={() => setExpandedId(expanded ? undefined : session.id)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="min-h-11 px-4"
                            disabled={!!session.reviewed_at}
                            onClick={() => markReviewed(session.id)}
                          >
                            Mark Reviewed
                          </Button>
                          <FlhaPdfLink session={session} />
                        </div>
                      </TableCell>
                    </TableRow>
                    {expanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="bg-muted/30 p-4">
                          <FlhaReadonlyAssessment session={session} />
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
    </div>
  );
}
