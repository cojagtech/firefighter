"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Chip } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SafeIcon from "@/components/common/SafeIcon";

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
  const [droneLocations, setDroneLocations] = useState([]);

  const cesiumInitRef = useRef(false);
  const hasZoomedRef = useRef(false);

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // ---------------- THEME ----------------
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

  // ---------------- 2D MAP ----------------
  useEffect(() => {
    if (mapMode !== "2d") return;

    // Clear container before initializing
    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = "";
      mapContainerRef.current.style.height = "100%";
    }

    if (leafletMapRef.current) return;

    leafletMapRef.current = L.map(mapContainerRef.current).setView(
      [20.5937, 78.9629],
      5
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      leafletMapRef.current
    );

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      droneMarkerRef.current = null;
      if (mapContainerRef.current) mapContainerRef.current.innerHTML = "";
    };
  }, [mapMode]);

  // ---------------- 3D MAP ----------------
  useEffect(() => {
    if (mapMode !== "3d") return;

    let waitViewer;

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

        // Clear container before Cesium init
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = "";
          mapContainerRef.current.style.height = "100%";
        }

        if (window.initMap) window.initMap();

        // Safe wait for viewer
        waitViewer = setInterval(() => {
          if (!window.Cesium || !window.viewer) return;
          clearInterval(waitViewer);
          console.log("Cesium Ready ✔");
        }, 100);
      } catch (err) {
        console.error("Cesium load error:", err);
      }
    }

    initCesium();

    return () => {
      if (waitViewer) clearInterval(waitViewer);

      if (window.viewer) {
        window.viewer.destroy();
        window.viewer = null;
      }

      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = "";
      }

      hasZoomedRef.current = false;
    };
  }, [mapMode]);

  // ---------------- DRONE FETCH + UPDATE ----------------
  useEffect(() => {
    if (!droneCode) return;

    const DRONE_API = `${API}/get_drone_location.php?drone_code=${droneCode}`;

    const getDrone = async () => {
      try {
        const res = await fetch(DRONE_API);
        const result = await res.json();

        if (!result?.data) return;

        const lat = parseFloat(result.data.latitude);
        const lng = parseFloat(result.data.longitude);

        if (isNaN(lat) || isNaN(lng)) return;

        setDroneLocations([result.data]);

        // =========================
        // 2D UPDATE
        // =========================
        if (mapMode === "2d" && leafletMapRef.current) {
          const latLng = [lat, lng];

          if (!droneMarkerRef.current) {
            droneMarkerRef.current = L.marker(latLng, {
              icon: droneIcon,
            }).addTo(leafletMapRef.current);

            leafletMapRef.current.setView(latLng, 16);
          } else {
            droneMarkerRef.current.setLatLng(latLng);
          }
        }

        // =========================
        // 3D UPDATE
        // =========================
        if (mapMode === "3d") {
          const Cesium = window.Cesium;
          const viewer = window.viewer;

          if (!Cesium || !viewer) return;

          const carto = Cesium.Cartographic.fromDegrees(lng, lat);
          const updated = await Cesium.sampleTerrainMostDetailed(
            viewer.terrainProvider,
            [carto]
          );
          const ground = updated?.[0]?.height || 0;
          const pos = Cesium.Cartesian3.fromDegrees(lng, lat, ground + 500);

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

          if (!hasZoomedRef.current) {
            hasZoomedRef.current = true;

            setTimeout(() => {
              viewer.zoomTo(entity);
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Drone fetch error:", err);
      }
    };

    getDrone();
    const interval = setInterval(getDrone, 5000);

    return () => clearInterval(interval);
  }, [droneCode, mapMode]);

  // ---------------- INCIDENT ----------------
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
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-2">
        <h3
          className="font-semibold text-lg"
          style={{ color: isDark ? "#fff" : "#111827" }}
        >
          Drone Live View
        </h3>

        <div className="flex items-center gap-3">
          <Chip label="LIVE" size="small" color="error" />

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

      {/* MAP */}
      <div className="flex-1 rounded-lg overflow-hidden relative">
        <div
          id="map-container"
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}