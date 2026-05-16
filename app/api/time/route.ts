import { getTimeEntries, getActiveShifts } from "@/lib/supabase/time";

export const dynamic = "force-dynamic";

export async function GET() {
  const [shifts, entries] = await Promise.all([getActiveShifts(), getTimeEntries()]);

  return Response.json(
    {
      activeShifts: shifts || [],
      entries: entries || [],
    },
    { status: 200 }
  );
}
