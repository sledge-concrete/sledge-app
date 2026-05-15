"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateDailyReportPDF } from "@/lib/pdf-generator";
import type { DailyReport } from "@/lib/mock/daily-reports";

interface PDFExportButtonProps {
  report: DailyReport;
}

export function PDFExportButton({ report }: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const filename = `sledge-report-${report.projectNumber}-${report.date}.pdf`;
      await generateDailyReportPDF(report, filename);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isGenerating} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Export to PDF"}
    </Button>
  );
}
