"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Chip } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SafeIcon from "@/components/common/SafeIcon";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = resolve; s.onerror = reject;
    document.body.appendChild(s);
  });
}

function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet"; link.href = href;
  document.head.appendChild(link);
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const droneIcon = new L.Icon({
  iconUrl: "/assets/images/drone.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/pilot`;

const DRONE_CODE_TO_DB_ID = {
  "DRN-002": 101,
  "DRN-001": 102,
};


export default function DroneLivePanel({
  incident,
  onMaximize,
  isMaximized = false,
  onExit,
}) {
  const { droneId: droneCode } = useParams();
  const dbDroneId = DRONE_CODE_TO_DB_ID[droneCode];

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const droneMarkerRef = useRef(null);

  const [mapMode, setMapMode] = useState("2d");
  const [droneLocations, setDroneLocations] = useState([]);

  const cesiumInitRef = useRef(false);
  const hasZoomedRef = useRef(false);

  // Theme observer
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // ✅ All backend logic unchanged
  useEffect(() => {
    if (!incident) return;
  }, [incident]);

  useEffect(() => {
    if (mapMode !== "2d") return;
    if (leafletMapRef.current) return;

    leafletMapRef.current = L.map(mapContainerRef.current).setView(
      [20.5937, 78.9629], 5
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      leafletMapRef.current
    );

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      droneMarkerRef.current = null;
    };
  }, [mapMode]);

  useEffect(() => {
    if (mapMode !== "3d") return;

    async function initCesium() {
      try {
        if (!cesiumInitRef.current) {
          loadCss("https://cesium.com/downloads/cesiumjs/releases/1.96/Build/Cesium/Widgets/widgets.css");
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/cesium/1.96.0/Cesium.js");
          await loadScript("/assets/js/globel.js");
          await loadScript("/assets/js/map.js");
          cesiumInitRef.current = true;
        }
        if (window.initMap) window.initMap();
      } catch (err) {
        console.error("Cesium load error:", err);
      }
    }

    initCesium();
  }, [mapMode]);

  useEffect(() => {
    if (!dbDroneId) return;

    // const DRONE_API = `http://65.2.78.112/fire-fighter/get_drone_location.php?droneId=${dbDroneId}`;

    const DRONE_API = `${API}/get_drone_location.php?droneId=${dbDroneId}`;

    async function getDrone() {
      try {
        const res = await fetch(DRONE_API);
        const data = await res.json();

        if (!data?.latitude || !data?.longitude) return;

        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);

        if (isNaN(lat) || isNaN(lng)) return;

        setDroneLocations([data]);

        if (mapMode === "2d" && leafletMapRef.current) {
          const latLng = [lat, lng];
          if (!droneMarkerRef.current) {
            droneMarkerRef.current = L.marker(latLng, { icon: droneIcon })
              .addTo(leafletMapRef.current);
            leafletMapRef.current.setView(latLng, 16);
          } else {
            droneMarkerRef.current.setLatLng(latLng);
          }
        }

        if (mapMode === "3d") {
          const Cesium = window.Cesium;
          const viewer = window.viewer || window.VIEWER || window.cesiumViewer || window.V || window.v;
          if (!Cesium || !viewer) return;

          const carto = Cesium.Cartographic.fromDegrees(lng, lat);
          const updated = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [carto]);
          const groundHeight = updated[0].height || 0;
          const finalHeight = groundHeight + 100;
          const pos = Cesium.Cartesian3.fromDegrees(lng, lat, finalHeight);

          let entity = viewer.entities.getById("live_drone");
          if (!entity) {
            viewer.entities.add({
              id: "live_drone",
              position: pos,
              model: { uri: "/assets/model/drone.glb", scale: 0.5, minimumPixelSize: 64 },
            });
          } else {
            entity.position = pos;
          }

          if (!hasZoomedRef.current) {
            hasZoomedRef.current = true;
            setTimeout(() => {
              viewer.zoomTo(viewer.entities, new Cesium.HeadingPitchRange(0, -0.8, 1000));
            }, 1200);
          }
        }
      } catch (err) {
        console.error("Drone fetch error:", err);
      }
    }

    getDrone();
    const interval = setInterval(getDrone, 5000);
    return () => clearInterval(interval);
  }, [droneCode, mapMode]);

  useEffect(() => {
    if (!incident) return;
    const { latitude, longitude } = incident;

    if (mapMode === "3d") {
      const interval = setInterval(() => {
        if (window.addFireHazardPoint) {
          window.addFireHazardPoint(parseFloat(latitude), parseFloat(longitude), 200);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [incident, mapMode]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3
          className="font-semibold text-lg"
          style={{ color: isDark ? "#ffffff" : "#111827" }}
        >
          Drone Live View
        </h3>

        <div className="flex items-center gap-3">
          <Chip
            label="LIVE"
            size="small"
            color="error"
            className="animate-pulse"
          />

          {/* Map Mode Toggle */}
          <div
            className="relative flex items-center rounded-full p-1 w-[110px] h-8"
            style={{
              backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "#f1f5f9",
              border: `1px solid ${isDark ? "#2E2E2E" : "#e2e8f0"}`,
            }}
          >
            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-red-600 transition-all duration-300 ${mapMode === "3d" ? "left-[50%]" : "left-1"
                }`}
            />
            <button
              onClick={() => setMapMode("2d")}
              className="relative z-10 w-1/2 text-xs font-semibold"
              style={{
                color: mapMode === "2d"
                  ? "#ffffff"
                  : isDark ? "#9ca3af" : "#6b7280",
              }}
            >
              2D
            </button>
            <button
              onClick={() => setMapMode("3d")}
              className="relative z-10 w-1/2 text-xs font-semibold"
              style={{
                color: mapMode === "3d"
                  ? "#ffffff"
                  : isDark ? "#9ca3af" : "#6b7280",
              }}
            >
              3D
            </button>
          </div>

          {!isMaximized && (
            <button
              onClick={onMaximize}
              className="p-1 hover:bg-muted rounded"
              style={{ color: isDark ? "#ffffff" : "#111827" }}
            >
              <SafeIcon name="Maximize2" className="h-4 w-4" />
            </button>
          )}

          {isMaximized && (
            <button
              onClick={onExit}
              className="p-1 hover:bg-muted rounded"
              style={{ color: isDark ? "#ffffff" : "#111827" }}
            >
              <SafeIcon name="X" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div
        className="flex-1 rounded-lg overflow-hidden"
        style={{
          border: `1px dashed ${isDark ? "#2E2E2E" : "#cbd5e1"}`,
        }}
      >
        <div
          id="map-container"
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ display: mapMode === "3d" ? "block" : "block" }}
        />
      </div>
    </div>
  );
}