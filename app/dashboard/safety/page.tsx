import { ShieldCheck } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export default function SafetyPage() {
  return (
    <ModuleStub
      title="Safety Sign-off"
      description="Tablet-friendly safety sign-offs tied to a job."
      icon={ShieldCheck}
      notes={[
        "Sign-off form per job (today's hazards, PPE checklist)",
        "Digital signature capture",
        "List of completed sign-offs per job",
        "Accessible from tablet generic login",
      ]}
    />
  );
}
