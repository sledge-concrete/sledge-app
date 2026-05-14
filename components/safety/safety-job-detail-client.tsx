"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronDown, ClipboardSignature, PenLine, Plus, Trash2, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlhaAssessmentForm, FlhaReadonlyAssessment } from "./flha-assessment";
import { FlhaPdfLink } from "./flha-pdf-link";
import { SafetyStatusBadge } from "./safety-status-badge";
import { SignatureFlow } from "./signature-flow";
import { useFlhaSessions } from "./use-flha-sessions";
import type { Job } from "@/lib/mock/types";
import { createFlhaSession, getJobSessions, getJobWorkers, getSessionStatus, getStatusLabel, getTodayDate, getTodaySession } from "@/lib/mock/flha";

export function SafetyJobDetailClient({ job }: { job: Job }) {
  const { sessions, addSession, addSignature, deleteSession } = useFlhaSessions();
  const [creating, setCreating] = useState(false);
  const [signatureWorkerId, setSignatureWorkerId] = useState<string | undefined>();
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | undefined>();
  const [deletingSessionId, setDeletingSessionId] = useState<string | undefined>();

  const workers = useMemo(() => getJobWorkers(job.id), [job.id]);
  const jobSessions = useMemo(() => getJobSessions(sessions, job.id), [sessions, job.id]);
  const todaySession = getTodaySession(sessions, job.id);
  const todayDate = getTodayDate();
  const status = getSessionStatus(todaySession);
  const previousSessions = jobSessions.filter((session) => session.id !== todaySession?.id);

  return (
    <div className="space-y-5">
      <PageHeader
        title={job.name}
        description={`${job.number} · ${job.address}`}
        action={
          <Link href="/dashboard/safety" className={buttonVariants({ variant: "outline", size: "lg", className: "min-h-14 px-5 text-[1.75rem] leading-none" })}>
            <ArrowLeft className="h-4 w-4" />
            Safety
          </Link>
        }
      />

      <section className="rounded-lg border bg-card p-5">
        <Button
          type="button"
          size="lg"
          className="min-h-20 w-full gap-3 text-xl font-semibold sm:text-2xl"
          disabled={!!todaySession}
          onClick={() => setCreating(true)}
        >
          {todaySession ? <ClipboardSignature className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          {todaySession ? "Today's Safety Sign-Off Completed" : "New Safety Sign-Off"}
        </Button>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SafetyStatusBadge status={status} label={getStatusLabel(status, todaySession?.signatures.length ?? 0)} />
          <span className="text-sm text-muted-foreground">Daily FLHA for {formatSessionDate(todayDate)}</span>
        </div>
      </section>

      {!todaySession && creating && (
        <FlhaAssessmentForm
          workers={workers}
          defaults={{
            work_location: job.address,
            sr_number: job.number,
            work_crew: [],
            supervisor_name: "",
            supervisor_phone: "",
          }}
          onCancel={() => setCreating(false)}
          onSubmit={(values) => {
            addSession(createFlhaSession(job.id, values));
            setCreating(false);
            window.setTimeout(() => {
              window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            }, 100);
          }}
        />
      )}


      <section className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="text-2xl font-medium">Safety Sheets</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/5 text-center justify-center">Date</TableHead>
              <TableHead className="w-1/5 text-center justify-center">Work Summary</TableHead>
              <TableHead className="w-1/5 text-center justify-center">Signatures</TableHead>
              <TableHead className="w-1/5 text-center justify-center">Status</TableHead>
              <TableHead className="w-1/5 text-center justify-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobSessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  No safety sheets yet.
                </TableCell>
              </TableRow>
            )}
            {jobSessions.map((session) => {
              const isExpanded = expandedHistoryId === session.id;
              const sessionStatus = getSessionStatus(session);
              const isToday = session.id === todaySession?.id;

              return (
                <Fragment key={session.id}>
                  <TableRow aria-expanded={isExpanded} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedHistoryId(isExpanded ? undefined : session.id)}>
                    <TableCell className="w-1/5 font-medium text-center">
                      <div className="flex items-center justify-center gap-2">
                        {formatSessionDate(session.session_date)}
                        {isToday && <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Today</span>}
                      </div>
                    </TableCell>
                    <TableCell className="w-1/5 max-w-[140px] truncate text-center">{session.job_description}</TableCell>
                    <TableCell className="w-1/5 text-center">
                      <span className="inline-flex items-center justify-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        {session.signatures.length} signed
                      </span>
                    </TableCell>
                    <TableCell className="w-1/5 text-center">
                      <div className="flex justify-center">
                        <SafetyStatusBadge status={sessionStatus} label={getStatusLabel(sessionStatus, session.signatures.length)} />
                      </div>
                    </TableCell>
                    <TableCell className="w-1/5">
                      <div className="flex justify-center">
                        <FlhaPdfLink session={session} />
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/20 p-6 whitespace-normal">
                        <div className="space-y-6">
                          <FlhaAssessmentForm
                            workers={workers}
                            defaults={{
                              work_location: session.work_location,
                              sr_number: session.sr_number,
                              work_crew: session.work_crew,
                              supervisor_name: session.supervisor_name,
                              supervisor_phone: session.supervisor_phone,
                              job_description: session.job_description,
                              hazards: session.hazards,
                              controls: session.controls,
                              other_hazards: session.other_hazards,
                              other_controls: session.other_controls,
                              comments: session.comments,
                            }}
                            onCancel={() => setExpandedHistoryId(undefined)}
                            onSubmit={(values) => {
                              const updatedSession = {
                                ...session,
                                ...values,
                                hazards: values.hazards,
                                controls: values.controls,
                              };
                              addSession(updatedSession);
                              setExpandedHistoryId(undefined);
                            }}
                          />
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="lg"
                              className="min-h-11 px-5 text-base gap-2"
                              onClick={() => setDeletingSessionId(session.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                          {isToday && (
                            <div className="border-t pt-6">
                              <h3 className="text-lg font-medium mb-4">Worker Signatures</h3>
                              <div className="space-y-3">
                                {workers
                                  .filter((worker) => session.work_crew.includes(worker.name))
                                  .map((worker) => {
                                    const signature = session.signatures.find((item) => item.employee_id === worker.id);
                                    return (
                                      <div key={worker.id} className="rounded-lg border bg-background p-3">
                                        <div className="flex items-center justify-between gap-3">
                                          <div>
                                            <div className="font-semibold">{worker.name}</div>
                                            <div className="text-xs capitalize text-muted-foreground">{worker.role}</div>
                                          </div>
                                          {signature ? (
                                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                                              <CheckCircle2 className="h-4 w-4" />
                                              Signed
                                            </span>
                                          ) : (
                                            <Button type="button" variant="outline" size="lg" className="min-h-11 px-4" onClick={() => setSignatureWorkerId(worker.id)}>
                                              <PenLine className="h-4 w-4" />
                                              Sign
                                            </Button>
                                          )}
                                        </div>
                                        {signature && (
                                          <div className="mt-3 rounded-lg bg-white p-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={signature.signature_data} alt={`${worker.name} signature`} className="h-16 w-full object-contain" />
                                            <div className="mt-1 text-center text-xs text-muted-foreground">{formatDateTime(signature.signed_at)}</div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </section>


      {todaySession && signatureWorkerId && (
        <SignatureFlow
          session={todaySession}
          workers={workers}
          initialWorkerId={signatureWorkerId}
          onClose={() => setSignatureWorkerId(undefined)}
          onSubmit={(input) => {
            addSignature({
              sessionId: todaySession.id,
              ...input,
            });
          }}
        />
      )}

      <Dialog open={!!deletingSessionId} onOpenChange={(open) => !open && setDeletingSessionId(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Safety Sheet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this safety sheet? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-11 px-5"
              onClick={() => setDeletingSessionId(undefined)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="min-h-11 px-5"
              onClick={() => {
                if (deletingSessionId) {
                  deleteSession(deletingSessionId);
                  setDeletingSessionId(undefined);
                  setExpandedHistoryId(undefined);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
  }).format(new Date(`${value}T12:00:00`));
}
