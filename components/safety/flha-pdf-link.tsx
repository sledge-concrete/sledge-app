"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FlhaPdfDocument } from "./flha-pdf-document";
import type { FlhaSession } from "@/lib/flha-types";

export function FlhaPdfLink({ session, label = "Export PDF" }: { session: FlhaSession; label?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!mounted) {
    return (
      <span className={buttonVariants({ variant: "outline", size: "lg", className: "min-h-11 px-4 opacity-70" })}>
        <FileDown className="h-4 w-4" />
        Export PDF
      </span>
    );
  }

  return (
    <PDFDownloadLink
      document={<FlhaPdfDocument session={session} />}
      fileName={`FLHA-${session.job_id}-${session.session_date}.pdf`}
      className={buttonVariants({ variant: "outline", size: "lg", className: "min-h-11 px-4" })}
    >
      {({ loading }) => (
        <>
          <FileDown className="h-4 w-4" />
          {loading ? "Preparing..." : label}
        </>
      )}
    </PDFDownloadLink>
  );
}
