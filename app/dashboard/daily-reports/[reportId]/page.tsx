import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dailyReports } from "@/lib/mock/daily-reports";
import { getEmployee } from "@/lib/mock/employees";
import { DailyReportDetail } from "@/components/daily-reports/daily-report-detail";

export function generateStaticParams() {
  return dailyReports.map((r) => ({ reportId: r.id }));
}

export default async function DailyReportPage(props: PageProps<"/dashboard/daily-reports/[reportId]">) {
  const { reportId } = await props.params;
  const report = dailyReports.find((r) => r.id === reportId);

  if (!report) notFound();

  const supervisor = getEmployee(report.supervisor);

  return (
    <div>
      <Link
        href="/dashboard/daily-reports"
        className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "mb-3 -ml-2 inline-flex")}
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Daily Reports
      </Link>

      <DailyReportDetail report={report} supervisor={supervisor} />
    </div>
  );
}
