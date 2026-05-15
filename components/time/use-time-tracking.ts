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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      loadedStoredState.current = true;
      if (!stored) return;

      try {
        const parsed = JSON.parse(stored) as StoredTimeTracking;
        setActiveShifts(parsed.activeShifts ?? []);
        setEntries(parsed.entries ?? []);
        setTimeOffRequests(parsed.timeOffRequests ?? []);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loadedStoredState.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeShifts, entries, timeOffRequests }));
  }, [activeShifts, entries, timeOffRequests]);

  return useMemo(
    () => ({
      activeShifts,
      entries,
      timeOffRequests,
      clockIn(employeeId: string, jobId: string) {
        const shift: ActiveShift = {
          id: `shift-${employeeId}-${Date.now()}`,
          employeeId,
          jobId,
          clockedInAt: new Date().toISOString(),
        };
        setActiveShifts((current) => [...current.filter((item) => item.employeeId !== employeeId), shift]);
      },
      clockOut(shiftId: string) {
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
      },
      addEntry(input: Omit<TimeEntry, "id" | "submittedAt" | "reviewedBy" | "reviewedAt" | "status">) {
        const entry = createTimeEntry(input);
        setEntries((current) => [entry, ...current]);
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
