"use client";

import React, { useEffect, useRef, useState } from "react";
import SafeIcon from "@/components/common/SafeIcon";
import { Chip } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ALERT_API =
  `${API_BASE}/fire-fighter/live-incident-command/get_latest_detection.php`;

const FETCH_INTERVAL = 1000;
const FIRE_TIMEOUT = 12000;

export default function DetectionAlert({ selectedDrone, isMaximized = false }) {
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 track last time fire was seen
  const lastFireTimeRef = useRef(0);

  const normalizeData = (data) => ({
    id: data.id ?? data.ID,
    confidence: data.confidence ?? data.CONFIDENCE,
    fire_count: data.fire_count ?? data.FIRE_COUNT,
    intensity_score: data.intensity_score ?? data.INTENSITY_SCORE,
    intensity_level: data.intensity_level ?? data.INTENSITY_LEVEL,
    created_at: data.created_at ?? data.CREATED_AT,
  });

 const fetchAlert = async () => {
  try {
    if (!selectedDrone) return;

    const res = await fetch(
      `${ALERT_API}?drone_code=${selectedDrone}&t=${Date.now()}`
    );

    // 🔒 Read as text first (prevents crash)
    const text = await res.text();

    if (!text) {
      console.warn("⚠️ Empty API response");
      return;
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("❌ Invalid JSON:", text);
      return;
    }

    const now = Date.now();

    if (json?.status?.trim() === "fire" && json?.data) {
      const normalized = normalizeData(json.data);

      setAlert(normalized);
      lastFireTimeRef.current = now;

    } else if (json?.status?.trim() === "no_fire") {
      setAlert(null);
      lastFireTimeRef.current = 0;

    } else if (json?.status === "error") {
      console.error("❌ API Error:", json.message);
    }

  } catch (err) {
    console.log("❌ Fetch error:", err);

    const now = Date.now();
    if (now - lastFireTimeRef.current > FIRE_TIMEOUT) {
      setAlert(null);
    }
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (!selectedDrone) return;

  // 🔄 Reset state when switching drone
  setAlert(null);
  setLoading(true);
  lastFireTimeRef.current = 0;

  fetchAlert();

  const interval = setInterval(fetchAlert, FETCH_INTERVAL);

  return () => clearInterval(interval);
}, [selectedDrone]);

  return (
    <div className={`flex flex-col h-full ${isMaximized ? "p-6" : "p-4"}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SafeIcon name="Box" className="h-5 w-5 text-[#dc2626]" />
          <h3 className={`font-semibold ${isMaximized ? "text-xl" : "text-base"}`}>
            AI Detection
          </h3>
        </div>

        <Chip
          label={
            <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded animate-pulse">
              LIVE
            </span>
          }
          color="error"
          size="small"
        />
      </div>

      {/* Panel */}
      <div className="flex-1 rounded-lg border border-dashed border-[#2E2E2E] bg-muted/20 flex items-center justify-center">

        {loading && <span className="text-sm">Loading…</span>}

        {!loading && !alert && (
          <p className="text-base font-semibold text-green-500">
            No Fire Detected
          </p>
        )}

        {!loading && alert && (
          <div className="text-center space-y-2">

            <p className="text-base font-semibold text-red-500">
              🔥 Fire Detected
            </p>

            <p className="text-xs text-white">
              Confidence: {(Number(alert.confidence) * 100).toFixed(1)}%
            </p>

            <p className="text-xs text-white">
              Fire Count: {alert.fire_count}
            </p>

            <p className="text-xs text-white">
              Intensity Score: {alert.intensity_score}
            </p>

            <p className="text-xs text-white">
              Intensity Level: {alert.intensity_level}
            </p>

          </div>
        )}

      </div>
    </div>
  );
}