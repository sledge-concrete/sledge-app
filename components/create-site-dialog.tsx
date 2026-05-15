"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { JobsApiItem } from "@/lib/jobs-types";
import type { JobStatus } from "@/lib/mock/types";

const SERVICE_TYPES = [
  "Residential foundation",
  "Commercial foundation",
  "RTM foundation",
  "Agricultural project",
  "Retaining wall",
  "Slab or floor",
  "Apron or sidewalk",
  "Driveway",
  "Other",
];

const STATUSES: JobStatus[] = ["active", "hold", "completed"];

type SiteFormData = {
  name: string;
  client_name: string;
  start_date: string;
  address: string;
  serviceType: string;
  status: JobStatus;
  notes: string;
  photos: File[];
  photoUrls: string[];
  lat: number;
  lng: number;
};

export function CreateSiteDialog({
  open,
  onOpenChange,
  onSiteCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSiteCreated: (site: JobsApiItem) => void;
}) {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<SiteFormData>({
    name: "",
    client_name: "",
    start_date: today,
    address: "",
    serviceType: "",
    status: "active",
    notes: "",
    photos: [],
    photoUrls: [],
    lat: 51.0447,
    lng: -114.0719,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: keyof SiteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, file],
          photoUrls: [...prev.photoUrls, event.target?.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoUrls: prev.photoUrls.filter((_, i) => i !== index),
    }));
  };

  const handleGPSClick = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const coordsString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setFormData((prev) => ({ ...prev, lat: latitude, lng: longitude, address: coordsString }));
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || "Unnamed Site",
          client_name: formData.client_name || "Sledge Concrete",
          address: formData.address || "TBD",
          status: formData.status,
          start_date: formData.start_date,
          latitude: formData.lat,
          longitude: formData.lng,
          service_type: formData.serviceType || null,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${response.status}`);
      }

      const newSite = (await response.json()) as JobsApiItem;
      onSiteCreated(newSite);
      setFormData({ name: "", client_name: "", start_date: today, address: "", serviceType: "", status: "active", notes: "", photos: [], photoUrls: [], lat: 51.0447, lng: -114.0719 });
      onOpenChange(false);
      toast.success(`${newSite.name} has been created successfully`, {
        icon: "✓",
        duration: 4000,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to create site. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: "#c0392b", fontWeight: 700 }}>Create New Site</DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-lg p-3 text-sm font-medium border" style={{ backgroundColor: "#c0392b15", color: "#c0392b", borderColor: "#c0392b40" }}>{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-serif text-slate-900">Site Name</Label>
              <Input id="name" placeholder="e.g., Downtown Office Building" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="client_name" className="text-sm font-serif text-slate-900">Client Name</Label>
              <Input id="client_name" placeholder="e.g., ABC Developments" value={formData.client_name} onChange={(e) => handleInputChange("client_name", e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="start_date" className="text-sm font-serif text-slate-900">Start Date</Label>
              <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => handleInputChange("start_date", e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="serviceType" className="text-sm font-serif text-slate-900">Service Type</Label>
              <select
                id="serviceType"
                value={formData.serviceType}
                onChange={(e) => handleInputChange("serviceType", e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2"
                style={{ borderColor: "inherit", outlineColor: "#c0392b", boxShadow: "0 0 0 2px rgba(192, 57, 43, 0.2)" }}
              >
                <option value="">Select service type</option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="address" className="text-sm font-serif text-slate-900">Location</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleGPSClick}>
                  <MapPin className="h-4 w-4" />
                  {formData.lat !== 51.0447 ? "GPS ✓" : "GPS"}
                </Button>
              </div>
              <Input
                id="address"
                placeholder="e.g., 123 Main St, Calgary"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="status" className="text-sm font-serif text-slate-900">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value as JobStatus)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2"
                style={{ borderColor: "inherit", outlineColor: "#c0392b", boxShadow: "0 0 0 2px rgba(192, 57, 43, 0.2)" }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-serif text-slate-900">Files</Label>
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition-colors cursor-pointer" style={{ "--hover-color": "#c0392b" } as any} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c0392b")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-600">Click to upload photos</span>
              </label>
            </div>

            {formData.photoUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-3">
                {formData.photoUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "#c0392b" }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-serif text-slate-900">Notes</Label>
            <Textarea id="notes" placeholder="Any additional details about the site..." value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="h-10 px-4 text-base">
              Cancel
            </Button>
            <Button type="submit" className="h-10 px-4 text-base text-white" style={{ backgroundColor: "#c0392b" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a02f23")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c0392b")} disabled={submitting}>
              {submitting ? "Creating..." : "Create Site"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
