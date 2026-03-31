"use client";

import React, { useEffect, useRef, useState } from "react";
import SafeIcon from "@/components/common/SafeIcon";
import { Chip } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ALERT_API =
  `${API_BASE}/fire-fighter/live-incident-command/get_latest_detection.php`;

const FETCH_INTERVAL = 1000; // 1 sec
const FIRE_TIMEOUT = 5000; // 5 sec

export default function DetectionAlert({ isMaximized = false }) {
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  const lastIdRef = useRef(null);
  const timeoutRef = useRef(null);

  // normalize API fields
  const normalizeData = (data) => ({
    id: data.id ?? data.ID,
    confidence: data.confidence ?? data.CONFIDENCE,
    fire_count: data.fire_count ?? data.FIRE_COUNT,
    intensity_level: data.intensity_level ?? data.INTENSITY_LEVEL,
    created_at: data.created_at ?? data.CREATED_AT,
  });

  const fetchAlert = async () => {
    try {
      const res = await fetch(ALERT_API + "?t=" + Date.now());
      const json = await res.json();

      if (!json || !json.data) {
        setAlert(null);
        return;
      }

      const normalized = normalizeData(json.data);

      // only show if new detection
      if (lastIdRef.current !== Number(normalized.id)) {
        lastIdRef.current = Number(normalized.id);

        setAlert(normalized);

        // auto remove fire after timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setAlert(null);
        }, FIRE_TIMEOUT);
      }

    } catch (err) {
      console.log("Fetch error:", err);
      setAlert(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlert();
    const interval = setInterval(fetchAlert, FETCH_INTERVAL);
    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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

      {/* Detection Panel */}
      <div className="flex-1 rounded-lg border border-dashed border-[#2E2E2E] bg-muted/20 flex items-center justify-center">

        {loading && <span className="text-sm">Loading…</span>}

        {!loading && !alert && (
          <p className="text-base font-semibold text-green-500">
            No Fire Detected
          </p>
        )}

        {!loading && alert && (
          <div className="text-center space-y-2">

            <p className="text-base font-semibold text-red-500">🔥 Fire Detected</p>

            <p className="text-xs text-white">
              Confidence: {(Number(alert.confidence) * 100).toFixed(1)}%
            </p>

            <p className="text-xs text-white">
              Fire Count: {alert.fire_count}
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