import { FileBarChart } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export default function PayrollPage() {
  return (
    <ModuleStub
      title="Payroll & Reporting"
      description="Generate reports filtered by employee, job, or pay period."
      icon={FileBarChart}
      notes={[
        "Filters: employee / job / pay period",
        "Summary table with totals",
        "Export to CSV / PDF",
        "Recharts breakdown by job + employee",
      ]}
    />
  );
}
