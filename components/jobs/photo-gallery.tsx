import { ImageIcon } from "lucide-react";
import type { JobPhoto } from "@/lib/mock/types";
import { getEmployee } from "@/lib/mock/employees";

export function PhotoGallery({ photos }: { photos: JobPhoto[] }) {
  if (!photos.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No photos yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((p) => (
        <figure key={p.id} className="overflow-hidden rounded-lg border bg-muted">
          <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <figcaption className="px-2 py-2 text-xs">
            <div className="truncate font-medium">{p.filename}</div>
            <div className="text-muted-foreground">
              {getEmployee(p.uploadedBy)?.name ?? "—"} · {p.uploadedAt}
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
