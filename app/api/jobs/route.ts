import { NextResponse } from "next/server";
import { jobs } from "@/lib/mock/jobs";
import type { JobsApiItem } from "@/lib/jobs-types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { JobRow, JobsListRow } from "@/lib/supabase/types";

export async function GET() {
  const supabase = createServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("jobs_list_view")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json(data.map(mapSupabaseJob));
    }

    console.error("Supabase jobs fetch failed; falling back to mock jobs.", error);
  }

  return NextResponse.json(getMockJobsPayload());
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const body = await request.json();

  const { data: maxRow } = await supabase
    .from("jobs")
    .select("job_number")
    .order("job_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const year = new Date().getFullYear();
  let nextNum = 1;
  if (maxRow?.job_number) {
    const parts = maxRow.job_number.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }
  const jobNumber = `SC-${year}-${String(nextNum).padStart(3, "0")}`;

  const { data: newJob, error } = await supabase
    .from("jobs")
    .insert({
      name: body.name,
      job_number: jobNumber,
      client_name: body.client_name,
      address: body.address,
      status: body.status,
      start_date: body.start_date,
      latitude: body.latitude,
      longitude: body.longitude,
      service_type: body.service_type ?? null,
      notes: body.notes ?? null,
    })
    .select()
    .single();

  if (error || !newJob) {
    console.error("Supabase job insert failed.", error);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  const row = newJob as JobRow;
  const result: JobsApiItem = {
    id: row.id,
    name: row.name,
    number: row.job_number,
    client_name: row.client_name,
    address: row.address,
    status: row.status,
    worker_count: 0,
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    service_type: row.service_type ?? undefined,
    notes: row.notes ?? undefined,
  };

  return NextResponse.json(result, { status: 201 });
}

function getMockJobsPayload(): JobsApiItem[] {
  return jobs.map((j) => ({
    id: j.id,
    name: j.name,
    number: j.number,
    client_name: j.client_name,
    address: j.address,
    status: j.status,
    worker_count: j.worker_count,
    lat: j.lat,
    lng: j.lng,
    service_type: j.service_type,
    notes: j.notes,
    supervisorId: j.supervisorId,
    crew: j.crew,
  }));
}

function mapSupabaseJob(row: JobsListRow): JobsApiItem {
  return {
    id: row.legacy_mock_id ?? row.id,
    name: row.name,
    number: row.job_number,
    client_name: row.client_name,
    address: row.address,
    status: row.status,
    worker_count: row.worker_count,
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    service_type: row.service_type ?? undefined,
    notes: row.notes ?? undefined,
    supervisorId: row.supervisor_legacy_mock_id ?? undefined,
    crew: row.crew_legacy_mock_ids,
  };
}
