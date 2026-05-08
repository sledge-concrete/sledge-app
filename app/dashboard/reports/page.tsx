import { ClipboardList } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export default function ReportsPage() {
  return (
    <ModuleStub
      title="Daily Supervisor Report"
      description="Weather, sign-ins, hours, incidents, supervisor notes, signature."
      icon={ClipboardList}
      notes={[
        "Weather snapshot card (auto from location)",
        "Employee sign-in list per job",
        "Hours summary table",
        "Incident log entries",
        "Supervisor notes textarea",
        "Digital signature pad",
      ]}
    />
  );
}
