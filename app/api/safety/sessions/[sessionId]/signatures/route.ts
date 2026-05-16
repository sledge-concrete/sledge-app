import { addSignatureToSession } from "@/lib/supabase/safety";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { employee_id, employee_name, signature_data } = body;

    if (!employee_name || !signature_data) {
      return Response.json({ error: "missing_fields" }, { status: 400 });
    }

    const signature = await addSignatureToSession(sessionId, {
      employee_id: employee_id || null,
      employee_name,
      signature_data,
    });

    if (!signature) {
      return Response.json({ error: "add_signature_failed" }, { status: 500 });
    }

    return Response.json(signature, { status: 201 });
  } catch (err) {
    console.error("Add signature error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
