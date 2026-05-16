"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { aggregateDailyReports, type DailyAggregateReport } from "@/lib/mock/daily-reports";

const STORAGE_KEY = "sledge-daily-aggregate-reports-v1";

export function useDailyAggregateReports() {
  const loadedStoredReports = useRef(false);
  const [reports, setReports] = useState<DailyAggregateReport[]>(() => aggregateDailyReports);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await fetch("/api/daily-reports");
        if (response.ok) {
          const data = (await response.json()) as { reports?: DailyAggregateReport[] };
          setReports(data.reports ?? []);
          loadedStoredReports.current = true;
          return;
        }
      } catch (err) {
        console.error("Failed to fetch daily reports from Supabase, using local fallback:", err);
      }

      const stored = window.localStorage.getItem(STORAGE_KEY);
      loadedStoredReports.current = true;
      if (!stored) return;

      try {
        setReports(JSON.parse(stored) as DailyAggregateReport[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    };

    void loadReports();
  }, []);

  useEffect(() => {
    if (!loadedStoredReports.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  return useMemo(
    () => ({
      reports,
      async upsertReport(report: DailyAggregateReport) {
        setReports((current) => {
          const withoutDate = current.filter((item) => item.date !== report.date);
          return [report, ...withoutDate].sort((a, b) => b.date.localeCompare(a.date));
        });

        try {
          const response = await fetch("/api/daily-reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(report),
          });

          if (response.ok) {
            const data = (await response.json()) as { report?: DailyAggregateReport };
            if (data.report) {
              const savedReport = data.report;
              setReports((current) => {
                const withoutDate = current.filter((item) => item.date !== savedReport.date);
                return [savedReport, ...withoutDate].sort((a, b) => b.date.localeCompare(a.date));
              });
              return savedReport;
            }
          }
        } catch (err) {
          console.error("Save daily report to Supabase failed, keeping local report:", err);
        }

        return report;
      },
    }),
    [reports],
  );
}
