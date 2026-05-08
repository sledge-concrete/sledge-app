import { headers } from "next/headers";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { JobsView } from "@/components/jobs/jobs-view";
import type { JobsApiItem } from "@/lib/jobs-types";

async function fetchJobs(): Promise<JobsApiItem[]> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/jobs`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load jobs");
  return res.json();
}

export default async function JobsPage() {
  const jobs = await fetchJobs();

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Map view of every job site. Tap a pin or card to focus, double-tap to open."
        action={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New Job
          </Button>
        }
      />
      <JobsView initialJobs={jobs} />
    </div>
  );
}
