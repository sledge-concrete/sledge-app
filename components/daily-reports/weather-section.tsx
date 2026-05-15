"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, Wind, Droplets, Gauge } from "lucide-react";
import type { WeatherSnapshot } from "@/lib/mock/daily-reports";

interface WeatherSectionProps {
  weather: WeatherSnapshot[];
  isLocked: boolean;
}

export function WeatherSection({ weather, isLocked }: WeatherSectionProps) {
  const [overrides, setOverrides] = useState<Record<string, WeatherSnapshot["override"]>>({});
  const [showOverride, setShowOverride] = useState<Record<string, boolean>>({});

  const handleOverride = (time: string, field: string, value: number) => {
    setOverrides((prev) => ({
      ...prev,
      [time]: {
        ...(prev[time] || {}),
        [field]: value,
      },
    }));
  };

  const getWeatherValue = (snapshot: WeatherSnapshot, field: "temp" | "precip" | "wind" | "humidity"): number => {
    const override = overrides[snapshot.time];
    if (override && override[field] !== undefined) {
      return override[field]!;
    }
    return snapshot[field] as number;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weather</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {weather.map((snapshot) => (
            <div key={snapshot.time} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{snapshot.time}</h3>
                {!isLocked && (
                  <button
                    onClick={() => setShowOverride((prev) => ({ ...prev, [snapshot.time]: !prev[snapshot.time] }))}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {showOverride[snapshot.time] ? "Done" : "Override"}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Temperature */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Gauge className="h-4 w-4" />
                    <span>Temp</span>
                  </div>
                  {showOverride[snapshot.time] ? (
                    <input
                      type="number"
                      value={getWeatherValue(snapshot, "temp")}
                      onChange={(e) => handleOverride(snapshot.time, "temp", parseInt(e.target.value))}
                      className="w-16 rounded border px-2 py-1 text-sm"
                      disabled={isLocked}
                    />
                  ) : (
                    <span className="text-sm font-medium">{getWeatherValue(snapshot, "temp")}°C</span>
                  )}
                </div>

                {/* Precipitation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Droplets className="h-4 w-4" />
                    <span>Precip</span>
                  </div>
                  {showOverride[snapshot.time] ? (
                    <input
                      type="number"
                      value={getWeatherValue(snapshot, "precip")}
                      onChange={(e) => handleOverride(snapshot.time, "precip", parseFloat(e.target.value))}
                      className="w-16 rounded border px-2 py-1 text-sm"
                      disabled={isLocked}
                      step="0.1"
                    />
                  ) : (
                    <span className="text-sm font-medium">{getWeatherValue(snapshot, "precip")}mm</span>
                  )}
                </div>

                {/* Wind */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Wind className="h-4 w-4" />
                    <span>Wind</span>
                  </div>
                  {showOverride[snapshot.time] ? (
                    <input
                      type="number"
                      value={getWeatherValue(snapshot, "wind")}
                      onChange={(e) => handleOverride(snapshot.time, "wind", parseInt(e.target.value))}
                      className="w-16 rounded border px-2 py-1 text-sm"
                      disabled={isLocked}
                    />
                  ) : (
                    <span className="text-sm font-medium">{getWeatherValue(snapshot, "wind")}km/h</span>
                  )}
                </div>

                {/* Humidity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Cloud className="h-4 w-4" />
                    <span>Humidity</span>
                  </div>
                  {showOverride[snapshot.time] ? (
                    <input
                      type="number"
                      value={getWeatherValue(snapshot, "humidity")}
                      onChange={(e) => handleOverride(snapshot.time, "humidity", parseInt(e.target.value))}
                      className="w-16 rounded border px-2 py-1 text-sm"
                      disabled={isLocked}
                      max="100"
                      min="0"
                    />
                  ) : (
                    <span className="text-sm font-medium">{getWeatherValue(snapshot, "humidity")}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
