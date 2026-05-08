import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function ModuleStub({
  title,
  description,
  icon: Icon,
  notes,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  notes: string[];
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Icon className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="max-w-md text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Module shell — coming next iteration</p>
            <ul className="space-y-1 text-left">
              {notes.map((n) => (
                <li key={n} className="flex gap-2">
                  <span className="text-muted-foreground/60">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
