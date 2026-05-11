"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Employee } from "@/lib/mock/types";
import type { Job } from "@/lib/mock/types";

type Props = {
  currentJob: Job;
  employees: Employee[];
};

// Generate mock daily hours for employee on this job
function getEmployeeDailyHours(employeeId: string, currentJob: Job) {
  const startDate = new Date(currentJob.startDate);
  const endDate = currentJob.endDate ? new Date(currentJob.endDate) : new Date();

  const days: { date: string; hours: number; clockIn: string; clockOut: string }[] = [];
  let currentDate = new Date(startDate);
  let totalHours = Math.floor(currentJob.hoursLogged / (currentJob.crew.length + 1));
  let remaining = totalHours;

  while (currentDate <= endDate && remaining > 0) {
    const hoursForDay = Math.min(Math.floor(Math.random() * 10) + 4, remaining);
    const clockInHour = Math.floor(Math.random() * 3) + 7; // 7am-10am
    const clockInMin = Math.floor(Math.random() * 60);
    const clockOutHour = clockInHour + hoursForDay;
    const clockOutMin = clockInMin + Math.floor(Math.random() * 30);

    days.push({
      date: currentDate.toISOString().split("T")[0],
      hours: hoursForDay,
      clockIn: `${String(clockInHour).padStart(2, "0")}:${String(clockInMin).padStart(2, "0")}`,
      clockOut: `${String(clockOutHour % 24).padStart(2, "0")}:${String(clockOutMin % 60).padStart(2, "0")}`,
    });
    remaining -= hoursForDay;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

export function EmployeeHoursBreakdown({ currentJob, employees }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const crewEmployees = employees.filter(
    (e) => currentJob.crew.includes(e.id) || e.id === currentJob.supervisorId
  );

  return (
    <ul className="space-y-2">
      {crewEmployees.map((e) => {
        const dailyHours = getEmployeeDailyHours(e.id, currentJob);
        const isExpanded = expandedId === e.id;
        const totalHours = dailyHours.reduce((sum, day) => sum + day.hours, 0);

        return (
          <div key={e.id}>
            <li
              className="flex items-center justify-between rounded-md border px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : e.id)}
            >
              <span className="text-base font-medium">{e.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-base text-muted-foreground">
                  {totalHours} hrs
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            </li>

            {isExpanded && (
              <ul className="ml-4 mt-2 space-y-1 border-l border-slate-200 pl-4">
                {dailyHours.map((day) => (
                  <li
                    key={day.date}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="text-muted-foreground">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground text-xs">{day.clockIn} - {day.clockOut}</span>
                      <span className="font-medium">{day.hours} hrs</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      <p className="mt-3 text-xs text-muted-foreground">
        Mock daily breakdown. Real data from Time Tracking module.
      </p>
    </ul>
  );
}
