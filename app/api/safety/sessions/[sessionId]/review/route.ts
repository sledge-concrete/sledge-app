import { markSessionReviewed } from "@/lib/supabase/safety";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { reviewed_by } = body;

    if (!reviewed_by) {
      return Response.json({ error: "missing_reviewed_by" }, { status: 400 });
    }

    const success = await markSessionReviewed(sessionId, reviewed_by);

    if (!success) {
      return Response.json({ error: "review_failed" }, { status: 500 });
    }

    return Response.json({ reviewed: true }, { status: 200 });
  } catch (err) {
    console.error("Mark reviewed error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
