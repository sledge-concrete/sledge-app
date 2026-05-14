"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { CheckCircle2, Eraser, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Employee } from "@/lib/mock/types";
import type { FlhaSession } from "@/lib/flha-types";
import { FlhaCompactSummary } from "./flha-assessment";
import { cn } from "@/lib/utils";

type Step = "worker" | "summary" | "signature" | "confirmed";

export function SignatureFlow({
  session,
  workers,
  initialWorkerId,
  onClose,
  onSubmit,
}: {
  session: FlhaSession;
  workers: Employee[];
  initialWorkerId?: string;
  onClose: () => void;
  onSubmit: (input: { employeeId: string | null; employeeName: string; signatureData: string }) => void;
}) {
  const [step, setStep] = useState<Step>("worker");
  const [selectedWorkerId, setSelectedWorkerId] = useState(initialWorkerId ?? "");
  const [summaryScrolled, setSummaryScrolled] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const crewMembers = workers.filter((worker) =>
    Array.isArray(session.work_crew) ? session.work_crew.includes(worker.name) : false
  );
  const selectedWorker = crewMembers.find((worker) => worker.id === selectedWorkerId);

  useEffect(() => {
    if (step !== "confirmed") return;

    const timeout = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timeout);
  }, [onClose, step]);

  function submitSignature() {
    if (!selectedWorker || !signatureData) return;
    onSubmit({
      employeeId: selectedWorker.id,
      employeeName: selectedWorker.name,
      signatureData,
    });
    setStep("confirmed");
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <header className="flex min-h-14 items-center justify-between border-b bg-card px-6">
          <div>
            <div className="font-semibold">Worker Safety Sign-off</div>
            <div className="text-xs text-muted-foreground">{session.session_date}</div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
        {step === "worker" && (
          <section className="flex h-full flex-col gap-4 overflow-y-auto p-6">
            <div>
              <h2 className="text-xl font-medium">Select your name</h2>
              <p className="mt-1 text-sm text-muted-foreground">Each worker signs this assessment individually.</p>
            </div>
            <div className="grid gap-2 grid-cols-2">
              {crewMembers.map((worker) => (
                <button
                  key={worker.id}
                  type="button"
                  onClick={() => setSelectedWorkerId(worker.id)}
                  className={cn(
                    "min-h-16 rounded-lg border bg-card p-3 text-left text-sm font-semibold",
                    selectedWorkerId === worker.id && "border-primary bg-primary/5 text-primary",
                  )}
                >
                  {worker.name}
                  <span className="mt-2 block text-sm font-medium text-muted-foreground">{worker.role}</span>
                </button>
              ))}
            </div>
            <div className="mt-auto flex justify-end">
              <Button
                type="button"
                size="lg"
                className="min-h-12 px-6"
                disabled={!selectedWorker}
                onClick={() => setStep("summary")}
              >
                Continue
              </Button>
            </div>
          </section>
        )}

        {step === "summary" && (
          <section className="flex h-full flex-col p-6">
            <div className="mb-2">
              <h2 className="text-xl font-medium">Review today&apos;s FLHA</h2>
              <p className="mt-1 text-xs text-muted-foreground">Scroll to the bottom before signing.</p>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto rounded-lg border bg-card p-4"
              onScroll={(event) => {
                const target = event.currentTarget;
                if (target.scrollTop + target.clientHeight >= target.scrollHeight - 12) setSummaryScrolled(true);
              }}
            >
              <FlhaCompactSummary session={session} />
              <div className="mt-10 rounded-lg bg-muted p-4 text-center text-sm font-medium text-muted-foreground">
                End of assessment summary
              </div>
            </div>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" size="lg" className="min-h-12 px-5" onClick={() => setStep("worker")}>
                Back
              </Button>
              <Button
                type="button"
                size="lg"
                className="min-h-12 px-6"
                disabled={!summaryScrolled}
                onClick={() => setStep("signature")}
              >
                Sign
              </Button>
            </div>
          </section>
        )}

        {step === "signature" && (
          <section className="flex h-full flex-col gap-4 p-6">
            <div>
              <h2 className="text-xl font-medium">Draw your signature</h2>
              <p className="mt-1 text-sm text-muted-foreground">{selectedWorker?.name}</p>
            </div>
            <SignatureCanvas onChange={setSignatureData} />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" size="lg" className="min-h-12 px-5" onClick={() => setStep("summary")}>
                Back
              </Button>
              <Button
                type="button"
                size="lg"
                className="min-h-12 px-6"
                disabled={!signatureData}
                onClick={submitSignature}
              >
                Submit Signature
              </Button>
            </div>
          </section>
        )}

        {step === "confirmed" && (
          <section className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-600" />
            <div>
              <h2 className="text-2xl font-medium">Signature saved</h2>
              <p className="mt-1 text-sm text-muted-foreground">Returning to the job safety page.</p>
            </div>
          </section>
        )}
      </main>
      </DialogContent>
    </Dialog>
  );
}

function SignatureCanvas({ onChange }: { onChange: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.scale(ratio, ratio);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#1a1a1a";
      context.lineWidth = 4;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const nextPoint = point(event);
    context.beginPath();
    context.moveTo(nextPoint.x, nextPoint.y);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !drawingRef.current) return;

    const nextPoint = point(event);
    context.lineTo(nextPoint.x, nextPoint.y);
    context.stroke();
    setEmpty(false);
    onChange(canvas.toDataURL("image/png"));
  }

  function stop(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawingRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    if (!empty) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
    onChange("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <PenLine className="h-4 w-4" />
          Sign inside the box
        </div>
        <Button type="button" variant="outline" size="lg" className="min-h-11 px-4" onClick={clear}>
          <Eraser className="h-4 w-4" />
          Clear
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className="h-full min-h-[360px] touch-none rounded-lg border-2 border-foreground bg-white"
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
    </div>
  );
}
