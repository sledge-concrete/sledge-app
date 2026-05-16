import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FlhaControl, FlhaHazard, FlhaSession, FlhaSignature } from "@/lib/flha-types";

// Convert DB rows to FlhaSession app type (with joined hazards, controls, crew, signatures)
async function rowToFlhaSession(
  sessionRow: any,
  supabase: ReturnType<typeof createServerSupabaseClient>
): Promise<FlhaSession | null> {
  if (!sessionRow || !supabase) return null;

  // Fetch hazards, controls, crew, signatures in parallel for performance
  const [hazardsData, controlsData, crewData, signaturesData] = await Promise.all([
    supabase.from("flha_session_hazards").select("hazard_type").eq("session_id", sessionRow.id),
    supabase.from("flha_session_controls").select("control_type").eq("session_id", sessionRow.id),
    supabase.from("flha_session_crew").select("employee_id, employee_name").eq("session_id", sessionRow.id),
    supabase.from("flha_signatures").select("id, employee_id, employee_name, signature_data, signed_at").eq("session_id", sessionRow.id),
  ]);

  return {
    id: sessionRow.id,
    job_id: sessionRow.job_id,
    session_date: sessionRow.session_date,
    filled_by: sessionRow.filled_by,
    work_location: sessionRow.work_location,
    sr_number: sessionRow.sr_number,
    work_crew: crewData.data?.map((c) => c.employee_name) || [],
    job_description: sessionRow.job_description,
    supervisor_name: sessionRow.supervisor_name,
    supervisor_phone: sessionRow.supervisor_phone,
    hazards: (hazardsData.data?.map((h) => h.hazard_type) || []) as FlhaHazard[],
    controls: (controlsData.data?.map((c) => c.control_type) || []) as FlhaControl[],
    other_hazards: sessionRow.other_hazards || ["", "", ""],
    other_controls: sessionRow.other_controls || "",
    comments: sessionRow.comments || "",
    reviewed_by: sessionRow.reviewed_by,
    reviewed_at: sessionRow.reviewed_at,
    created_at: sessionRow.created_at,
    signatures: signaturesData.data?.map((s) => ({
      id: s.id,
      session_id: sessionRow.id,
      employee_id: s.employee_id,
      employee_name: s.employee_name,
      signature_data: s.signature_data,
      signed_at: s.signed_at,
    })) || [],
  };
}

// Create FLHA session (insert session + hazards + controls + crew in batch)
export async function createFlhaSession(
  jobId: string,
  input: {
    session_date: string;
    filled_by: string;
    work_location: string;
    sr_number: string;
    work_crew: string[];
    job_description: string;
    supervisor_name: string;
    supervisor_phone: string;
    hazards: string[];
    controls: string[];
    other_hazards: string[];
    other_controls: string;
    comments: string;
  }
): Promise<FlhaSession | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    // Create session
    const { data: sessionData, error: sessionError } = await supabase
      .from("flha_sessions")
      .insert({
        job_id: jobId,
        session_date: input.session_date,
        filled_by: input.filled_by,
        work_location: input.work_location,
        sr_number: input.sr_number,
        job_description: input.job_description,
        supervisor_name: input.supervisor_name,
        supervisor_phone: input.supervisor_phone,
        other_hazards: input.other_hazards,
        other_controls: input.other_controls,
        comments: input.comments,
      })
      .select()
      .single();

    if (sessionError || !sessionData) {
      console.error("Create FLHA session failed:", sessionError);
      return null;
    }

    // Batch insert hazards, controls, crew (parallel)
    await Promise.all([
      input.hazards.length > 0
        ? supabase.from("flha_session_hazards").insert(
            input.hazards.map((hazard) => ({
              session_id: sessionData.id,
              hazard_type: hazard,
            }))
          )
        : Promise.resolve(),
      input.controls.length > 0
        ? supabase.from("flha_session_controls").insert(
            input.controls.map((control) => ({
              session_id: sessionData.id,
              control_type: control,
            }))
          )
        : Promise.resolve(),
      input.work_crew.length > 0
        ? supabase.from("flha_session_crew").insert(
            input.work_crew.map((crewName) => ({
              session_id: sessionData.id,
              employee_name: crewName,
            }))
          )
        : Promise.resolve(),
    ]);

    return rowToFlhaSession(sessionData, supabase);
  } catch (err) {
    console.error("Create FLHA session error:", err);
    return null;
  }
}

// Get all sessions for a job (with pagination for performance)
export async function getJobSessions(jobId: string, limit = 50, offset = 0): Promise<FlhaSession[] | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("flha_sessions")
      .select()
      .eq("job_id", jobId)
      .order("session_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get job sessions failed:", error);
      return null;
    }

    // Convert all rows in parallel for performance
    const sessions = await Promise.all(data.map((row) => rowToFlhaSession(row, supabase)));
    return sessions.filter((s) => s !== null) as FlhaSession[];
  } catch (err) {
    console.error("Get job sessions error:", err);
    return null;
  }
}

// Get today's session for a job
export async function getTodaySession(jobId: string, today: string): Promise<FlhaSession | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("flha_sessions")
      .select()
      .eq("job_id", jobId)
      .eq("session_date", today)
      .maybeSingle();

    if (error) {
      console.error("Get today session failed:", error);
      return null;
    }

    return rowToFlhaSession(data, supabase);
  } catch (err) {
    console.error("Get today session error:", err);
    return null;
  }
}

// Get all sessions (for dashboard/review, with pagination)
export async function getAllSessions(limit = 100, offset = 0): Promise<FlhaSession[] | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("flha_sessions")
      .select()
      .order("session_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get all sessions failed:", error);
      return null;
    }

    const sessions = await Promise.all(data.map((row) => rowToFlhaSession(row, supabase)));
    return sessions.filter((s) => s !== null) as FlhaSession[];
  } catch (err) {
    console.error("Get all sessions error:", err);
    return null;
  }
}

// Add signature to session (replace per-worker)
export async function addSignatureToSession(
  sessionId: string,
  input: {
    employee_id: string | null;
    employee_name: string;
    signature_data: string;
  }
): Promise<FlhaSignature | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    // Delete existing signature for this worker
    if (input.employee_id) {
      await supabase
        .from("flha_signatures")
        .delete()
        .eq("session_id", sessionId)
        .eq("employee_id", input.employee_id);
    } else {
      // If no employee_id, delete by name (fallback)
      await supabase
        .from("flha_signatures")
        .delete()
        .eq("session_id", sessionId)
        .eq("employee_name", input.employee_name);
    }

    // Insert new signature
    const { data, error } = await supabase
      .from("flha_signatures")
      .insert({
        session_id: sessionId,
        employee_id: input.employee_id,
        employee_name: input.employee_name,
        signature_data: input.signature_data,
        signed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Add signature failed:", error);
      return null;
    }

    return {
      id: data.id,
      session_id: data.session_id,
      employee_id: data.employee_id,
      employee_name: data.employee_name,
      signature_data: data.signature_data,
      signed_at: data.signed_at,
    };
  } catch (err) {
    console.error("Add signature error:", err);
    return null;
  }
}

// Mark session as reviewed
export async function markSessionReviewed(sessionId: string, reviewedBy: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("flha_sessions")
      .update({
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Mark reviewed failed:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Mark reviewed error:", err);
    return false;
  }
}

// Delete session (cascades to hazards, controls, crew, signatures)
export async function deleteFlhaSession(sessionId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("flha_sessions").delete().eq("id", sessionId);

    if (error) {
      console.error("Delete session failed:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Delete session error:", err);
    return false;
  }
}

// Update session (edit existing, replaces hazards/controls/crew)
export async function updateFlhaSession(
  sessionId: string,
  input: {
    work_location?: string;
    sr_number?: string;
    job_description?: string;
    supervisor_name?: string;
    supervisor_phone?: string;
    hazards?: string[];
    controls?: string[];
    other_hazards?: string[];
    other_controls?: string;
    comments?: string;
  }
): Promise<FlhaSession | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  try {
    // Update session fields
    const updateData: any = {};
    if (input.work_location !== undefined) updateData.work_location = input.work_location;
    if (input.sr_number !== undefined) updateData.sr_number = input.sr_number;
    if (input.job_description !== undefined) updateData.job_description = input.job_description;
    if (input.supervisor_name !== undefined) updateData.supervisor_name = input.supervisor_name;
    if (input.supervisor_phone !== undefined) updateData.supervisor_phone = input.supervisor_phone;
    if (input.other_hazards !== undefined) updateData.other_hazards = input.other_hazards;
    if (input.other_controls !== undefined) updateData.other_controls = input.other_controls;
    if (input.comments !== undefined) updateData.comments = input.comments;

    const { data: sessionData, error: updateError } = await supabase
      .from("flha_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError) {
      console.error("Update session failed:", updateError);
      return null;
    }

    // Replace hazards and controls (delete old, insert new)
    if (input.hazards !== undefined) {
      await supabase.from("flha_session_hazards").delete().eq("session_id", sessionId);
      if (input.hazards.length > 0) {
        await supabase.from("flha_session_hazards").insert(
          input.hazards.map((hazard) => ({
            session_id: sessionId,
            hazard_type: hazard,
          }))
        );
      }
    }

    if (input.controls !== undefined) {
      await supabase.from("flha_session_controls").delete().eq("session_id", sessionId);
      if (input.controls.length > 0) {
        await supabase.from("flha_session_controls").insert(
          input.controls.map((control) => ({
            session_id: sessionId,
            control_type: control,
          }))
        );
      }
    }

    return rowToFlhaSession(sessionData, supabase);
  } catch (err) {
    console.error("Update session error:", err);
    return null;
  }
}
