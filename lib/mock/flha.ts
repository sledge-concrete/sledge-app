import { employees, getEmployee } from "./employees";
import { jobs } from "./jobs";
import type { FlhaControl, FlhaHazard, FlhaSession, FlhaSignature, SafetyStatus } from "@/lib/flha-types";

export const SAFETY_JOB_IDS = ["job-riverfront", "job-maple", "job-hwy2"];

export function getTodayDate() {
  return formatDate(new Date());
}

export function getSafetyJobs() {
  return SAFETY_JOB_IDS.map((id) => jobs.find((job) => job.id === id)).filter((job) => !!job);
}

export function getSafetyJob(jobId: string) {
  return jobs.find((job) => job.id === jobId);
}

export function getJobWorkers(jobId: string) {
  const job = getSafetyJob(jobId);
  if (!job) return employees.filter((employee) => employee.role === "employee");

  const workerIds = [job.supervisorId, ...job.crew];
  return workerIds.map((id) => getEmployee(id)).filter((employee) => !!employee);
}

export function getSessionStatus(session?: FlhaSession): SafetyStatus {
  if (!session) return "none";
  return session.signatures.length > 0 ? "complete" : "started";
}

export function getStatusLabel(status: SafetyStatus, signatureCount: number) {
  if (status === "none") return "No Assessment";
  if (status === "started") return "Assessment Started";
  return `Complete (${signatureCount} signed)`;
}

export function getTodaySession(sessions: FlhaSession[], jobId: string) {
  const today = getTodayDate();
  return sessions.find((session) => session.job_id === jobId && session.session_date === today);
}

export function getJobSessions(sessions: FlhaSession[], jobId: string) {
  return sessions
    .filter((session) => session.job_id === jobId)
    .sort((a, b) => b.session_date.localeCompare(a.session_date));
}

export function createFlhaSession(jobId: string, values: Omit<FlhaSession, "id" | "job_id" | "created_at" | "reviewed_at" | "reviewed_by" | "signatures">): FlhaSession {
  return {
    ...values,
    id: `flha-${jobId}-${values.session_date}`,
    job_id: jobId,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date().toISOString(),
    signatures: [],
  };
}

export function createFlhaSignature({
  sessionId,
  employeeId,
  employeeName,
  signatureData,
}: {
  sessionId: string;
  employeeId: string | null;
  employeeName: string;
  signatureData: string;
}): FlhaSignature {
  return {
    id: `sig-${sessionId}-${Date.now()}`,
    session_id: sessionId,
    employee_id: employeeId,
    employee_name: employeeName,
    signature_data: signatureData,
    signed_at: new Date().toISOString(),
  };
}

export function getInitialFlhaSessions(): FlhaSession[] {
  return [];
}

function makeSession(
  id: string,
  jobId: string,
  date: string,
  overrides: {
    job_description: string;
    hazards: FlhaHazard[];
    controls: FlhaControl[];
    comments: string;
    signatures: FlhaSignature[];
  },
): FlhaSession {
  const job = getSafetyJob(jobId);
  const supervisor = job ? getEmployee(job.supervisorId) : undefined;

  return {
    id: `flha-${id}`,
    job_id: jobId,
    session_date: date,
    filled_by: supervisor?.name ?? "Sarah Holm",
    work_location: job?.address ?? "",
    sr_number: job?.number ?? "",
    work_crew: getJobWorkers(jobId).map((worker) => worker.name),
    job_description: overrides.job_description,
    supervisor_name: supervisor?.name ?? "Sarah Holm",
    supervisor_phone: "403-555-0184",
    hazards: overrides.hazards,
    controls: overrides.controls,
    other_hazards: ["", "", ""],
    other_controls: "",
    comments: overrides.comments,
    reviewed_by: null,
    reviewed_at: null,
    created_at: `${date}T07:30:00.000Z`,
    signatures: overrides.signatures,
  };
}

function makeSignature(sessionId: string, employeeId: string, date: string, time: string): FlhaSignature {
  const employee = getEmployee(employeeId);

  return {
    id: `sig-${sessionId}-${employeeId}`,
    session_id: `flha-${sessionId}`,
    employee_id: employeeId,
    employee_name: employee?.name ?? "Worker",
    signature_data: mockSignatureData(employee?.name ?? "Worker"),
    signed_at: `${date}T${time}:00.000Z`,
  };
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function mockSignatureData(name: string) {
  const encodedName = encodeURIComponent(name);
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='120' viewBox='0 0 420 120'><path d='M18 72 C55 20,94 104,132 54 S206 35,242 68 S318 87,390 38' fill='none' stroke='%231a1a1a' stroke-width='5' stroke-linecap='round'/><text x='22' y='105' font-size='20' fill='%2352525b'>${encodedName}</text></svg>`;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
