import { addManualEntry, getTimeEntries } from "@/lib/supabase/time";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await getTimeEntries();
    return Response.json({ entries: entries || [] }, { status: 200 });
  } catch (err) {
    console.error("Get entries error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeId, jobId, clockInAt, clockOutAt, breakMinutes, notes } = body;

    if (!employeeId || !jobId || !clockInAt || !clockOutAt) {
      return Response.json({ error: "missing_fields" }, { status: 400 });
    }

    const entry = await addManualEntry(
      employeeId,
      jobId,
      clockInAt,
      clockOutAt,
      breakMinutes || 0,
      notes || ""
    );

    if (!entry) {
      return Response.json({ error: "add_entry_failed" }, { status: 500 });
    }

    return Response.json(entry, { status: 201 });
  } catch (err) {
    console.error("Add entry error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
