import { clockIn } from "@/lib/supabase/time";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeId, jobId } = body;

    if (!employeeId || !jobId) {
      return Response.json({ error: "missing_fields" }, { status: 400 });
    }

    const shift = await clockIn(employeeId, jobId);

    if (!shift) {
      return Response.json({ error: "clock_in_failed" }, { status: 500 });
    }

    return Response.json(shift, { status: 201 });
  } catch (err) {
    console.error("Clock in error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
