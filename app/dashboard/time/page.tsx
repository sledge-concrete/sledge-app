import { Clock } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export default function TimePage() {
  return (
    <ModuleStub
      title="Time Tracking"
      description="Clock in/out, end-of-day entry, split shifts, time-off requests."
      icon={Clock}
      notes={[
        "Clock in / clock out card with current job picker",
        "End-of-day manual entry form",
        "Split-shift entry — multiple jobs in one day",
        "Time-off request form",
        "Approval inbox for supervisors",
      ]}
    />
  );
}
