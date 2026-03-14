"use client";

import React, { useEffect, useRef, useState } from "react";
import SafeIcon from "@/components/common/SafeIcon";
import { Chip } from "@mui/material";

const ALERT_API = "http://localhost/fire-fighter/backend/public/fire-fighter/live-incident-command/get_latest_detection.php";
const FETCH_INTERVAL = 1 * 1000; 

export default function DetectionAlert({
  onMaximize,
  isMaximized = false,
  onExit,
}) {
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  const lastSignatureRef = useRef(null);
  const sameCountRef = useRef(0);

  const fetchAlert = () => {
    fetch(ALERT_API)
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== "success") return;

        const data = res.data;

        const signature = `${data.timestamp}_${data.confidence}_${data.intensity_score}_${data.intensity_level}`;

        if (lastSignatureRef.current === signature) {
          sameCountRef.current += 1;

          if (sameCountRef.current >= 3) {
            setAlert(null);
            return;
          }
        } else {
          lastSignatureRef.current = signature;
          sameCountRef.current = 1;
        }

        setAlert(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlert(); 
    const interval = setInterval(fetchAlert, FETCH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col h-full ${isMaximized ? "p-6" : "p-4"}`}>
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

      <div className="flex-1 rounded-lg border border-dashed border-[#2E2E2E] bg-muted/20 flex items-center justify-center mb-4">
        {loading && <span className="text-sm">Loading…</span>}

        {!loading && !alert && (
          <p className="text-base font-semibold text-green-500">
            No Fire Detected
          </p>
        )}

        {!loading && alert && (
          <div className="text-center space-y-2">
            <p className="text-base font-semibold text-red-500">
              Fire Detected
            </p>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-white">Confidence:</span>{" "}
                {(Number(alert.confidence) * 100).toFixed(1)}%
              </p>
              <p>
                <span className="font-medium text-white">Intensity Score:</span>{" "}
                {alert.intensity_score}
              </p>
              <p>
                <span className="font-medium text-white">Intensity Level:</span>{" "}
                {alert.intensity_level}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
