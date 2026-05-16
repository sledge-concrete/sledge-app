import { createFlhaSession, getAllSessions } from "@/lib/supabase/safety";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const sessions = await getAllSessions(limit, offset);

    return Response.json(
      { sessions: sessions || [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("Get sessions error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      job_id,
      session_date,
      filled_by,
      work_location,
      sr_number,
      work_crew,
      job_description,
      supervisor_name,
      supervisor_phone,
      hazards,
      controls,
      other_hazards,
      other_controls,
      comments,
    } = body;

    if (!job_id || !session_date || !work_location || !job_description || !supervisor_name) {
      return Response.json({ error: "missing_fields" }, { status: 400 });
    }

    const session = await createFlhaSession(job_id, {
      session_date,
      filled_by: filled_by || "Unknown",
      work_location,
      sr_number: sr_number || "",
      work_crew: work_crew || [],
      job_description,
      supervisor_name,
      supervisor_phone: supervisor_phone || "",
      hazards: hazards || [],
      controls: controls || [],
      other_hazards: other_hazards || ["", "", ""],
      other_controls: other_controls || "",
      comments: comments || "",
    });

    if (!session) {
      return Response.json({ error: "create_failed" }, { status: 500 });
    }

    return Response.json(session, { status: 201 });
  } catch (err) {
    console.error("Create session error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
