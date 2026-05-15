"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { aggregateDailyReports, type DailyAggregateReport } from "@/lib/mock/daily-reports";

const STORAGE_KEY = "sledge-daily-aggregate-reports-v1";

export function useDailyAggregateReports() {
  const loadedStoredReports = useRef(false);
  const [reports, setReports] = useState<DailyAggregateReport[]>(() => aggregateDailyReports);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      loadedStoredReports.current = true;
      if (!stored) return;

      try {
        setReports(JSON.parse(stored) as DailyAggregateReport[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loadedStoredReports.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  return useMemo(
    () => ({
      reports,
      upsertReport(report: DailyAggregateReport) {
        setReports((current) => {
          const withoutDate = current.filter((item) => item.date !== report.date);
          return [report, ...withoutDate].sort((a, b) => b.date.localeCompare(a.date));
        });
      },
    }),
    [reports],
  );
}
