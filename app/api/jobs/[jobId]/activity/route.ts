import { NextResponse } from "next/server";
import { insertJobActivity } from "@/lib/supabase/jobs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const body = await request.json();

  if (!body.detail || !body.detail.trim()) {
    return NextResponse.json({ error: "detail required" }, { status: 400 });
  }

  let actualJobId = jobId;
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { data: jobRow } = await supabase
      .from("jobs")
      .select("id")
      .eq("legacy_mock_id", jobId)
      .maybeSingle();

    if (jobRow) {
      actualJobId = jobRow.id;
    }
  }

  const result = await insertJobActivity(actualJobId, body.detail, body.actorEmployeeId);

  if (!result) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json(
    {
      id: result.id,
      activity_type: result.activity_type,
      detail: result.detail,
      occurred_at: result.occurred_at,
      actor_employee_id: result.actor_employee_id,
    },
    { status: 201 },
  );
}
