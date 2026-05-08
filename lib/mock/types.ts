export type Role = "admin" | "supervisor" | "employee" | "tablet";

export type Employee = {
  id: string;
  name: string;
  role: Role;
  email: string;
  initials: string;
};

export type JobStatus = "active" | "hold" | "completed";

export type Job = {
  id: string;
  name: string;
  number: string;
  client_name: string;
  address: string;
  status: JobStatus;
  startDate: string;
  endDate?: string;
  supervisorId: string;
  crew: string[];
  hoursLogged: number;
  worker_count: number;
  lat: number;
  lng: number;
  service_type?: string;
  notes?: string;
};

export type JobDocument = {
  id: string;
  jobId: string;
  filename: string;
  type: "pdf" | "image" | "doc";
  uploadedBy: string;
  uploadedAt: string;
  sizeKb: number;
};

export type JobPhoto = {
  id: string;
  jobId: string;
  filename: string;
  uploadedBy: string;
  uploadedAt: string;
  caption?: string;
};

export type ActivityEntry = {
  id: string;
  jobId: string;
  type: "clock-in" | "clock-out" | "upload" | "note" | "sign-off";
  actor: string;
  at: string;
  detail: string;
};
