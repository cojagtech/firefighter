"use client";

import React, { useEffect, useRef, useState } from "react";
import SafeIcon from "@/components/common/SafeIcon";
import { useParams } from "react-router-dom";
import { Chip } from "@mui/material";
import useUserInfo from "@/components/common/auth/useUserInfo";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/fire-fighter/live-incident-command`;

// Configure default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function VTSLivePanel({
  incident,
  onMaximize,
  isMaximized = false,
  onExit,
}) {
  const iframeRef = useRef(null);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const [mapMode, setMapMode] = useState("2d");
  const [stationCoords, setStationCoords] = useState(null);
  const [incidentMarker, setIncidentMarker] = useState(null);
  const [stationMarker, setStationMarker] = useState(null);

  const { incidentId, vehicleDeviceId } = useParams();
  const { station } = useUserInfo();

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  /** Watch theme changes */
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  /** Fetch fire station coordinates */
  useEffect(() => {
    if (!station) return;

    const fetchStation = async () => {
      try {
        const res = await fetch(
          `${API}/get_station_by_name.php?name=${encodeURIComponent(station)}`
        );
        const data = await res.json();
        if (data.success && data.station?.latitude && data.station?.longitude) {
          setStationCoords({
            lat: parseFloat(data.station.latitude),
            lng: parseFloat(data.station.longitude),
          });
        } else {
          console.warn("Station coordinates not found");
        }
      } catch (err) {
        console.error("Error fetching station:", err);
      }
    };

    fetchStation();
  }, [station]);

  /** Initialize / reset Leaflet map whenever mapMode changes to 2D */
  useEffect(() => {
    if (mapMode !== "2d") return;

    // Remove previous map and markers
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
      setIncidentMarker(null);
      setStationMarker(null);
    }

    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
      setIncidentMarker(null);
      setStationMarker(null);
    };
  }, [mapMode]);

  /** Update markers on Leaflet map */
  useEffect(() => {
    if (mapMode !== "2d" || !leafletMapRef.current) return;

    // Incident Marker
    if (incident?.latitude && incident?.longitude) {
      const lat = parseFloat(incident.latitude || incident.lat);
      const lng = parseFloat(incident.longitude || incident.lng);

      if (incidentMarker) {
        incidentMarker.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng]).addTo(leafletMapRef.current).bindPopup("Incident");
        setIncidentMarker(marker);
      }

      leafletMapRef.current.setView([lat, lng], 14);
    }

    // Station Marker
    if (stationCoords) {
      const { lat, lng } = stationCoords;

      if (stationMarker) {
        stationMarker.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], { icon: new L.Icon.Default() })
          .addTo(leafletMapRef.current)
          .bindPopup(station);
        setStationMarker(marker);
      }
    }
  }, [incident, stationCoords, mapMode, leafletMapRef.current]);

  /** Update 3D iframe with incident & station */
  useEffect(() => {
    if (mapMode !== "3d" || !iframeRef.current) return;

    const interval = setInterval(() => {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow) return;

      if (incident?.latitude && incident?.longitude && iframeWindow.setIncidentLocation) {
        const lat = parseFloat(incident.latitude || incident.lat);
        const lng = parseFloat(incident.longitude || incident.lng);
        iframeWindow.setIncidentLocation(lat, lng, vehicleDeviceId);
      }

      if (stationCoords && iframeWindow.setStationLocation) {
        iframeWindow.setStationLocation(stationCoords.lat, stationCoords.lng);
      }

      clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, [mapMode, incident, stationCoords, vehicleDeviceId]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg" style={{ color: isDark ? "#fff" : "#111827" }}>
          VTS Map
        </h3>

        <div className="flex items-center gap-3">
          <Chip label="LIVE" size="small" color="error" />
          {/* Map Mode Toggle */}
          <div
            className="relative flex items-center rounded-full p-1 w-[110px] h-8"
            style={{
              backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "#f1f5f9",
              border: `1px solid ${isDark ? "#2E2E2E" : "#e2e8f0"}`,
            }}
          >
            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-red-600 transition-all duration-300 ${
                mapMode === "3d" ? "left-[50%]" : "left-1"
              }`}
            />
            <button
              onClick={() => setMapMode("2d")}
              className="relative z-10 w-1/2 text-xs"
              style={{ color: mapMode === "2d" ? "#fff" : isDark ? "#9ca3af" : "#6b7280" }}
            >
              2D
            </button>
            <button
              onClick={() => setMapMode("3d")}
              className="relative z-10 w-1/2 text-xs"
              style={{ color: mapMode === "3d" ? "#fff" : isDark ? "#9ca3af" : "#6b7280" }}
            >
              3D
            </button>
          </div>

          {/* Maximize / Exit */}
          {!isMaximized ? (
            <button onClick={onMaximize} className="p-1 hover:bg-muted rounded" style={{ color: isDark ? "#fff" : "#111827" }}>
              <SafeIcon name="Maximize2" className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={onExit} className="p-1 hover:bg-muted rounded" style={{ color: isDark ? "#fff" : "#111827" }}>
              <SafeIcon name="X" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div
        className="flex-1 rounded-lg overflow-hidden"
        style={{ border: `1px dashed ${isDark ? "#2E2E2E" : "#cbd5e1"}` }}
      >
        {mapMode === "3d" ? (
          <iframe
            ref={iframeRef}
            src="/cesium-map.html"
            className="w-full h-full border-none"
            title="3D Map"
          />
        ) : (
          <div ref={mapContainerRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
}