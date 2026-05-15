"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignatureCanvas } from "./signature-canvas";
import { PenTool, Lock } from "lucide-react";
import type { DailyReportSignature } from "@/lib/mock/daily-reports";

interface SignOffSectionProps {
  signature: DailyReportSignature | null;
  printedName: string;
  onNameChange: (name: string) => void;
  onSignatureSubmit: (signatureData: string) => void;
}

export function SignOffSection({ signature, printedName, onNameChange, onSignatureSubmit }: SignOffSectionProps) {
  const [signatureData, setSignatureData] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!signatureData || !printedName.trim()) {
      alert("Please provide both a signature and printed name.");
      return;
    }

    setIsSubmitting(true);
    // Simulate async operation
    setTimeout(() => {
      onSignatureSubmit(signatureData);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Sign-Off
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Signature Canvas */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Signature</p>
          <div className="rounded-lg border border-gray-200 p-4">
            <SignatureCanvas onSignatureChange={setSignatureData} isLocked={false} />
            <p className="mt-2 text-xs text-gray-500">Draw your signature in the box above with your mouse or touch device</p>
          </div>
        </div>

        {/* Printed Name */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Printed Name</p>
          <input
            type="text"
            value={printedName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !signatureData || !printedName.trim()}
            className="flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit & Lock Report"}
          </Button>
          <p className="text-xs text-gray-500 leading-6">
            Once submitted, the report will be locked and cannot be edited.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
