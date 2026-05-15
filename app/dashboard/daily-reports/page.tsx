import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { dailyReports } from "@/lib/mock/daily-reports";
import { jobs } from "@/lib/mock/jobs";
import { getEmployee } from "@/lib/mock/employees";
import { ArrowRight, FileText, CheckCircle2 } from "lucide-react";

export default function DailyReportsPage() {
  const sortedReports = [...dailyReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const stats = {
    total: dailyReports.length,
    pending: dailyReports.filter((r) => r.status === "pending").length,
    signed: dailyReports.filter((r) => r.status === "signed").length,
  };

  const statusBadgeClass = (status: string) => {
    if (status === "pending") return "bg-amber-100 text-amber-800 border-amber-200";
    if (status === "signed") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const statusLabel = (status: string) => {
    return status === "pending" ? "Pending" : status === "signed" ? "Signed" : status;
  };

  return (
    <div>
      <PageHeader title="Daily Reports" description="Supervisor reports for jobs, weather, crew, and safety sign-offs." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-5xl font-medium leading-none">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-5xl font-medium leading-none text-amber-600">{stats.pending}</div>
            <p className="mt-3 text-xs sledge-meta">awaiting sign-off</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">Signed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-5xl font-medium leading-none text-emerald-600">{stats.signed}</div>
            <p className="mt-3 text-xs sledge-meta">locked & archived</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-medium">Reports</h2>
        </div>
        <div className="space-y-2">
          {sortedReports.map((report) => {
            const job = jobs.find((j) => j.id === report.jobId);
            const supervisor = getEmployee(report.supervisor);
            return (
              <Link key={report.id} href={`/dashboard/daily-reports/${report.id}`}>
                <Card className="transition-colors hover:border-primary/50 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{report.jobName}</CardTitle>
                          <Badge className={`border text-xs font-medium rounded ${statusBadgeClass(report.status)}`}>
                            {statusLabel(report.status)}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">{report.projectNumber}</CardDescription>
                      </div>
                      <span className="text-base text-muted-foreground font-medium">{report.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base text-muted-foreground">
                          {report.employeeSummary.onSiteCount} of {report.employeeSummary.plannedCount} crew · Reported by {supervisor?.name}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
