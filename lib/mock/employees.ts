import type { Employee } from "./types";

export const employees: Employee[] = [
  { id: "u-ben", name: "Ben Sledge", role: "admin", email: "ben@sledge.co", initials: "BS" },
  { id: "u-sarah", name: "Sarah Holm", role: "supervisor", email: "sarah@sledge.co", initials: "SH" },
  { id: "u-mike", name: "Mike Doran", role: "employee", email: "mike@sledge.co", initials: "MD" },
  { id: "u-jake", name: "Jake Reilly", role: "employee", email: "jake@sledge.co", initials: "JR" },
  { id: "u-tanya", name: "Tanya Webb", role: "employee", email: "tanya@sledge.co", initials: "TW" },
];

export const getEmployee = (id: string) => employees.find((e) => e.id === id);
