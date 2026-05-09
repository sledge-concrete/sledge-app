import { headers } from "next/headers";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { JobsView } from "@/components/jobs/jobs-view";
import { JobsPageClient } from "@/components/jobs/jobs-page-client";
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
  const initialJobs = await fetchJobs();

  return <JobsPageClient initialJobs={initialJobs} />;
}
