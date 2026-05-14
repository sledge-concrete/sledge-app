import { notFound } from "next/navigation";
import { SafetyJobDetailClient } from "@/components/safety/safety-job-detail-client";
import { getSafetyJob, SAFETY_JOB_IDS } from "@/lib/mock/flha";

export function generateStaticParams() {
  return SAFETY_JOB_IDS.map((jobId) => ({ jobId }));
}

export default async function SafetyJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = getSafetyJob(jobId);

  if (!job) notFound();

  return <SafetyJobDetailClient job={job} />;
}
