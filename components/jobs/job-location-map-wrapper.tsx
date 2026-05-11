"use client";

import { JobLocationMap } from "./job-location-map";
import type { Job } from "@/lib/mock/types";

type Props = {
  job: Job;
};

export function JobLocationMapWrapper({ job }: Props) {
  return <JobLocationMap job={job} />;
}
