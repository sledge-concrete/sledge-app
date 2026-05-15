import { NextResponse } from "next/server";
import { jobs } from "@/lib/mock/jobs";
import type { JobsApiItem } from "@/lib/jobs-types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { JobsListRow } from "@/lib/supabase/types";

export async function GET() {
  const supabase = createServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("jobs_list_view")
      .select("*")
      .order("job_number", { ascending: true });

    if (!error && data) {
      return NextResponse.json(data.map(mapSupabaseJob));
    }

    console.error("Supabase jobs fetch failed; falling back to mock jobs.", error);
  }

  return NextResponse.json(getMockJobsPayload());
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
