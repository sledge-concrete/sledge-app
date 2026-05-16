import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActiveShift, TimeEntry } from "@/lib/time-types";

// Convert Supabase row to TimeEntry app type
function rowToTimeEntry(row: any): TimeEntry {
  const clockIn = new Date(row.clock_in_at);
  const clockOut = new Date(row.clock_out_at);

  return {
    id: row.id,
    employeeId: row.employee_id,
    jobId: row.job_id,
    date: clockIn.toISOString().split("T")[0],
    startTime: `${String(clockIn.getHours()).padStart(2, "0")}:${String(clockIn.getMinutes()).padStart(2, "0")}`,
    endTime: `${String(clockOut.getHours()).padStart(2, "0")}:${String(clockOut.getMinutes()).padStart(2, "0")}`,
    breakMinutes: row.break_minutes || 0,
    notes: row.notes || "",
    source: row.source,
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
  };
}

// Convert Supabase row to ActiveShift app type
function rowToActiveShift(row: any): ActiveShift {
  return {
    id: row.id,
    employeeId: row.employee_id,
    jobId: row.job_id,
    clockedInAt: row.clock_in_at,
  };
}

// Clock in: create active shift
export async function clockIn(employeeId: string, jobId: string): Promise<ActiveShift | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("active_shifts")
    .insert({
      employee_id: employeeId,
      job_id: jobId,
      clock_in_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase clock in failed.", error);
    return null;
  }

  return rowToActiveShift(data);
}

// Clock out: create time entry from active shift, delete active shift
export async function clockOut(shiftId: string): Promise<TimeEntry | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  // Get active shift
  const { data: shift, error: shiftError } = await supabase
    .from("active_shifts")
    .select()
    .eq("id", shiftId)
    .maybeSingle();

  if (shiftError || !shift) {
    console.error("Supabase fetch active shift failed.", shiftError);
    return null;
  }

  // Create time entry
  const { data: entry, error: entryError } = await supabase
    .from("time_entries")
    .insert({
      employee_id: shift.employee_id,
      job_id: shift.job_id,
      clock_in_at: shift.clock_in_at,
      clock_out_at: new Date().toISOString(),
      break_minutes: 0,
      notes: "Clocked shift.",
      source: "clock",
      status: "pending",
    })
    .select()
    .single();

  if (entryError) {
    console.error("Supabase create time entry failed.", entryError);
    return null;
  }

  // Delete active shift
  const { error: deleteError } = await supabase.from("active_shifts").delete().eq("id", shiftId);

  if (deleteError) {
    console.error("Supabase delete active shift failed.", deleteError);
    return null;
  }

  return rowToTimeEntry(entry);
}

// Add manual time entry
export async function addManualEntry(
  employeeId: string,
  jobId: string,
  clockInAt: string,
  clockOutAt: string,
  breakMinutes: number,
  notes: string,
): Promise<TimeEntry | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      employee_id: employeeId,
      job_id: jobId,
      clock_in_at: clockInAt,
      clock_out_at: clockOutAt,
      break_minutes: breakMinutes,
      notes,
      source: "manual",
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase add manual entry failed.", error);
    return null;
  }

  return rowToTimeEntry(data);
}

// Get active shifts (current clocked-in workers)
export async function getActiveShifts(): Promise<ActiveShift[] | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("active_shifts")
    .select()
    .order("clock_in_at", { ascending: false });

  if (error) {
    console.error("Supabase get active shifts failed.", error);
    return null;
  }

  return data.map(rowToActiveShift);
}

// Get time entries (all entries, optionally filtered by employee/date)
export async function getTimeEntries(employeeId?: string, fromDate?: string): Promise<TimeEntry[] | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  let query = supabase.from("time_entries").select();

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  if (fromDate) {
    query = query.gte("clock_in_at", `${fromDate}T00:00:00`);
  }

  const { data, error } = await query.order("clock_in_at", { ascending: false });

  if (error) {
    console.error("Supabase get time entries failed.", error);
    return null;
  }

  return data.map(rowToTimeEntry);
}

// Review time entry (supervisor approves/declines)
export async function reviewTimeEntry(
  entryId: string,
  status: "approved" | "declined",
  reviewedBy: string,
): Promise<TimeEntry | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("time_entries")
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", entryId)
    .select()
    .single();

  if (error) {
    console.error("Supabase review time entry failed.", error);
    return null;
  }

  return rowToTimeEntry(data);
}
