"use client";

import { useEffect, useState } from "react";
import { jobs } from "@/lib/mock/jobs";
import { Cloud, CloudRain, Sun } from "lucide-react";

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
  weather: WeatherData | null;
  loading: boolean;
};

const getWeatherIcon = (weatherCode: number) => {
  if (weatherCode === 0 || weatherCode === 1) return <Sun className="h-5 w-5 text-yellow-400" />;
  if (weatherCode === 2 || weatherCode === 3) return <Cloud className="h-5 w-5 text-gray-400" />;
  if (weatherCode >= 45 && weatherCode <= 82) return <CloudRain className="h-5 w-5 text-blue-400" />;
  return <Cloud className="h-5 w-5 text-gray-400" />;
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

  useEffect(() => {
    const activeJobs = jobs.filter((j) => j.status === "active");
    const initWeather = activeJobs.map((job) => ({
      jobId: job.id,
      jobName: job.name,
      address: job.address,
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
          weather,
          loading: false,
        }))
      )
    ).then((results) => {
      setJobsWeather(results);
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
    <div className="border-b border-gray-300 bg-gray-100 px-6 py-3 shadow-md">
      <div
        key={currentIndex}
        className="flex items-center justify-between gap-4 animate-in fade-in slide-in-from-right-2 duration-500"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 rounded-lg border-2 border-slate-400 p-2">
            {current.weather && getWeatherIcon(current.weather.icon)}
            {!current.weather && current.loading && <div className="h-5 w-5 animate-pulse rounded-full bg-gray-400" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-gray-900">{current.jobName}</div>
            <div className="truncate text-xs text-gray-600">{current.address}</div>
          </div>

          {current.weather && (
            <div className="flex items-center gap-5 flex-shrink-0">
              <div className="border-l border-gray-300 pl-5 text-right">
                <div className="text-lg font-bold text-gray-900">{current.weather.current_temp}°C</div>
                <div className="text-xs text-gray-600">{current.weather.condition}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-red-600">{current.weather.max_temp}°/{current.weather.min_temp}°</div>
                <div className="text-xs text-gray-600">H/L</div>
              </div>
            </div>
          )}
        </div>

        {jobsWeather.length > 1 && (
          <div className="flex-shrink-0 flex gap-2 ml-4">
            {jobsWeather.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-6 bg-red-500" : "w-2 bg-gray-400 hover:bg-gray-500"
                }`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to job ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
