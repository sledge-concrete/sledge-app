import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import type { JobDocument } from "@/lib/mock/types";
import { getEmployee } from "@/lib/mock/employees";

export function DocumentsTable({ docs }: { docs: JobDocument[] }) {
  if (!docs.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No documents yet.</p>;
  }
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filename</TableHead>
            <TableHead className="hidden sm:table-cell">Uploaded by</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="hidden md:table-cell">Size</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-medium">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {d.filename}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{getEmployee(d.uploadedBy)?.name ?? "—"}</TableCell>
              <TableCell className="hidden sm:table-cell">{d.uploadedAt}</TableCell>
              <TableCell className="hidden md:table-cell">{(d.sizeKb / 1024).toFixed(1)} MB</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
