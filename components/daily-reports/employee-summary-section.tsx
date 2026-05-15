"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Truck } from "lucide-react";
import type { DailyReport } from "@/lib/mock/daily-reports";

interface EmployeeSummarySectionProps {
  summary: DailyReport["employeeSummary"];
  isLocked: boolean;
}

export function EmployeeSummarySection({ summary, isLocked }: EmployeeSummarySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Employee Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notes */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Notes</p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm text-gray-700">{summary.notes}</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Users className="h-4 w-4" />
              <span>On Site</span>
            </div>
            <p className="mt-2 text-xl font-bold">
              {summary.onSiteCount}/{summary.plannedCount}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Hours Logged</span>
            </div>
            <p className="mt-2 text-xl font-bold">
              {summary.attendance.reduce((sum, att) => sum + att.hoursWorked, 0)}h
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Truck className="h-4 w-4" />
              <span>Materials</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-700">Delivered</p>
          </div>
        </div>

        {/* Attendance Table */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Crew Attendance</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Role</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">Hours</th>
                </tr>
              </thead>
              <tbody>
                {summary.attendance.map((att, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">{att.name}</td>
                    <td className="px-3 py-2 text-gray-600">{att.role}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">{att.hoursWorked}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Materials */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Materials Delivered</p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm text-gray-700">{summary.materialsDelivered}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
