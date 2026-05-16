import { getJobSessions, getTodaySession } from "@/lib/supabase/safety";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const today = url.searchParams.get("today");

    if (today) {
      const session = await getTodaySession(jobId, today);
      return Response.json(
        { session },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          },
        }
      );
    }

    const sessions = await getJobSessions(jobId, limit, offset);

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
    console.error("Get job sessions error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
