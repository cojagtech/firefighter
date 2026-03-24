"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Chip } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SafeIcon from "@/components/common/SafeIcon";

// ---------------- helpers ----------------
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

// Leaflet fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const droneIcon = new L.Icon({
  iconUrl: "/assets/images/drone.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/pilot`;

export default function DroneLivePanel({
  incident,
  onMaximize,
  isMaximized = false,
  onExit,
}) {
  const { droneId: droneCode } = useParams();

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const droneMarkerRef = useRef(null);

  const [mapMode, setMapMode] = useState("2d");
  const [dronePosition, setDronePosition] = useState({
    lat: 21.1458,
    lng: 79.0882,
  });

  const cesiumInitRef = useRef(false);

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // ---------------- theme ----------------
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

  // ---------------- drone polling ----------------
  useEffect(() => {
    if (!droneCode) return;

    const fetchDroneLocation = async () => {
      try {
        const res = await fetch(
          `${API}/get_drone_location.php?drone_code=${droneCode}`,
          { credentials: "include" }
        );

        if (!res.ok) return;

        const data = await res.json();
        if (!data?.success) return;

        const lat = parseFloat(data.data.latitude);
        const lng = parseFloat(data.data.longitude);

        if (isNaN(lat) || isNaN(lng)) return;

        setDronePosition({ lat, lng });

        if (droneMarkerRef.current && leafletMapRef.current) {
          droneMarkerRef.current.setLatLng([lat, lng]);
          leafletMapRef.current.setView([lat, lng]);
        }

        if (mapMode === "3d" && window.Cesium && window.viewer) {
          const Cesium = window.Cesium;
          const pos = Cesium.Cartesian3.fromDegrees(lng, lat, 800);

          const entity =
            window.viewer.entities.getById("live_drone");

          if (entity) entity.position = pos;
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchDroneLocation();
    const interval = setInterval(fetchDroneLocation, 5000);

    return () => clearInterval(interval);
  }, [droneCode, mapMode]);

  // ---------------- 2D MAP ----------------
  useEffect(() => {
    if (mapMode !== "2d") return;
    if (leafletMapRef.current) return;

    leafletMapRef.current = L.map(mapContainerRef.current).setView(
      [dronePosition.lat, dronePosition.lng],
      16
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(leafletMapRef.current);

    droneMarkerRef.current = L.marker(
      [dronePosition.lat, dronePosition.lng],
      { icon: droneIcon }
    ).addTo(leafletMapRef.current);

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      droneMarkerRef.current = null;
    };
  }, [mapMode]);

  // ---------------- 3D MAP (FINAL STABLE FIX) ----------------
  useEffect(() => {
    if (mapMode !== "3d") return;

    let viewerReady = false;

    async function initCesium() {
      try {
        if (!cesiumInitRef.current) {
          loadCss(
            "https://cesium.com/downloads/cesiumjs/releases/1.96/Build/Cesium/Widgets/widgets.css"
          );

          await loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/cesium/1.96.0/Cesium.js"
          );

          await loadScript("/assets/js/globel.js");
          await loadScript("/assets/js/map.js");

          cesiumInitRef.current = true;
        }

        if (window.initMap) {
          window.initMap();
        }

        // 🔥 ONLY RELIABLE CONDITION: wait for viewer
        const wait = setInterval(() => {
          if (!window.viewer || !window.Cesium) return;

          clearInterval(wait);
          viewerReady = true;

          const Cesium = window.Cesium;
          const viewer = window.viewer;

          const pos = Cesium.Cartesian3.fromDegrees(
            dronePosition.lng,
            dronePosition.lat,
            100
          );

          let entity = viewer.entities.getById("live_drone");

          if (!entity) {
            entity = viewer.entities.add({
              id: "live_drone",
              position: pos,
              model: {
                uri: "/assets/model/drone.glb",
                scale: 0.5,
                minimumPixelSize: 64,
              },
            });
          } else {
            entity.position = pos;
          }

          setTimeout(() => {
            viewer.resize?.();
            viewer.scene?.requestRender();
            viewer.zoomTo(entity);
          }, 300);
        }, 100);
      } catch (err) {
        console.error("Cesium init error:", err);
      }
    }

    initCesium();
  }, [mapMode]);

  // ---------------- incident ----------------
  useEffect(() => {
    if (!incident) return;

    if (mapMode === "3d" && window.addFireHazardPoint) {
      window.addFireHazardPoint(
        parseFloat(incident.latitude),
        parseFloat(incident.longitude),
        200
      );
    }
  }, [incident, mapMode]);

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h3
          className="font-semibold text-lg"
          style={{ color: isDark ? "#fff" : "#111827" }}
        >
          Drone Live View
        </h3>

        <div className="flex items-center gap-3">
          <Chip label="LIVE" size="small" color="error" />

          {/* 🔥 YOUR ORIGINAL TOGGLE (UNCHANGED) */}
          <div
            className="relative flex items-center rounded-full p-1 w-[110px] h-8"
            style={{
              backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "#f1f5f9",
              border: `1px solid ${
                isDark ? "#2E2E2E" : "#e2e8f0"
              }`,
            }}
          >
            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-red-600 transition-all duration-300 ${
                mapMode === "3d" ? "left-[50%]" : "left-1"
              }`}
            />

            <button
              onClick={() => setMapMode("2d")}
              className="relative z-10 w-1/2 text-xs font-semibold"
              style={{
                color:
                  mapMode === "2d"
                    ? "#fff"
                    : isDark
                    ? "#9ca3af"
                    : "#6b7280",
              }}
            >
              2D
            </button>

            <button
              onClick={() => setMapMode("3d")}
              className="relative z-10 w-1/2 text-xs font-semibold"
              style={{
                color:
                  mapMode === "3d"
                    ? "#fff"
                    : isDark
                    ? "#9ca3af"
                    : "#6b7280",
              }}
            >
              3D
            </button>
          </div>
        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="flex-1 min-h-0 rounded-lg overflow-hidden relative border">
        <div
          ref={mapContainerRef}
          className="w-full h-full min-h-0"
          style={{ position: "relative" }}
        />
      </div>
    </div>
  );
}