"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FlhaSession, FlhaSignature } from "@/lib/flha-types";
import { createFlhaSignature, getInitialFlhaSessions } from "@/lib/mock/flha";

const STORAGE_KEY = "sledge-flha-sessions-v1";

export function useFlhaSessions() {
  const loadedStoredSessions = useRef(false);
  const [sessions, setSessions] = useState<FlhaSession[]>(() => getInitialFlhaSessions());

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      loadedStoredSessions.current = true;
      if (!stored) return;

      try {
        setSessions(JSON.parse(stored) as FlhaSession[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loadedStoredSessions.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  return useMemo(
    () => ({
      sessions,
      addSession(session: FlhaSession) {
        setSessions((current) => {
          const withoutDuplicate = current.filter(
            (existing) => !(existing.job_id === session.job_id && existing.session_date === session.session_date),
          );
          return [session, ...withoutDuplicate];
        });
      },
      addSignature(input: {
        sessionId: string;
        employeeId: string | null;
        employeeName: string;
        signatureData: string;
      }) {
        const signature = createFlhaSignature(input);
        setSessions((current) =>
          current.map((session) =>
            session.id === input.sessionId
              ? {
                  ...session,
                  signatures: replaceWorkerSignature(session.signatures, signature),
                }
              : session,
          ),
        );
      },
      markReviewed(sessionId: string, reviewedBy = "Ben Sledge") {
        setSessions((current) =>
          current.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  reviewed_by: reviewedBy,
                  reviewed_at: new Date().toISOString(),
                }
              : session,
          ),
        );
      },
      deleteSession(sessionId: string) {
        setSessions((current) => current.filter((session) => session.id !== sessionId));
      },
    }),
    [sessions],
  );
}

function replaceWorkerSignature(signatures: FlhaSignature[], nextSignature: FlhaSignature) {
  return [
    ...signatures.filter((signature) => {
      if (nextSignature.employee_id) return signature.employee_id !== nextSignature.employee_id;
      return signature.employee_name !== nextSignature.employee_name;
    }),
    nextSignature,
  ];
}
