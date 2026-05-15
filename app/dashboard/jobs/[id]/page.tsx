import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, ChevronDown, Grid3x3, Clock, FileText, Image, TrendingUp } from "lucide-react";
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
import { ActivitySection } from "@/components/jobs/activity-section";
import { EmployeeHoursBreakdown } from "@/components/jobs/employee-hours-breakdown";
import { JobLocationMapWrapper } from "@/components/jobs/job-location-map-wrapper";

const statusClass = {
  active: "sledge-status-active",
  completed: "sledge-status-completed",
  hold: "sledge-status-hold",
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
            <h1 className="text-3xl font-medium tracking-tight md:text-4xl">{job.name}</h1>
            <Badge
              className="font-medium uppercase tracking-[0.04em] text-[8px] rounded-lg text-white"
              style={{
                backgroundColor: job.status === 'active' ? '#10b981' : job.status === 'hold' ? '#f59e0b' : '#6b7280'
              }}
            >
              {job.status}
            </Badge>
          </div>
          <p className="mt-1 flex items-center gap-1 text-base sledge-meta">
            <MapPin className="h-4 w-4" /> {job.address}
          </p>
          <p className="mt-1 text-sm sledge-meta">
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
        <div className="bg-[#2a2a2a] w-full flex justify-center py-4">
          <TabsList className="flex gap-8 bg-transparent border-0">
          <TabsTrigger value="overview" className="text-base rounded-full bg-transparent text-gray-400 data-[state=active]:!bg-[#c0392b] data-[state=active]:text-white data-[state=active]:scale-110 hover:!bg-[#c0392b] hover:text-white active:scale-95 transition-all duration-200 inline-flex items-center gap-2 px-4 py-2 data-[state=active]:px-5">
            <Grid3x3 className="h-5 w-5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="hours" className="text-base rounded-full bg-transparent text-gray-400 data-[state=active]:!bg-[#c0392b] data-[state=active]:text-white data-[state=active]:scale-110 hover:!bg-[#c0392b] hover:text-white active:scale-95 transition-all duration-200 inline-flex items-center gap-2 px-4 py-2">
            <Clock className="h-5 w-5" />
            Hours
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-base rounded-full bg-transparent text-gray-400 data-[state=active]:!bg-[#c0392b] data-[state=active]:text-white data-[state=active]:scale-110 hover:!bg-[#c0392b] hover:text-white active:scale-95 transition-all duration-200 inline-flex items-center gap-2 px-4 py-2">
            <FileText className="h-5 w-5" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="photos" className="text-base rounded-full bg-transparent text-gray-400 data-[state=active]:!bg-[#c0392b] data-[state=active]:text-white data-[state=active]:scale-110 hover:!bg-[#c0392b] hover:text-white active:scale-95 transition-all duration-200 inline-flex items-center gap-2 px-4 py-2">
            <Image className="h-5 w-5" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-base rounded-full bg-transparent text-gray-400 data-[state=active]:!bg-[#c0392b] data-[state=active]:text-white data-[state=active]:scale-110 hover:!bg-[#c0392b] hover:text-white active:scale-95 transition-all duration-200 inline-flex items-center gap-2 px-4 py-2">
            <TrendingUp className="h-5 w-5" />
            Activity
          </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid gap-4 md:grid-cols-2 auto-rows-max">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Crew on this job</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[supervisor, ...crew].filter(Boolean).map((m) => (
                    <li key={m!.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{m!.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-base">
                        <div className="font-medium">{m!.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {m!.id === job.supervisorId ? "Supervisor" : "Employee"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="h-fit">
              <CardContent className="pt-0 px-6 pb-6">
                <ActivitySection activities={jobActivity} />
              </CardContent>
            </Card>
          </div>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <JobLocationMapWrapper job={job} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hours by employee</CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeeHoursBreakdown currentJob={job} employees={employees} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <UploadZone jobName={job.name} />
          <DocumentsTable docs={jobDocs} />
        </TabsContent>

        <TabsContent value="photos" className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <UploadZone jobName={job.name} />
          <PhotoGallery photos={jobPhotos} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
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
