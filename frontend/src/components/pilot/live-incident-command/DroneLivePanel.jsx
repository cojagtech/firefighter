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

  const [dronePosition, setDronePosition] = useState({
    lat: 21.1458,
    lng: 79.0882,
  });

  const cesiumInitRef = useRef(false);

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

  // =========================
  // 🚁 Fetch Drone Location
  // =========================
  useEffect(() => {
    if (!droneCode) return;

    async function fetchDroneLocation() {
      try {
        const res = await fetch(
          `${API}/get_drone_location.php?drone_code=${droneCode}`,
          { credentials: "include" }
        );

        const data = await res.json();
        if (!data || data.success === false) return;

        const lat = parseFloat(data.data.latitude);
        const lng = parseFloat(data.data.longitude);

        if (isNaN(lat) || isNaN(lng)) return;

        setDronePosition({ lat, lng });

        // 🗺 Update 2D map
        if (leafletMapRef.current && droneMarkerRef.current) {
          droneMarkerRef.current.setLatLng([lat, lng]);
          leafletMapRef.current.setView([lat, lng]);
        }

        // 🌍 Update 3D map
        if (mapMode === "3d" && window.Cesium && window.viewer) {
          const Cesium = window.Cesium;

          const pos = Cesium.Cartesian3.fromDegrees(lng, lat, 800);
          let entity = window.viewer.entities.getById("live_drone");

          if (entity) {
            entity.position = pos;

            window.viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(lng, lat, 1200),
              orientation: {
                heading: 0,
                pitch: -0.7,
                roll: 0,
              },
              duration: 1.5,
            });
          }
        }
      } catch (err) {
        console.error("Drone location fetch error:", err);
      }
    }

    fetchDroneLocation();
    const interval = setInterval(fetchDroneLocation, 5000);
    return () => clearInterval(interval);
  }, [droneCode, mapMode]);

  // =========================
  // 🗺 Leaflet Init
  // =========================
  useEffect(() => {
    if (mapMode !== "2d") return;
    if (leafletMapRef.current) return;

    leafletMapRef.current = L.map(mapContainerRef.current).setView(
      [dronePosition.lat, dronePosition.lng],
      16
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      leafletMapRef.current
    );

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

  // =========================
  // 🌍 Cesium Init
  // =========================
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

        if (window.initMap) window.initMap();

        const Cesium = window.Cesium;
        const viewer =
          window.viewer ||
          window.VIEWER ||
          window.cesiumViewer ||
          window.V;

        if (!Cesium || !viewer) return;

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

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            dronePosition.lng,
            dronePosition.lat,
            1200
          ),
          duration: 1.5,
        });
      } catch (err) {
        console.error("Cesium load error:", err);
      }
    }

    initCesium();
  }, [mapMode, dronePosition]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3
          className="font-semibold text-lg"
          style={{ color: isDark ? "#fff" : "#111827" }}
        >
          Drone Live View
        </h3>

        <div className="flex items-center gap-3">
          <Chip label="LIVE" size="small" color="error" className="animate-pulse" />

          {/* Toggle */}
          <div className="flex gap-1 bg-gray-200 rounded-full p-1">
            <button
              onClick={() => setMapMode("2d")}
              className={`px-3 py-1 rounded-full ${
                mapMode === "2d" ? "bg-red-500 text-white" : ""
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setMapMode("3d")}
              className={`px-3 py-1 rounded-full ${
                mapMode === "3d" ? "bg-black text-white" : ""
              }`}
            >
              3D
            </button>
          </div>

          {!isMaximized && (
            <button onClick={onMaximize}>
              <SafeIcon name="Maximize2" />
            </button>
          )}

          {isMaximized && (
            <button onClick={onExit}>
              <SafeIcon name="X" />
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 rounded-lg overflow-hidden border">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}