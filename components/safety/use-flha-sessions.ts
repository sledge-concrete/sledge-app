"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FlhaSession, FlhaSignature } from "@/lib/flha-types";
import { getInitialFlhaSessions } from "@/lib/mock/flha";

const STORAGE_KEY = "sledge-flha-sessions-v1";

export function useFlhaSessions() {
  const loadedStoredSessions = useRef(false);
  const [sessions, setSessions] = useState<FlhaSession[]>(() => getInitialFlhaSessions());

  // Fetch from Supabase on mount
  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const res = await fetch("/api/safety/sessions?limit=200");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to fetch FLHA sessions from Supabase, using mock data:", err);
      }
      loadedStoredSessions.current = true;
    };

    fetchFromSupabase();
  }, []);

  // Sync to localStorage as fallback
  useEffect(() => {
    if (!loadedStoredSessions.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  return useMemo(
    () => ({
      sessions,
      async addSession(input: Omit<FlhaSession, "id" | "created_at" | "reviewed_by" | "reviewed_at" | "signatures">) {
        try {
          const res = await fetch("/api/safety/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });

          if (res.ok) {
            const session = await res.json();
            setSessions((current) => {
              const withoutDuplicate = current.filter(
                (existing) => !(existing.job_id === session.job_id && existing.session_date === session.session_date),
              );
              return [session, ...withoutDuplicate];
            });
          }
        } catch (err) {
          console.error("Add session failed:", err);
          // Fallback: local session
          const session: FlhaSession = {
            ...input,
            id: `flha-${input.job_id}-${input.session_date}`,
            created_at: new Date().toISOString(),
            reviewed_by: null,
            reviewed_at: null,
            signatures: [],
          };
          setSessions((current) => {
            const withoutDuplicate = current.filter(
              (existing) => !(existing.job_id === session.job_id && existing.session_date === session.session_date),
            );
            return [session, ...withoutDuplicate];
          });
        }
      },
      async addSignature(input: {
        sessionId: string;
        employeeId: string | null;
        employeeName: string;
        signatureData: string;
      }) {
        try {
          const res = await fetch(`/api/safety/sessions/${input.sessionId}/signatures`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employee_id: input.employeeId,
              employee_name: input.employeeName,
              signature_data: input.signatureData,
            }),
          });

          if (res.ok) {
            const signature = await res.json();
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
          }
        } catch (err) {
          console.error("Add signature failed:", err);
          // Fallback: local signature
          const signature = {
            id: `sig-${input.sessionId}-${Date.now()}`,
            session_id: input.sessionId,
            employee_id: input.employeeId,
            employee_name: input.employeeName,
            signature_data: input.signatureData,
            signed_at: new Date().toISOString(),
          };
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
        }
      },
      async markReviewed(sessionId: string, reviewedBy = "Ben Sledge") {
        try {
          const res = await fetch(`/api/safety/sessions/${sessionId}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reviewed_by: reviewedBy }),
          });

          if (res.ok) {
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
          }
        } catch (err) {
          console.error("Mark reviewed failed:", err);
          // Fallback: local update
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
        }
      },
      async deleteSession(sessionId: string) {
        try {
          const res = await fetch(`/api/safety/sessions/${sessionId}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setSessions((current) => current.filter((session) => session.id !== sessionId));
          }
        } catch (err) {
          console.error("Delete session failed:", err);
          // Fallback: local delete
          setSessions((current) => current.filter((session) => session.id !== sessionId));
        }
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
