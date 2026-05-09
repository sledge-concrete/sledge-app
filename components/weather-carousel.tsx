"use client";

import { useEffect, useState } from "react";
import { jobs } from "@/lib/mock/jobs";
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react";

type WeatherData = {
  current_temp: number;
  max_temp: number;
  min_temp: number;
  condition: string;
  icon: number;
};

type JobWeather = {
  jobId: string;
  jobName: string;
  address: string;
  lat: number;
  lng: number;
  weather: WeatherData | null;
  loading: boolean;
  error?: string;
};

const getWeatherIcon = (weatherCode: number) => {
  if (weatherCode === 0 || weatherCode === 1) return <Sun className="h-8 w-8 text-yellow-400" />;
  if (weatherCode === 2 || weatherCode === 3) return <Cloud className="h-8 w-8 text-gray-400" />;
  if (weatherCode >= 45 && weatherCode <= 82) return <CloudRain className="h-8 w-8 text-blue-400" />;
  return <Cloud className="h-8 w-8 text-gray-400" />;
};

const getWeatherDescription = (code: number): string => {
  const conditions: { [key: number]: string } = {
    0: "Clear",
    1: "Mostly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light Rain",
    53: "Moderate Rain",
    55: "Heavy Rain",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
  };
  return conditions[code] || "Unknown";
};

async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius&timezone=auto`
    );

    if (!response.ok) throw new Error("Weather fetch failed");

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    return {
      current_temp: Math.round(current.temperature_2m),
      max_temp: Math.round(daily.temperature_2m_max[0]),
      min_temp: Math.round(daily.temperature_2m_min[0]),
      condition: getWeatherDescription(current.weather_code),
      icon: current.weather_code,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}

export function WeatherCarousel() {
  const [jobsWeather, setJobsWeather] = useState<JobWeather[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const activeJobs = jobs.filter((j) => j.status === "active");
    const initWeather = activeJobs.map((job) => ({
      jobId: job.id,
      jobName: job.name,
      address: job.address,
      lat: job.lat,
      lng: job.lng,
      weather: null,
      loading: true,
    }));

    setJobsWeather(initWeather);

    Promise.all(
      activeJobs.map((job) =>
        fetchWeather(job.lat, job.lng).then((weather) => ({
          jobId: job.id,
          jobName: job.name,
          address: job.address,
          lat: job.lat,
          lng: job.lng,
          weather,
          loading: false,
        }))
      )
    ).then((results) => {
      setJobsWeather(results);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (jobsWeather.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % jobsWeather.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [jobsWeather.length]);

  if (jobsWeather.length === 0) return null;

  const current = jobsWeather[currentIndex];

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {current.weather && getWeatherIcon(current.weather.icon)}
              {!current.weather && current.loading && <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300" />}
            </div>

            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900">{current.jobName}</h3>
              <p className="mt-1 text-sm text-slate-600">{current.address}</p>

              {current.weather && (
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Now</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{current.weather.current_temp}°C</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">High/Low</p>
                    <p className="mt-1 text-lg font-semibold text-slate-700">
                      {current.weather.max_temp}° / {current.weather.min_temp}°
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Condition</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">{current.weather.condition}</p>
                  </div>
                </div>
              )}

              {!current.weather && !current.loading && (
                <p className="mt-2 text-sm text-slate-500">Weather data unavailable</p>
              )}
            </div>
          </div>
        </div>

        {jobsWeather.length > 1 && (
          <div className="ml-4 flex gap-2">
            {jobsWeather.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? "w-6 bg-slate-700" : "w-2 bg-slate-300 hover:bg-slate-500"
                }`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {jobsWeather.length > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <p>
            Job {currentIndex + 1} of {jobsWeather.length}
          </p>
          <p>Auto-rotating every 5 seconds</p>
        </div>
      )}
    </div>
  );
}
