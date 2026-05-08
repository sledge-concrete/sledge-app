import { MessageSquare } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export default function MessagesPage() {
  return (
    <ModuleStub
      title="Messaging"
      description="All-company thread, supervisor crew threads, owner read-all view."
      icon={MessageSquare}
      notes={[
        "Thread list (left) + message view (right) layout",
        "All-company channel pinned at top",
        "Crew threads — supervisor-created",
        "Owner read-all view across threads",
      ]}
    />
  );
}
