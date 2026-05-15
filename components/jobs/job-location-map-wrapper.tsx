"use client";

import dynamic from "next/dynamic";
import type { Job } from "@/lib/mock/types";

type Props = {
  job: Job;
};

const JobLocationMap = dynamic(() => import("./job-location-map").then((mod) => mod.JobLocationMap), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full rounded-lg bg-muted" />,
});

export function JobLocationMapWrapper({ job }: Props) {
  return <JobLocationMap job={job} />;
}
