"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Job } from "@/lib/mock/types";

type Props = {
  job: Job;
};

const DEFAULT_ZOOM = 13;

// Fix leaflet default icon issue
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function CenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], DEFAULT_ZOOM);
  }, [lat, lng, map]);

  return null;
}

export function JobLocationMap({ job }: Props) {
  return (
    <MapContainer
      center={[job.lat, job.lng]}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={false}
      style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
      className="relative z-10"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <CenterMap lat={job.lat} lng={job.lng} />
      <Marker position={[job.lat, job.lng]} icon={defaultIcon}>
        <Popup>
          <div className="text-sm">
            <div className="font-semibold">{job.name}</div>
            <div className="text-xs text-muted-foreground">{job.address}</div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
