"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import type { SafetySignOff } from "@/lib/mock/daily-reports";

interface SafetySectionProps {
  safety: SafetySignOff | null;
  isLocked: boolean;
}

export function SafetySection({ safety, isLocked }: SafetySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Safety</CardTitle>
      </CardHeader>
      <CardContent>
        {safety ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Hazards</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{safety.hazardsIdentified}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Controls</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{safety.controlsImplemented}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>Incidents</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-red-700">{safety.incidents}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span>Near Misses</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-700">{safety.nearMisses}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <Shield className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No safety data recorded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
