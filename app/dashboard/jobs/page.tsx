import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { jobs, documents, photos } from "@/lib/mock/jobs";
import { getEmployee } from "@/lib/mock/employees";
import { ArrowRight, MapPin, Plus, Search } from "lucide-react";

const statusClass = {
  active: "sledge-status-active",
  completed: "sledge-status-completed",
  "on-hold": "sledge-status-hold",
} as const;

export default function JobsPage() {
  return (
    <div>
      <PageHeader
        title="Jobs"
        description="All active and recent jobs. Tap a job for hours, documents, photos, and activity."
        action={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New Job
          </Button>
        }
      />
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search jobs..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => {
          const supervisor = getEmployee(job.supervisorId);
          const docCount = documents.filter((d) => d.jobId === job.id).length;
          const photoCount = photos.filter((p) => p.jobId === job.id).length;
          return (
            <Card key={job.id} className="flex flex-col transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{job.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {job.address}
                    </CardDescription>
                  </div>
                  <Badge className={cn(statusClass[job.status], "font-medium uppercase tracking-[0.04em] text-[10px]")}>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-muted p-3">
                    <div className="text-2xl font-medium text-foreground leading-none">{job.hoursLogged}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.04em] font-medium text-muted-foreground">hrs</div>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <div className="text-2xl font-medium text-foreground leading-none">{docCount}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.04em] font-medium text-muted-foreground">docs</div>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <div className="text-2xl font-medium text-foreground leading-none">{photoCount}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.04em] font-medium text-muted-foreground">photos</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Lead: {supervisor?.name ?? "—"}</span>
                  <span>{job.crew.length} crew</span>
                </div>
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  Open <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
