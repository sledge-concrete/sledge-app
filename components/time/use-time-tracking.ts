"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActiveShift, TimeEntry, TimeEntryStatus, TimeOffRequest } from "@/lib/time-types";
import {
  createTimeEntry,
  createTimeOffRequest,
  getInitialActiveShifts,
  getInitialTimeEntries,
  getInitialTimeOffRequests,
} from "@/lib/mock/time";

const STORAGE_KEY = "sledge-time-tracking-v1";

type StoredTimeTracking = {
  activeShifts: ActiveShift[];
  entries: TimeEntry[];
  timeOffRequests: TimeOffRequest[];
};

export function useTimeTracking() {
  const loadedStoredState = useRef(false);
  const [activeShifts, setActiveShifts] = useState<ActiveShift[]>(() => getInitialActiveShifts());
  const [entries, setEntries] = useState<TimeEntry[]>(() => getInitialTimeEntries());
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>(() => getInitialTimeOffRequests());

  // Fetch from Supabase on mount
  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const res = await fetch("/api/time");
        if (res.ok) {
          const data = await res.json();
          setActiveShifts(data.activeShifts || []);
          setEntries(data.entries || []);
        }
      } catch (err) {
        console.error("Failed to fetch time tracking from Supabase, using mock data:", err);
      }
      loadedStoredState.current = true;
    };

    fetchFromSupabase();
  }, []);

  // Sync to localStorage as fallback
  useEffect(() => {
    if (!loadedStoredState.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeShifts, entries, timeOffRequests }));
  }, [activeShifts, entries, timeOffRequests]);

  return useMemo(
    () => ({
      activeShifts,
      entries,
      timeOffRequests,
      async clockIn(employeeId: string, jobId: string) {
        try {
          const res = await fetch("/api/time/clock-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeeId, jobId }),
          });

          if (res.ok) {
            const shift = await res.json();
            setActiveShifts((current) => [...current.filter((item) => item.employeeId !== employeeId), shift]);
          }
        } catch (err) {
          console.error("Clock in failed:", err);
          // Fallback: local shift
          const shift: ActiveShift = {
            id: `shift-${employeeId}-${Date.now()}`,
            employeeId,
            jobId,
            clockedInAt: new Date().toISOString(),
          };
          setActiveShifts((current) => [...current.filter((item) => item.employeeId !== employeeId), shift]);
        }
      },
      async clockOut(shiftId: string) {
        try {
          const res = await fetch("/api/time/clock-out", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shiftId }),
          });

          if (res.ok) {
            const entry = await res.json();
            setEntries((current) => [entry, ...current]);
          }
          setActiveShifts((current) => current.filter((item) => item.id !== shiftId));
        } catch (err) {
          console.error("Clock out failed:", err);
          // Fallback: local entry creation
          setActiveShifts((current) => {
            const shift = current.find((item) => item.id === shiftId);
            if (!shift) return current;

            const clockedInAt = new Date(shift.clockedInAt);
            const clockedOutAt = new Date();
            const entry = createTimeEntry({
              employeeId: shift.employeeId,
              jobId: shift.jobId,
              date: formatDate(clockedInAt),
              startTime: formatTime(clockedInAt),
              endTime: formatTime(clockedOutAt),
              breakMinutes: 0,
              notes: "Clocked shift.",
              source: "clock",
            });

            setEntries((currentEntries) => [entry, ...currentEntries]);
            return current.filter((item) => item.id !== shiftId);
          });
        }
      },
      async addEntry(input: Omit<TimeEntry, "id" | "submittedAt" | "reviewedBy" | "reviewedAt" | "status">) {
        try {
          const res = await fetch("/api/time/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeId: input.employeeId,
              jobId: input.jobId,
              clockInAt: `${input.date}T${input.startTime}:00`,
              clockOutAt: `${input.date}T${input.endTime}:00`,
              breakMinutes: input.breakMinutes,
              notes: input.notes,
            }),
          });

          if (res.ok) {
            const entry = await res.json();
            setEntries((current) => [entry, ...current]);
          }
        } catch (err) {
          console.error("Add entry failed:", err);
          // Fallback: local entry
          const entry = createTimeEntry(input);
          setEntries((current) => [entry, ...current]);
        }
      },
      addTimeOffRequest(input: Omit<TimeOffRequest, "id" | "submittedAt" | "reviewedBy" | "reviewedAt" | "status">) {
        const request = createTimeOffRequest(input);
        setTimeOffRequests((current) => [request, ...current]);
      },
      reviewEntry(entryId: string, status: Exclude<TimeEntryStatus, "pending">, reviewedBy = "Ben Sledge") {
        setEntries((current) => current.map((entry) => reviewItem(entry, entryId, status, reviewedBy)));
      },
      reviewTimeOffRequest(requestId: string, status: Exclude<TimeEntryStatus, "pending">, reviewedBy = "Ben Sledge") {
        setTimeOffRequests((current) => current.map((request) => reviewItem(request, requestId, status, reviewedBy)));
      },
    }),
    [activeShifts, entries, timeOffRequests],
  );
}

function reviewItem<T extends { id: string; status: TimeEntryStatus; reviewedBy: string | null; reviewedAt: string | null }>(
  item: T,
  itemId: string,
  status: Exclude<TimeEntryStatus, "pending">,
  reviewedBy: string,
) {
  if (item.id !== itemId) return item;
  return {
    ...item,
    status,
    reviewedBy,
    reviewedAt: new Date().toISOString(),
  };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
