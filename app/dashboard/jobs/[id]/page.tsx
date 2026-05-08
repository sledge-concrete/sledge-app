import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { jobs, documents, photos, activity } from "@/lib/mock/jobs";
import { getEmployee, employees } from "@/lib/mock/employees";
import { UploadZone } from "@/components/jobs/upload-zone";
import { DocumentsTable } from "@/components/jobs/documents-table";
import { PhotoGallery } from "@/components/jobs/photo-gallery";
import { ActivityFeed } from "@/components/jobs/activity-feed";

const statusClass = {
  active: "sledge-status-active",
  completed: "sledge-status-completed",
  "on-hold": "sledge-status-hold",
} as const;

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.id }));
}

export default async function JobProfilePage(props: PageProps<"/dashboard/jobs/[id]">) {
  const { id } = await props.params;
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  const supervisor = getEmployee(job.supervisorId);
  const crew = job.crew.map((cid) => getEmployee(cid)).filter(Boolean);
  const jobDocs = documents.filter((d) => d.jobId === job.id);
  const jobPhotos = photos.filter((p) => p.jobId === job.id);
  const jobActivity = activity.filter((a) => a.jobId === job.id);

  return (
    <div>
      <Link
        href="/dashboard/jobs"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-3 -ml-2 inline-flex")}
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> All Jobs
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium tracking-tight md:text-3xl">{job.name}</h1>
            <Badge className={cn(statusClass[job.status], "font-medium uppercase tracking-[0.04em] text-[10px]")}>{job.status}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm sledge-meta">
            <MapPin className="h-4 w-4" /> {job.address}
          </p>
          <p className="mt-1 text-xs sledge-meta">
            Started {job.startDate} · Lead: {supervisor?.name ?? "—"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Hours" value={job.hoursLogged.toString()} />
          <Stat label="Docs" value={jobDocs.length.toString()} />
          <Stat label="Photos" value={jobPhotos.length.toString()} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Crew on this job</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[supervisor, ...crew].filter(Boolean).map((m) => (
                    <li key={m!.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{m!.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{m!.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {m!.id === job.supervisorId ? "Supervisor" : "Employee"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed entries={jobActivity.slice(0, 4)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hours" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hours by employee</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {employees
                  .filter((e) => job.crew.includes(e.id) || e.id === job.supervisorId)
                  .map((e) => (
                    <li key={e.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="text-sm font-medium">{e.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(job.hoursLogged / (job.crew.length + 1))} hrs
                      </span>
                    </li>
                  ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Mock split. Real breakdown wires to Time Tracking module.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6 space-y-4">
          <UploadZone jobName={job.name} />
          <DocumentsTable docs={jobDocs} />
        </TabsContent>

        <TabsContent value="photos" className="mt-6 space-y-4">
          <UploadZone jobName={job.name} />
          <PhotoGallery photos={jobPhotos} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityFeed entries={jobActivity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <div className="text-3xl font-medium leading-none">{value}</div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[0.04em] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
