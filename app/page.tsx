import Link from "next/link";
import { ArrowRight, Hammer, LayoutGrid, Lock, UserCheck } from "lucide-react";

export default function Home() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-no-repeat bg-center bg-cover bg-zinc-900"
      style={{ backgroundImage: "url('/robert-keane-irzV4osXXkA-unsplash.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/65" aria-hidden />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Hammer className="h-8 w-8" />
            </div>
            <h1 className="text-5xl font-medium tracking-tight md:text-6xl">
              <span className="text-primary">Sledge</span>{" "}
              <span className="text-white">Concrete</span>
            </h1>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/60">
            Field Management System
          </p>
        </div>

        <div className="h-px w-full max-w-2xl bg-white/10" />

        <div className="w-full max-w-2xl">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            Select your access level
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/dashboard?tablet=1"
              className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-primary/60 bg-primary/35 p-6 shadow-xl backdrop-blur-xl transition-all hover:bg-white/15 hover:border-white/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/30">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-medium text-white">Hub Sign-In</h2>
                <p className="text-sm text-white/70">
                  Shared tablet at the office or job site. Everyone can view files, jobs, and safety.
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-2 self-start rounded-md bg-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white transition-colors group-hover:bg-white/10">
                Enter Hub <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl transition-all hover:bg-white/15 hover:border-white/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-medium text-white">Crew Sign-In</h2>
                <p className="text-sm text-white/60">
                  Personal login on your device. Time clock, your jobs, photos, and safety forms.
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-2 self-start rounded-md border border-white/30 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white transition-colors group-hover:bg-white/10">
                Sign In <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>

        <p className="flex items-center gap-2 text-xs text-white/40">
          <Lock className="h-3 w-3" />
          Internal use only — Sledge Concrete Ltd.
        </p>
      </div>
    </main>
  );
}
