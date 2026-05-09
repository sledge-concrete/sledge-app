"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { JobsView } from "@/components/jobs/jobs-view";
import { CreateSiteDialog } from "@/components/create-site-dialog";
import type { JobsApiItem } from "@/lib/jobs-types";

export function JobsPageClient({ initialJobs }: { initialJobs: JobsApiItem[] }) {
  const [jobs, setJobs] = useState<JobsApiItem[]>(initialJobs);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSiteCreated = (newSite: JobsApiItem) => {
    setJobs((prev) => [newSite, ...prev]);
  };

  return (
    <div>
      <PageHeader
        title="Sites"
        description="Map view of every job site. Tap a pin or card to focus, double-tap to open."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New Site
          </Button>
        }
      />
      <JobsView initialJobs={jobs} />
      <CreateSiteDialog open={dialogOpen} onOpenChange={setDialogOpen} onSiteCreated={handleSiteCreated} />
    </div>
  );
}
