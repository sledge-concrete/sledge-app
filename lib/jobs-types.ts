export type JobStatus = "active" | "hold" | "completed";

export type JobsApiItem = {
  id: string;
  name: string;
  number: string;
  client_name: string;
  address: string;
  status: JobStatus;
  worker_count: number;
  lat: number;
  lng: number;
};

export const STATUS_COLOR: Record<JobStatus, string> = {
  active: "#639922",
  hold: "#BA7517",
  completed: "#888780",
};

export const STATUS_TEXT_COLOR: Record<JobStatus, string> = {
  active: "#2e7d32",
  hold: "#f57f17",
  completed: "#666666",
};

export const STATUS_LABEL: Record<JobStatus, string> = {
  active: "Active",
  hold: "On Hold",
  completed: "Completed",
};

export const STATUS_RANK: Record<JobStatus, number> = {
  active: 0,
  hold: 1,
  completed: 2,
};
