import { Calendar } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export default function SchedulePage() {
  return (
    <ModuleStub
      title="Scheduling"
      description="Weekly and daily views, task assignment, employee direction."
      icon={Calendar}
      notes={[
        "FullCalendar weekly + daily views",
        "Drag-and-drop task assignment per employee",
        "Per-employee 'today' view",
        "Job color-coding",
      ]}
    />
  );
}
