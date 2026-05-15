"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search, Users, X, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { getEmployee } from "@/lib/mock/employees";
import type { Job } from "@/lib/mock/types";
import {
  type JobsApiItem,
  type JobStatus,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_RANK,
  STATUS_TEXT_COLOR,
} from "@/lib/jobs-types";

const JobsMap = dynamic(() => import("./jobs-map").then((m) => m.JobsMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

const STATUS_PILL_CLASS: Record<JobStatus, string> = {
  active: "sledge-status-active",
  hold: "sledge-status-hold",
  completed: "sledge-status-completed",
};

type FilterState = Record<JobStatus, boolean>;
const DEFAULT_FILTERS: FilterState = { active: true, hold: true, completed: true };

export function JobsView({ initialJobs }: { initialJobs: JobsApiItem[] }) {
  const router = useRouter();
  const { role } = useRole();
  const isTablet = role === "tablet";

  const [jobs] = useState<JobsApiItem[]>(initialJobs);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [crewModalId, setCrewModalId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  const visibleJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter((j) => filters[j.status])
      .filter((j) => {
        if (!q) return true;
        return (
          j.name.toLowerCase().includes(q) ||
          j.number.toLowerCase().includes(q) ||
          j.client_name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
  }, [jobs, filters, query]);

  useEffect(() => {
    if (selectedId && !visibleJobs.some((j) => j.id === selectedId)) {
      setSelectedId(null);
    }
  }, [visibleJobs, selectedId]);

  function toggleFilter(s: JobStatus) {
    setFilters((f) => ({ ...f, [s]: !f[s] }));
  }

  function handleSelectFromMap(id: string) {
    setSelectedId(id);
    const card = cardRefs.current.get(id);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleCardClick(id: string) {
    setSelectedId(id);
    setExpandedId(expandedId === id ? null : id);
  }

  function handleCardOpen(id: string) {
    if (isTablet) router.push(`/dashboard/jobs/${id}/upload`);
    else router.push(`/dashboard/jobs/${id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, number, or client..."
            className="pl-9"
          />
        </div>
        <Badge variant="secondary" className="font-medium rounded-lg">
          {visibleJobs.length} {visibleJobs.length === 1 ? "job" : "jobs"}
        </Badge>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card relative z-0">
        <div className="relative h-[320px] w-full md:h-[400px] z-0">
          <JobsMap jobs={visibleJobs} selectedId={selectedId} onSelect={handleSelectFromMap} />
        </div>
      </div>

      <div>
        <div className="text-sm uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2">
          Filter by status
        </div>
        <div className="flex flex-wrap gap-2">
          {(["active", "hold", "completed"] as JobStatus[]).map((s) => {
          const on = filters[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggleFilter(s)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                on
                  ? "border-foreground/15 bg-foreground/5 text-foreground"
                  : "border-slate-300 bg-transparent text-muted-foreground opacity-60 hover:opacity-100",
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[s] }}
                aria-hidden
              />
              {STATUS_LABEL[s]}
            </button>
          );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        {visibleJobs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No jobs match the current filters.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#1a1a1a] [&_tr]:border-b-0">
              <TableRow className="hover:bg-[#1a1a1a]">
                <TableHead className="w-[28%] h-11 px-6 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                  Job
                </TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 md:table-cell">
                  Number
                </TableHead>
                <TableHead className="h-11 text-center text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                  Status
                </TableHead>
                <TableHead className="hidden h-11 text-center text-sm font-semibold uppercase tracking-[0.08em] text-white/80 sm:table-cell">
                  Crew
                </TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 lg:table-cell">
                  Client
                </TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 md:table-cell">
                  Address
                </TableHead>
                <TableHead className="h-11 px-6 text-center text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                  Files
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleJobs.map((job) => {
                const isSelected = job.id === selectedId;
                const isExpanded = job.id === expandedId;
                return (
                  <React.Fragment key={job.id}>
                    <TableRow
                      ref={(el) => {
                        if (el) cardRefs.current.set(job.id, el);
                        else cardRefs.current.delete(job.id);
                      }}
                      onClick={() => handleCardClick(job.id)}
                      onDoubleClick={() => handleCardOpen(job.id)}
                      className={cn(
                        "cursor-pointer transition-colors border-b-border/30",
                        isExpanded && "bg-slate-200",
                      )}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform text-muted-foreground",
                              isExpanded && "rotate-180",
                            )}
                          />
                          <div>
                            <div className="truncate">{job.name}</div>
                            <div className="mt-0.5 truncate text-xs text-muted-foreground lg:hidden">
                              {job.client_name}
                            </div>
                            <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground md:hidden">
                              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                              <span className="line-clamp-1">{job.address}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                        #{job.number}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className="font-bold uppercase tracking-[0.04em] text-xs"
                          style={{ color: STATUS_TEXT_COLOR[job.status] }}
                        >
                          {STATUS_LABEL[job.status]}
                        </span>
                        {isSelected && (
                          <span className="ml-2 hidden text-[10px] uppercase tracking-wide text-blue-600 sm:inline">
                            On map
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-center text-sm text-muted-foreground sm:table-cell">
                        <span className="inline-flex items-center gap-1 justify-center">
                          <Users className="h-3 w-3" />
                          {job.worker_count}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-sm lg:table-cell">{job.client_name}</TableCell>
                      <TableCell className="hidden max-w-[280px] text-sm text-muted-foreground md:table-cell">
                        <span className="inline-flex items-start gap-1">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                          <span className="truncate">{job.address}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardOpen(job.id);
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          title="View job files"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="border-t-0 p-0">
                          <div className="border-t-2 border-b-2 border-slate-300/40 bg-muted/30 px-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-slate-300">
                              <div className="border-r border-slate-300 pr-4 pb-4 sm:pb-0 sm:border-b sm:border-r-0 lg:border-b-0 lg:border-r">
                                <div className="text-sm uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-1">
                                  Job Number
                                </div>
                                <div className="text-base font-medium">{job.number}</div>
                              </div>
                              <div className="border-r border-slate-300 pr-4 sm:pl-4 pb-4 sm:pb-0 sm:border-b sm:border-r-0 lg:border-b-0 lg:border-r lg:pr-4 lg:pl-0">
                                <div className="text-sm uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-1">
                                  Client
                                </div>
                                <div className="text-base">{job.client_name}</div>
                              </div>
                              <div className="border-r border-slate-300 pr-4 lg:pl-4">
                                <div className="text-sm uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-1">
                                  Status
                                </div>
                                <span
                                  className="font-bold uppercase tracking-[0.04em] text-sm"
                                  style={{ color: STATUS_TEXT_COLOR[job.status] }}
                                >
                                  {STATUS_LABEL[job.status]}
                                </span>
                              </div>
                              <div className="lg:pl-4">
                                <div className="text-sm uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-1">
                                  Crew
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setCrewModalId(job.id)}
                                  className="text-base inline-flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                                >
                                  <Users className="h-4 w-4" />
                                  {job.worker_count} workers
                                </button>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-b border-slate-300">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                                <div>
                                  <div className="text-sm uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2">
                                    Location
                                  </div>
                                  <div className="flex items-start gap-2 text-base">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                                    <div>{job.address}</div>
                                  </div>
                                </div>
                                {(job as Job).service_type && (
                                  <div>
                                    <div className="text-sm uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2">
                                      Service Type
                                    </div>
                                    <div className="text-base">{(job as Job).service_type}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {(job as Job).notes && (
                              <div className="pt-4 border-t border-slate-300">
                                <div className="text-sm uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2">
                                  Notes
                                </div>
                                <div className="text-base text-foreground leading-relaxed">{(job as Job).notes}</div>
                              </div>
                            )}
                            <div className="flex justify-end pt-3">
                              <Link
                                href={`/dashboard/jobs/${job.id}`}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-base font-medium rounded-lg bg-[#c0392b] text-white hover:bg-[#a93226] transition-colors"
                              >
                                View Full Job
                              </Link>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!crewModalId} onOpenChange={() => setCrewModalId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {jobs.find((j) => j.id === crewModalId)?.name || "Crew"}
            </DialogTitle>
          </DialogHeader>
          {crewModalId && (() => {
            const job = jobs.find((j) => j.id === crewModalId) as Job;
            const supervisor = getEmployee(job.supervisorId);
            const crewMembers = job.crew.map((id) => getEmployee(id)).filter(Boolean);
            return (
              <div className="space-y-3">
                {supervisor && (
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-300/40">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{supervisor.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{supervisor.name}</div>
                      <div className="text-xs text-muted-foreground">Supervisor</div>
                    </div>
                  </div>
                )}
                {crewMembers.map((member) => (
                  <div key={member?.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{member?.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{member?.name}</div>
                      <div className="text-xs text-muted-foreground">Employee</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
