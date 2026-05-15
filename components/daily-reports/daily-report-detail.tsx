"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Lock } from "lucide-react";
import type { DailyReport as Report } from "@/lib/mock/daily-reports";
import { WeatherSection } from "./weather-section";
import { ProgressSection } from "./progress-section";
import { EmployeeSummarySection } from "./employee-summary-section";
import { SafetySection } from "./safety-section";
import { SignOffSection } from "./sign-off-section";
import { PDFExportButton } from "./pdf-export-button";

interface DailyReportDetailProps {
  report: Report;
  supervisor?: any;
}

export function DailyReportDetail({ report, supervisor }: DailyReportDetailProps) {
  const [isLocked, setIsLocked] = useState(report.status === "signed");
  const [signature, setSignature] = useState(report.signature);
  const [printedName, setPrintedName] = useState(report.signature?.printedName || "");

  const handleSignSubmit = (signatureData: string) => {
    if (!signatureData || !printedName.trim()) {
      alert("Please provide both a signature and printed name.");
      return;
    }

    // TODO: persist to Supabase
    setSignature({
      dataUrl: signatureData,
      printedName: printedName.trim(),
      date: new Date().toISOString().split("T")[0],
    });
    setIsLocked(true);
  };

  const statusColor = isLocked
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : "bg-amber-100 text-amber-800 border-amber-200";
  const statusLabel = isLocked ? "Signed" : "Pending";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-[#2a2a2a] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{report.jobName}</h1>
              <Badge className={`border text-xs font-medium rounded ${statusColor}`}>{statusLabel}</Badge>
            </div>
            <p className="mt-2 text-base text-gray-300">{report.projectNumber}</p>
            <p className="mt-1 text-base text-gray-400">{report.company}</p>
            <p className="mt-3 text-base text-gray-300">
              Date: <span className="font-medium">{report.date}</span>
            </p>
            <p className="mt-1 text-base text-gray-300">
              Reported by: <span className="font-medium">{supervisor?.name || "Unknown"}</span>
            </p>
          </div>
          <PDFExportButton report={report} />
        </div>
      </div>

      {/* Weather Section */}
      <WeatherSection weather={report.weather} isLocked={isLocked} />

      {/* Progress Summary */}
      <ProgressSection summary={report.progressSummary} isLocked={isLocked} />

      {/* Employee Summary */}
      <EmployeeSummarySection summary={report.employeeSummary} isLocked={isLocked} />

      {/* Safety Section */}
      <SafetySection safety={report.safety} isLocked={isLocked} />

      {/* Sign-Off Section */}
      {!isLocked && (
        <SignOffSection
          signature={signature}
          printedName={printedName}
          onNameChange={setPrintedName}
          onSignatureSubmit={handleSignSubmit}
        />
      )}

      {/* Signature Display (if signed) */}
      {signature && isLocked && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sign-Off</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded border border-gray-200 p-4">
              <img src={signature.dataUrl} alt="Signature" className="h-24 object-contain" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Printed Name</p>
                <p className="font-medium">{signature.printedName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{signature.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Report locked and signed</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
