import { Clock, FileUp, MessageSquare, ShieldCheck, LogOut } from "lucide-react";
import type { ActivityEntry } from "@/lib/mock/types";
import { getEmployee } from "@/lib/mock/employees";

const iconMap = {
  "clock-in": Clock,
  "clock-out": LogOut,
  upload: FileUp,
  note: MessageSquare,
  "sign-off": ShieldCheck,
};

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  if (!entries.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No activity yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {entries.map((e) => {
        const Icon = iconMap[e.type];
        return (
          <li key={e.id} className="flex gap-3 rounded-lg border p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm">
                <span className="font-medium">{getEmployee(e.actor)?.name ?? "—"}</span>
                <span className="ml-2 text-muted-foreground">{e.detail}</span>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(e.at).toLocaleString()}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
