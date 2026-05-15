import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { jobs } from "@/lib/mock/jobs";
import { UploadZone } from "@/components/jobs/upload-zone";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.id }));
}

export default async function JobUploadPage(props: PageProps<"/dashboard/jobs/[id]/upload">) {
  const { id } = await props.params;
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/jobs"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-3 -ml-2 inline-flex")}
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> All Jobs
      </Link>

      <div className="mb-4">
        <h1 className="text-2xl font-medium tracking-tight md:text-3xl">{job.name}</h1>
        <p className="mt-1 text-xs sledge-meta">#{job.number} · {job.client_name}</p>
        <p className="mt-1 flex items-center gap-1 text-sm sledge-meta">
          <MapPin className="h-4 w-4" /> {job.address}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload photos &amp; documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadZone jobName={job.name} />
          <p className="text-xs text-muted-foreground">
            Tablet sign-in. Files attach to this job. Supervisors/owners see full job profile from
            their personal sign-in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
