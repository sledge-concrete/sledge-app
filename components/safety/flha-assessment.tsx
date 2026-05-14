"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { AlertCircle, CheckSquare, ChevronDown, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import type { Employee } from "@/lib/mock/types";
import type { FlhaControl, FlhaFormValues, FlhaHazard, FlhaSession } from "@/lib/flha-types";
import { POTENTIAL_HAZARDS, REQUIRED_CONTROLS } from "@/lib/flha-types";
import { getTodayDate } from "@/lib/mock/flha";
import { cn } from "@/lib/utils";

type FormState = FlhaFormValues;

export function FlhaAssessmentForm({
  workers,
  defaults,
  onSubmit,
  onCancel,
}: {
  workers: Employee[];
  defaults: Pick<FormState, "work_location" | "sr_number" | "work_crew" | "supervisor_name" | "supervisor_phone">;
  onSubmit: (values: FormState) => void;
  onCancel: () => void;
}) {
  const today = getTodayDate();
  const [values, setValues] = useState<FormState>({
    work_location: defaults.work_location ?? "",
    sr_number: defaults.sr_number ?? "",
    work_crew: typeof defaults.work_crew === "string" ? [] : defaults.work_crew || [],
    supervisor_name: defaults.supervisor_name ?? "",
    supervisor_phone: defaults.supervisor_phone ?? "",
    filled_by: defaults.filled_by ?? workers[0]?.name ?? "",
    job_description: defaults.job_description ?? "",
    session_date: today,
    hazards: defaults.hazards ?? [],
    controls: defaults.controls ?? [],
    other_hazards: defaults.other_hazards ?? ["", "", ""],
    other_controls: defaults.other_controls ?? "",
    comments: defaults.comments ?? "",
  });
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validate(values), [values]);
  const showErrors = submitted && errors.length > 0;

  useEffect(() => {
    if (showErrors) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showErrors]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (errors.length > 0) return;
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-card p-4 md:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-medium">Field Level Hazard Assessment</h2>
          <p className="mt-1 text-sm sledge-meta">One assessment per job site per day.</p>
        </div>
        <div className="rounded-lg border bg-muted px-3 py-2 text-sm">
          <span className="text-muted-foreground">Assessment Date</span>
          <div className="font-semibold">{today}</div>
        </div>
      </div>

      {showErrors && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" />
            Check the assessment before submitting
          </div>
          <ul className="list-inside list-disc space-y-0.5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Work Location" required>
          <Input
            value={values.work_location}
            onChange={(event) => setValues((current) => ({ ...current, work_location: event.target.value }))}
            className="min-h-11"
          />
        </Field>
        <Field label="SR#">
          <Input
            value={values.sr_number}
            onChange={(event) => setValues((current) => ({ ...current, sr_number: event.target.value }))}
            className="min-h-11"
          />
        </Field>
        <Field label="Description of Job or Task" required>
          <Input
            value={values.job_description}
            onChange={(event) => setValues((current) => ({ ...current, job_description: event.target.value }))}
            className="min-h-11"
          />
        </Field>
        <Field label="Supervisor in Charge" required>
          <WorkerSelect
            value={values.supervisor_name}
            onChange={(value) => setValues((current) => ({ ...current, supervisor_name: value }))}
            workers={workers}
            placeholder="Select supervisor"
          />
        </Field>
        <Field label="Phone/Cell">
          <Input
            value={values.supervisor_phone}
            onChange={(event) => setValues((current) => ({ ...current, supervisor_phone: event.target.value }))}
            className="min-h-11"
          />
        </Field>
        <Field label="Completed By" required>
          <WorkerSelect
            value={values.filled_by}
            onChange={(value) => setValues((current) => ({ ...current, filled_by: value }))}
            workers={workers}
            placeholder="Select worker"
          />
        </Field>
        <Field label="Assessment Date">
          <Input value={values.session_date} readOnly className="min-h-11 bg-muted font-semibold" />
        </Field>
      </div>

      <Field label="Work Crew (Select members who will sign)">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker) => {
            const isSelected = (values.work_crew as string[]).includes(worker.name);
            return (
              <button
                key={worker.id}
                type="button"
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    work_crew: isSelected
                      ? (current.work_crew as string[]).filter((name) => name !== worker.name)
                      : [...(current.work_crew as string[]), worker.name],
                  }))
                }
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg border bg-background px-3 py-2 text-left text-sm font-medium",
                  isSelected && "border-primary bg-primary/5 text-primary",
                )}
              >
                {isSelected ? <CheckSquare className="h-5 w-5 shrink-0" /> : <Square className="h-5 w-5 shrink-0" />}
                <span>{worker.name}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <ChecklistSection
        title="Potential Hazards"
        options={POTENTIAL_HAZARDS}
        selected={values.hazards}
        onToggle={(option) => toggleHazard(option, values, setValues)}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {values.other_hazards.map((other, index) => (
          <Field key={index} label={`Other Hazard ${index + 1}`}>
            <Input
              value={other}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  other_hazards: current.other_hazards.map((value, i) => (i === index ? event.target.value : value)),
                }))
              }
              className="min-h-11"
            />
          </Field>
        ))}
      </div>

      <ChecklistSection
        title="Required Hazard Controls"
        options={REQUIRED_CONTROLS}
        selected={values.controls}
        onToggle={(option) => toggleControl(option, values, setValues)}
      />

      <Field label="Other Control">
        <Input
          value={values.other_controls}
          onChange={(event) => setValues((current) => ({ ...current, other_controls: event.target.value }))}
          className="min-h-11"
        />
      </Field>

      <Field label="Additional Information / Comments">
        <Textarea
          value={values.comments}
          onChange={(event) => setValues((current) => ({ ...current, comments: event.target.value }))}
          className="min-h-36"
        />
      </Field>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" size="lg" className="min-h-11 px-5 text-base" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg" className="min-h-11 px-5 text-base">
          Submit Assessment
        </Button>
      </div>
    </form>
  );
}

export function FlhaReadonlyAssessment({ session }: { session: FlhaSession }) {
  return (
    <div className="space-y-5 rounded-lg border bg-card p-4 md:p-5">
      <div>
        <h2 className="text-2xl font-medium">Field Level Hazard Assessment</h2>
        <p className="mt-1 text-sm sledge-meta">Submitted assessments are read-only.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ReadOnlyField label="Work Location" value={session.work_location} />
        <ReadOnlyField label="SR#" value={session.sr_number} />
        <ReadOnlyField label="Work Crew" value={Array.isArray(session.work_crew) ? session.work_crew.join(", ") : session.work_crew} />
        <ReadOnlyField label="Description of Job or Task" value={session.job_description} />
        <ReadOnlyField label="Supervisor in Charge" value={session.supervisor_name} />
        <ReadOnlyField label="Phone/Cell" value={session.supervisor_phone} />
        <ReadOnlyField label="Completed By" value={session.filled_by} />
        <ReadOnlyField label="Assessment Date" value={session.session_date} />
      </div>

      <ReadonlyChecklist
        title="Potential Hazards"
        options={POTENTIAL_HAZARDS}
        checked={session.hazards}
        otherValues={session.other_hazards}
      />
      <ReadonlyChecklist
        title="Required Hazard Controls"
        options={REQUIRED_CONTROLS}
        checked={session.controls}
        otherValue={session.other_controls}
      />
      <ReadOnlyField label="Additional Information / Comments" value={session.comments || "None"} multiline />
    </div>
  );
}

export function FlhaCompactSummary({ session }: { session: FlhaSession }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.04em] text-muted-foreground">Job or Task</div>
        <p className="mt-1 text-lg leading-relaxed">{session.job_description}</p>
      </div>
      <ReadonlyChecklist title="Potential Hazards" options={POTENTIAL_HAZARDS} checked={session.hazards} />
      <ReadonlyChecklist title="Required Hazard Controls" options={REQUIRED_CONTROLS} checked={session.controls} />
      {session.comments && <ReadOnlyField label="Additional Information / Comments" value={session.comments} multiline />}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col space-y-1.5">
      <span className="text-sm font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        {label}
        {required ? <span className="ml-1 text-primary">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function ReadOnlyField({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <div className="text-[0.7rem] font-medium uppercase tracking-[0.04em] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-sm font-medium", multiline && "min-h-20 whitespace-pre-wrap leading-relaxed")}>
        {value || " "}
      </div>
    </div>
  );
}

function ChecklistSection<T extends string>({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: T[];
  selected: T[];
  onToggle: (option: T) => void;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xl font-medium">{title}</h3>
      <div className="grid gap-2 md:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-lg border bg-background px-3 py-2 text-left text-base font-medium",
                checked && "border-primary bg-primary/5 text-primary",
              )}
            >
              {checked ? <CheckSquare className="h-5 w-5 shrink-0" /> : <Square className="h-5 w-5 shrink-0" />}
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ReadonlyChecklist({
  title,
  options,
  checked,
  otherValues,
  otherValue,
}: {
  title: string;
  options: string[];
  checked: string[];
  otherValues?: string[];
  otherValue?: string;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xl font-medium">{title}</h3>
      <div className="grid gap-2 md:grid-cols-2">
        {options.map((option) => {
          const isChecked = checked.includes(option);
          return (
            <div
              key={option}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg border bg-background px-3 py-2 text-base",
                isChecked && "border-primary bg-primary/5 font-semibold text-primary",
              )}
            >
              {isChecked ? <CheckSquare className="h-5 w-5 shrink-0" /> : <Square className="h-5 w-5 shrink-0" />}
              <span>
                {option}
                {option === "Other" && otherValue ? `: ${otherValue}` : ""}
              </span>
            </div>
          );
        })}
        {otherValues?.map((value, index) => (
          <div key={index} className="flex min-h-11 items-center gap-3 rounded-lg border bg-background px-3 py-2 text-base">
            {value ? <CheckSquare className="h-5 w-5 shrink-0 text-primary" /> : <Square className="h-5 w-5 shrink-0" />}
            <span>
              Other {index + 1}
              {value ? `: ${value}` : ""}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function toggleHazard(option: FlhaHazard, values: FormState, setValues: React.Dispatch<React.SetStateAction<FormState>>) {
  setValues({ ...values, hazards: toggleValue(values.hazards, option) });
}

function toggleControl(option: FlhaControl, values: FormState, setValues: React.Dispatch<React.SetStateAction<FormState>>) {
  setValues({ ...values, controls: toggleValue(values.controls, option) });
}

function toggleValue<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((current) => current !== item) : [...items, item];
}

function WorkerSelect({
  value,
  onChange,
  workers,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  workers: Employee[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedWorker = workers.find((w) => w.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-left outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 flex items-center justify-between">
        <span className={`text-base ${value ? "text-foreground font-medium" : "text-muted-foreground"}`}>
          {selectedWorker?.name || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-72 p-2" side="bottom" align="start">
        <div className="flex flex-col gap-1">
          {workers.map((worker) => (
            <button
              key={worker.id}
              type="button"
              onClick={() => {
                onChange(worker.name);
                setOpen(false);
              }}
              className={cn(
                "px-4 py-3 text-base text-left rounded hover:bg-accent transition-colors",
                value === worker.name && "bg-primary/10 font-medium"
              )}
            >
              {worker.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function validate(values: FormState) {
  const errors: string[] = [];
  if (!values.work_location.trim()) errors.push("Work Location is required.");
  if (!values.job_description.trim()) errors.push("Job Description is required.");
  if (!values.supervisor_name.trim()) errors.push("Supervisor is required.");
  if (!values.filled_by.trim()) errors.push("Completed By is required.");
  const workCrew = Array.isArray(values.work_crew) ? values.work_crew : [];
  if (workCrew.length === 0) errors.push("Select at least one crew member.");
  if (values.hazards.length === 0 && values.other_hazards.every((value) => !value.trim())) {
    errors.push("Select at least one hazard.");
  }
  if (values.controls.length === 0) errors.push("Select at least one hazard control.");
  return errors;
}
