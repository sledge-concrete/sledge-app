"use client";

import Link from "next/link";
import { ClipboardCheck, History, MapPin, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { SafetyStatusBadge } from "./safety-status-badge";
import { useFlhaSessions } from "./use-flha-sessions";
import { getSessionStatus, getStatusLabel, getSafetyJobs, getTodaySession } from "@/lib/mock/flha";

export function SafetyDashboardClient() {
  const { sessions } = useFlhaSessions();
  const safetyJobs = getSafetyJobs();

  return (
    <div>
      <PageHeader
        title="Safety Sign-off"
        description="Daily Field Level Hazard Assessment sign-offs by job site."
        action={
          <Link href="/dashboard/safety/review" className={buttonVariants({ variant: "outline", size: "lg", className: "!h-14 !px-8 !text-lg" })}>
            <ClipboardCheck className="h-6 w-6" />
            Review
          </Link>
        }
      />

      <h3 className="mb-6 text-xl font-semibold text-slate-900">Active Sites</h3>

      <div className="grid gap-4 lg:grid-cols-3">
        {safetyJobs.map((job) => {
          const todaySession = getTodaySession(sessions, job.id);
          const status = getSessionStatus(todaySession);
          const signatures = todaySession?.signatures.length ?? 0;

          return (
            <Link
              key={job.id}
              href={`/dashboard/safety/${job.id}`}
              className="block min-h-56 rounded-lg border bg-card p-5 transition-colors active:bg-muted"
            >
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <SafetyStatusBadge status={status} label={getStatusLabel(status, signatures)} />
                </div>

                <div>
                  <h2 className="text-2xl font-medium leading-tight">{job.name}</h2>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">#{job.number}</p>
                </div>

                <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{job.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 shrink-0" />
                    <span>{todaySession ? `${signatures} signed today` : "Start today's assessment"}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
