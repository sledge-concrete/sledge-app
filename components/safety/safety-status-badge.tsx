import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SafetyStatus } from "@/lib/flha-types";

const statusClass: Record<SafetyStatus, string> = {
  none: "border-slate-300 bg-white text-muted-foreground",
  started: "border-amber-300 bg-amber-50 text-amber-800",
  complete: "border-emerald-300 bg-emerald-50 text-emerald-800",
};

export function SafetyStatusBadge({ status, label }: { status: SafetyStatus; label: string }) {
  return (
    <Badge variant="outline" className={cn("h-7 rounded-lg px-3 text-sm font-semibold", statusClass[status])}>
      {label}
    </Badge>
  );
}
