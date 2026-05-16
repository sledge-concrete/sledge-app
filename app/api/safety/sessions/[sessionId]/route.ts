import { updateFlhaSession, deleteFlhaSession } from "@/lib/supabase/safety";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const body = await req.json();

    const session = await updateFlhaSession(sessionId, body);

    if (!session) {
      return Response.json({ error: "update_failed" }, { status: 500 });
    }

    return Response.json(session, { status: 200 });
  } catch (err) {
    console.error("Update session error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;

    const success = await deleteFlhaSession(sessionId);

    if (!success) {
      return Response.json({ error: "delete_failed" }, { status: 500 });
    }

    return Response.json({ deleted: true }, { status: 200 });
  } catch (err) {
    console.error("Delete session error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
