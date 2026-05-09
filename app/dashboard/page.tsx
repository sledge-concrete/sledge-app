import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { WeatherCarousel } from "@/components/weather-carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { jobs } from "@/lib/mock/jobs";
import { employees } from "@/lib/mock/employees";
import { ArrowRight, Briefcase, Clock, Users } from "lucide-react";

export default function DashboardPage() {
  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const totalHours = jobs.reduce((s, j) => s + j.hoursLogged, 0);

  return (
    <div>
      <PageHeader title="Today" description="Quick overview of crew, jobs, and hours." />
      <WeatherCarousel />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-5xl font-medium leading-none">{activeJobs}</div>
            <p className="mt-3 text-xs sledge-meta">of {jobs.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">Crew</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-5xl font-medium leading-none">{employees.length}</div>
            <p className="mt-3 text-xs sledge-meta">team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-5xl font-medium leading-none">{totalHours}</div>
            <p className="mt-3 text-xs sledge-meta">across all jobs</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-medium">Active Jobs</h2>
          <Link href="/dashboard/jobs" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-base">{job.name}</CardTitle>
                <CardDescription>{job.address}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{job.hoursLogged} hrs</span>
                <Link href={`/dashboard/jobs/${job.id}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
                  Open
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
