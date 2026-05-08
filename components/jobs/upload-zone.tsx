"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadZone({ jobName }: { jobName: string }) {
  const onDrop = useCallback(
    (files: File[]) => {
      if (!files.length) return;
      toast.success(`${files.length} file${files.length > 1 ? "s" : ""} attached to ${jobName}`, {
        description: "Mock upload — wiring to Supabase storage next.",
      });
    },
    [jobName],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-4 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/60",
        isDragActive && "border-primary bg-primary/5",
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">
        {isDragActive ? "Drop to attach" : "Drop files here or click to browse"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Files will be assigned to <span className="font-medium text-foreground">{jobName}</span>
      </p>
    </div>
  );
}
