"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Upload, X } from "lucide-react";
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
  address: string;
  serviceType: string;
  status: JobStatus;
  notes: string;
  photos: File[];
  photoUrls: string[];
};

export function CreateSiteDialog({ open, onOpenChange, onSiteCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onSiteCreated: (site: any) => void }) {
  const [formData, setFormData] = useState<SiteFormData>({
    name: "",
    address: "",
    serviceType: "",
    status: "active",
    notes: "",
    photos: [],
    photoUrls: [],
  });

  const [successMessage, setSuccessMessage] = useState("");

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
        setFormData((prev) => ({ ...prev, address: coordsString }));
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newSite = {
      id: `job-new-${Date.now()}`,
      name: formData.name || "Unnamed Site",
      number: `SC-2026-${Math.floor(Math.random() * 999)}`,
      client_name: "New Client",
      address: formData.address || "TBD",
      status: formData.status,
      startDate: new Date().toISOString().split("T")[0],
      supervisorId: "u-sarah",
      crew: [],
      hoursLogged: 0,
      worker_count: 0,
      lat: 51.0421,
      lng: -114.0533,
      service_type: formData.serviceType || undefined,
      notes: formData.notes || undefined,
    };

    onSiteCreated(newSite);
    setSuccessMessage("Site created successfully!");

    setTimeout(() => {
      setFormData({ name: "", address: "", serviceType: "", status: "active", notes: "", photos: [], photoUrls: [] });
      setSuccessMessage("");
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-red-600">Create New Site</DialogTitle>
        </DialogHeader>

        {successMessage && (
          <div className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700 border border-green-200">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-serif text-slate-900">Site Name</Label>
              <Input id="name" placeholder="e.g., Downtown Office Building" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="serviceType" className="text-sm font-serif text-slate-900">Service Type</Label>
              <select
                id="serviceType"
                value={formData.serviceType}
                onChange={(e) => handleInputChange("serviceType", e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:border-red-400 transition-colors cursor-pointer">
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
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Create Site
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
