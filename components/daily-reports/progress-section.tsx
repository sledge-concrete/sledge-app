"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressSectionProps {
  summary: string;
  isLocked: boolean;
}

export function ProgressSection({ summary, isLocked }: ProgressSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Progress Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-sm text-gray-700">{summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
