import { clockOut } from "@/lib/supabase/time";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shiftId } = body;

    if (!shiftId) {
      return Response.json({ error: "missing_shift_id" }, { status: 400 });
    }

    const entry = await clockOut(shiftId);

    if (!entry) {
      return Response.json({ error: "clock_out_failed" }, { status: 500 });
    }

    return Response.json(entry, { status: 201 });
  } catch (err) {
    console.error("Clock out error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
