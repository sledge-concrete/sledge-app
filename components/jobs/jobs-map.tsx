"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { Map as LeafletMap, CircleMarker as LCircleMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { type JobsApiItem, STATUS_COLOR, STATUS_LABEL } from "@/lib/jobs-types";

type Props = {
  jobs: JobsApiItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const DEFAULT_CENTER: [number, number] = [51.0447, -114.0719];
const DEFAULT_ZOOM = 10;
const SELECTED_ZOOM = 14;

function FlyToSelected({ jobs, selectedId }: { jobs: JobsApiItem[]; selectedId: string | null }) {
  const map = useMap();
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === lastIdRef.current) return;
    const job = jobs.find((j) => j.id === selectedId);
    if (!job) return;
    map.flyTo([job.lat, job.lng], SELECTED_ZOOM, { duration: 0.8 });
    lastIdRef.current = selectedId;
  }, [selectedId, jobs, map]);

  return null;
}

function FitBounds({ jobs, selectedId }: { jobs: JobsApiItem[]; selectedId: string | null }) {
  const map = useMap();
  const didFitRef = useRef(false);

  useEffect(() => {
    if (didFitRef.current || selectedId) return;
    if (!jobs.length) return;
    const bounds: [number, number][] = jobs.map((j) => [j.lat, j.lng]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    didFitRef.current = true;
  }, [jobs, selectedId, map]);

  return null;
}

export function JobsMap({ jobs, selectedId, onSelect }: Props) {
  const markerRefs = useRef<Map<string, LCircleMarker>>(new Map());
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    const marker = markerRefs.current.get(selectedId);
    if (marker) marker.openPopup();
  }, [selectedId]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={false}
      className="h-full w-full"
      ref={(m) => {
        mapRef.current = m;
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds jobs={jobs} selectedId={selectedId} />
      <FlyToSelected jobs={jobs} selectedId={selectedId} />
      {jobs.map((job) => {
        const isSelected = job.id === selectedId;
        return (
          <CircleMarker
            key={job.id}
            center={[job.lat, job.lng]}
            radius={isSelected ? 14 : 9}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: STATUS_COLOR[job.status],
              fillOpacity: 0.95,
            }}
            ref={(ref) => {
              if (ref) markerRefs.current.set(job.id, ref);
              else markerRefs.current.delete(job.id);
            }}
            eventHandlers={{
              click: () => onSelect(job.id),
            }}
          >
            <Popup>
              <div className="space-y-0.5 text-[13px]">
                <div className="font-semibold text-foreground">{job.name}</div>
                <div className="text-muted-foreground">#{job.number}</div>
                <div className="text-muted-foreground">{job.client_name}</div>
                <div className="text-[11px] uppercase tracking-wide" style={{ color: STATUS_COLOR[job.status] }}>
                  {STATUS_LABEL[job.status]}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
