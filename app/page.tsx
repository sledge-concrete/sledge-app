import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HardHat } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <HardHat className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-medium tracking-tight">Sledge Concrete</h1>
      </div>
      <p className="max-w-md text-muted-foreground">
        Field management for Sledge Concrete crews. Time, jobs, documents, safety — all in one app.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
          Open Dashboard
        </Link>
        <Link href="/dashboard?tablet=1" className={buttonVariants({ size: "lg", variant: "outline" })}>
          Tablet Sign-in
        </Link>
      </div>
    </main>
  );
}
