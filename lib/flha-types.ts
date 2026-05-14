export type FlhaHazard =
  | "Confined Space"
  | "Extreme heat/cold"
  | "Mold"
  | "Obstructions"
  | "Fall hazards"
  | "Working Alone"
  | "Noise"
  | "Electrical"
  | "Slip/Trip Hazards"
  | "Unsafe tools/equipment"
  | "Awkward postures or lifting"
  | "Asbestos"
  | "Lighting"
  | "Mechanical"
  | "Hazardous gases/chemicals"
  | "Sharp objects"
  | "Animal droppings"
  | "Entrapment";

export type FlhaControl =
  | "Lockout tag out"
  | "Hard hat"
  | "Protective gloves"
  | "Respirator"
  | "Eye protection"
  | "Protective footwear"
  | "Hearing protection"
  | "Coveralls"
  | "Pedestrian Barricades"
  | "Stand by worker"
  | "Confined Space Entry Procedures"
  | "Additional Lighting"
  | "Communication device"
  | "Fall protection"
  | "Mechanical ventilation"
  | "Ladders for safe access and egress"
  | "Mechanical aids"
  | "Atmospheric testing"
  | "Emergency or rescue procedure"
  | "Scaffolds (inspected and tagged)"
  | "Work Permit"
  | "Additional training"
  | "Machine guarding"
  | "Check in protocol with office"
  | "Fire extinguisher"
  | "Other";

export type FlhaSignature = {
  id: string;
  session_id: string;
  employee_id: string | null;
  employee_name: string;
  signature_data: string;
  signed_at: string;
};

export type FlhaSession = {
  id: string;
  job_id: string;
  session_date: string;
  filled_by: string;
  work_location: string;
  sr_number: string;
  work_crew: string[];
  job_description: string;
  supervisor_name: string;
  supervisor_phone: string;
  hazards: FlhaHazard[];
  controls: FlhaControl[];
  other_hazards: string[];
  other_controls: string;
  comments: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  signatures: FlhaSignature[];
};

export type FlhaFormValues = Omit<
  FlhaSession,
  "id" | "job_id" | "reviewed_by" | "reviewed_at" | "created_at" | "signatures"
>;

export type SafetyStatus = "none" | "started" | "complete";

export const POTENTIAL_HAZARDS: FlhaHazard[] = [
  "Confined Space",
  "Extreme heat/cold",
  "Mold",
  "Obstructions",
  "Fall hazards",
  "Working Alone",
  "Noise",
  "Electrical",
  "Slip/Trip Hazards",
  "Unsafe tools/equipment",
  "Awkward postures or lifting",
  "Asbestos",
  "Lighting",
  "Mechanical",
  "Hazardous gases/chemicals",
  "Sharp objects",
  "Animal droppings",
  "Entrapment",
];

export const REQUIRED_CONTROLS: FlhaControl[] = [
  "Lockout tag out",
  "Hard hat",
  "Protective gloves",
  "Respirator",
  "Eye protection",
  "Protective footwear",
  "Hearing protection",
  "Coveralls",
  "Pedestrian Barricades",
  "Stand by worker",
  "Confined Space Entry Procedures",
  "Additional Lighting",
  "Communication device",
  "Fall protection",
  "Mechanical ventilation",
  "Ladders for safe access and egress",
  "Mechanical aids",
  "Atmospheric testing",
  "Emergency or rescue procedure",
  "Scaffolds (inspected and tagged)",
  "Work Permit",
  "Additional training",
  "Machine guarding",
  "Check in protocol with office",
  "Fire extinguisher",
  "Other",
];
