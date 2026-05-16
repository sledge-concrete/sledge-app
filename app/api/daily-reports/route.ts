import { getDailyAggregateReports, upsertDailyAggregateReport } from "@/lib/supabase/daily-reports";
import type { DailyAggregateReport } from "@/lib/mock/daily-reports";

export const dynamic = "force-dynamic";

export async function GET() {
  const reports = await getDailyAggregateReports();

  if (!reports) {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  return Response.json(
    { reports },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
      },
    },
  );
}

export async function POST(req: Request) {
  try {
    const report = (await req.json()) as DailyAggregateReport;

    if (!report.date || !report.supervisorName || !report.signature?.dataUrl) {
      return Response.json({ error: "missing_fields" }, { status: 400 });
    }

    const savedReport = await upsertDailyAggregateReport(report);
    if (!savedReport) {
      return Response.json({ error: "save_failed" }, { status: 500 });
    }

    return Response.json({ report: savedReport }, { status: 201 });
  } catch (err) {
    console.error("Daily report save error:", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
