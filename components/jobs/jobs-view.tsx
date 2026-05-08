"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import {
  type JobsApiItem,
  type JobStatus,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_RANK,
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
const DEFAULT_FILTERS: FilterState = { active: true, hold: true, completed: false };

export function JobsView({ initialJobs }: { initialJobs: JobsApiItem[] }) {
  const router = useRouter();
  const { role } = useRole();
  const isTablet = role === "tablet";

  const [jobs] = useState<JobsApiItem[]>(initialJobs);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
        <Badge variant="secondary" className="font-medium">
          {visibleJobs.length} {visibleJobs.length === 1 ? "job" : "jobs"}
        </Badge>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="relative h-[320px] w-full md:h-[400px]">
          <JobsMap jobs={visibleJobs} selectedId={selectedId} onSelect={handleSelectFromMap} />
        </div>
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
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                on
                  ? "border-foreground/15 bg-foreground/5 text-foreground"
                  : "border-border bg-transparent text-muted-foreground opacity-60 hover:opacity-100",
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

      <div className="overflow-hidden rounded-lg border bg-card">
        {visibleJobs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No jobs match the current filters.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#1a1a1a] [&_tr]:border-b-0">
              <TableRow className="hover:bg-[#1a1a1a]">
                <TableHead className="w-[28%] h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                  Job
                </TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 md:table-cell">
                  Number
                </TableHead>
                <TableHead className="h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                  Status
                </TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 sm:table-cell">
                  Crew
                </TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 lg:table-cell">
                  Client
                </TableHead>
                <TableHead className="hidden h-11 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 md:table-cell">
                  Address
                </TableHead>
                <TableHead className="h-11 text-right text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
                  Action
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
                        isSelected && "!bg-blue-50/60 outline outline-2 outline-blue-500 outline-offset-[-2px]",
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
                      <TableCell>
                        <Badge
                          className={cn(
                            STATUS_PILL_CLASS[job.status],
                            "font-medium uppercase tracking-[0.04em] text-[10px]",
                          )}
                        >
                          {STATUS_LABEL[job.status]}
                        </Badge>
                        {isSelected && (
                          <span className="ml-2 hidden text-[10px] uppercase tracking-wide text-blue-600 sm:inline">
                            On map
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        <span className="inline-flex items-center gap-1">
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
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardOpen(job.id);
                          }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {isTablet ? "Upload →" : "Open →"}
                        </button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="border-t-0 p-0">
                          <div className="border-t-2 border-b-2 border-border/40 bg-muted/30 px-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-border/25">
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-1">
                                  Job Number
                                </div>
                                <div className="text-sm font-medium">{job.number}</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-1">
                                  Client
                                </div>
                                <div className="text-sm">{job.client_name}</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-1">
                                  Status
                                </div>
                                <Badge
                                  className={cn(
                                    STATUS_PILL_CLASS[job.status],
                                    "font-medium uppercase tracking-[0.04em] text-[10px]",
                                  )}
                                >
                                  {STATUS_LABEL[job.status]}
                                </Badge>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-1">
                                  Crew
                                </div>
                                <div className="text-sm inline-flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {job.worker_count} workers
                                </div>
                              </div>
                            </div>
                            <div className="pt-4">
                              <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2">
                                Location
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                                <div>
                                  <div>{job.address}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Lat: {job.lat.toFixed(4)}, Lng: {job.lng.toFixed(4)}
                                  </div>
                                </div>
                              </div>
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
    </div>
  );
}
