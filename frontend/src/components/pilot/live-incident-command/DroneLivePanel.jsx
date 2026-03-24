"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Chip } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SafeIcon from "@/components/common/SafeIcon";

// -------------------- Helpers --------------------
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
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

// -------------------- Leaflet Fix --------------------
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

// =========================================================

export default function DroneLivePanel({
  incident,
  onMaximize,
  isMaximized = false,
  onExit,
}) {
  const { droneId: droneCode } = useParams();

  const leafletRef = useRef(null);
  const markerRef = useRef(null);
  const cesiumInitRef = useRef(false);
  const hasZoomedRef = useRef(false);

  const map2DRef = useRef(null);
  const map3DRef = useRef(null);

  const [mapMode, setMapMode] = useState("2d");
  const [dronePosition, setDronePosition] = useState({
    lat: 21.1458,
    lng: 79.0882,
  });

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // -------------------- Theme Observer --------------------
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

  // -------------------- Fetch Drone --------------------
  useEffect(() => {
    if (!droneCode) return;

    async function fetchDrone() {
      try {
        const res = await fetch(
          `${API}/get_drone_location.php?drone_code=${droneCode}`,
          { credentials: "include" }
        );

        const data = await res.json();
        if (!data?.data) return;

        const lat = parseFloat(data.data.latitude);
        const lng = parseFloat(data.data.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        setDronePosition({ lat, lng });

        // 2D update
        if (mapMode === "2d" && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }

        // 3D update
        if (mapMode === "3d" && window.Cesium && window.viewer) {
          const Cesium = window.Cesium;
          const viewer = window.viewer;

          const carto = Cesium.Cartographic.fromDegrees(lng, lat);
          const updated = await Cesium.sampleTerrainMostDetailed(
            viewer.terrainProvider,
            [carto]
          );

          const height = (updated[0]?.height || 0) + 100;
          const pos = Cesium.Cartesian3.fromDegrees(lng, lat, height);

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
        }
      } catch (e) {
        console.error("Drone fetch error:", e);
      }
    }

    fetchDrone();
    const i = setInterval(fetchDrone, 5000);
    return () => clearInterval(i);
  }, [droneCode, mapMode]);

  // -------------------- 2D Init --------------------
  useEffect(() => {
    if (mapMode !== "2d") return;

    if (!leafletRef.current && map2DRef.current) {
      leafletRef.current = L.map(map2DRef.current).setView(
        [dronePosition.lat, dronePosition.lng],
        16
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        leafletRef.current
      );

      markerRef.current = L.marker(
        [dronePosition.lat, dronePosition.lng],
        { icon: droneIcon }
      ).addTo(leafletRef.current);
    }

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapMode]);

  // -------------------- 3D Init --------------------
  useEffect(() => {
    if (mapMode !== "3d") return;

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

        if (!window.viewer && window.initMap) {
          window.initMap("cesiumContainer"); // IMPORTANT
        }

        const viewer = window.viewer;
        if (!viewer) return;

        if (!hasZoomedRef.current) {
          hasZoomedRef.current = true;
          setTimeout(() => {
            viewer.zoomTo(viewer.entities);
          }, 1000);
        }
      } catch (err) {
        console.error("Cesium error:", err);
      }
    }

    initCesium();
  }, [mapMode]);

  // -------------------- Incident --------------------
  useEffect(() => {
    if (!incident || mapMode !== "3d") return;

    const { latitude, longitude } = incident;

    const i = setInterval(() => {
      if (window.addFireHazardPoint) {
        window.addFireHazardPoint(
          parseFloat(latitude),
          parseFloat(longitude),
          200
        );
        clearInterval(i);
      }
    }, 500);

    return () => clearInterval(i);
  }, [incident, mapMode]);

  // =========================================================

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3
          className="font-semibold text-lg"
          style={{ color: isDark ? "#fff" : "#111" }}
        >
          Drone Live View
        </h3>

        <div className="flex items-center gap-3">
          <Chip label="LIVE" size="small" color="error" />

          {/* Toggle */}
          <div className="flex rounded-full bg-gray-200 dark:bg-black p-1 w-[110px]">
            <button
              onClick={() => setMapMode("2d")}
              className={`w-1/2 text-xs ${
                mapMode === "2d" ? "text-white bg-red-600 rounded-full" : ""
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setMapMode("3d")}
              className={`w-1/2 text-xs ${
                mapMode === "3d" ? "text-white bg-red-600 rounded-full" : ""
              }`}
            >
              3D
            </button>
          </div>

          {!isMaximized ? (
            <button onClick={onMaximize}>
              <SafeIcon name="Maximize2" className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={onExit}>
              <SafeIcon name="X" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative rounded-lg overflow-hidden border">
        {/* 2D */}
        {mapMode === "2d" && (
          <div ref={map2DRef} className="w-full h-full" />
        )}

        {/* 3D */}
        {mapMode === "3d" && (
          <div
            id="cesiumContainer"
            ref={map3DRef}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}