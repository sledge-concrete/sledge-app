import { NextResponse } from "next/server";
import { jobs } from "@/lib/mock/jobs";

export async function GET() {
  const payload = jobs.map((j) => ({
    id: j.id,
    name: j.name,
    number: j.number,
    client_name: j.client_name,
    address: j.address,
    status: j.status,
    worker_count: j.worker_count,
    lat: j.lat,
    lng: j.lng,
  }));
  return NextResponse.json(payload);
}
