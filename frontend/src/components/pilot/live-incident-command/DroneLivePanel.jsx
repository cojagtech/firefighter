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

  const cesiumInitRef = useRef(false);

  const [mapMode, setMapMode] = useState("2d");
  const [dronePosition, setDronePosition] = useState({
    lat: 21.1458,
    lng: 79.0882,
  });

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

  // ----------------------------
  // DRONE LOCATION POLLING
  // ----------------------------
  useEffect(() => {
    if (!droneCode) return;

    async function fetchDroneLocation() {
      try {
        const res = await fetch(
          `${API}/get_drone_location.php?drone_code=${droneCode}`,
          { credentials: "include" }
        );

        const data = await res.json();
        if (!data?.success) return;

        const lat = parseFloat(data.data.latitude);
        const lng = parseFloat(data.data.longitude);

        if (isNaN(lat) || isNaN(lng)) return;

        setDronePosition({ lat, lng });

        // update Leaflet marker
        if (droneMarkerRef.current && leafletMapRef.current) {
          droneMarkerRef.current.setLatLng([lat, lng]);
          leafletMapRef.current.setView([lat, lng]);
        }

        // update Cesium
        if (window.viewer && window.Cesium && mapMode === "3d") {
          const Cesium = window.Cesium;
          const pos = Cesium.Cartesian3.fromDegrees(lng, lat, 800);

          let entity = window.viewer.entities.getById("live_drone");
          if (entity) entity.position = pos;
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchDroneLocation();
    const interval = setInterval(fetchDroneLocation, 5000);
    return () => clearInterval(interval);
  }, [droneCode, mapMode]);

  // ----------------------------
  // LEAFLET INIT (2D)
  // ----------------------------
  useEffect(() => {
    if (mapMode !== "2d") return;
    if (!mapContainerRef.current || leafletMapRef.current) return;

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
  }, [mapMode]);

  // ----------------------------
  // CESIUM INIT (3D - ONCE ONLY)
  // ----------------------------
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
          window.viewer || window.VIEWER || window.cesiumViewer;

        if (!viewer || !Cesium) return;

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

        viewer.zoomTo(entity);
      } catch (err) {
        console.error(err);
      }
    }

    initCesium();
  }, [mapMode]);

  // ----------------------------
  // INCIDENT MARKER (3D)
  // ----------------------------
  useEffect(() => {
    if (!incident || mapMode !== "3d") return;

    if (window.addFireHazardPoint) {
      window.addFireHazardPoint(
        parseFloat(incident.latitude),
        parseFloat(incident.longitude),
        200
      );
    }
  }, [incident, mapMode]);

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3
          className="font-semibold text-lg"
          style={{ color: isDark ? "#fff" : "#111827" }}
        >
          Drone Live View
        </h3>

        <div className="flex items-center gap-3">
          <Chip label="LIVE" color="error" size="small" />

          {/* Toggle */}
          <div className="relative flex items-center w-[110px] h-8 rounded-full p-1 bg-gray-200 dark:bg-black">
            <div
              className={`absolute top-1 bottom-1 w-1/2 bg-red-600 rounded-full transition-all ${
                mapMode === "3d" ? "left-1/2" : "left-1"
              }`}
            />

            <button
              onClick={() => setMapMode("2d")}
              className="w-1/2 text-xs z-10"
            >
              2D
            </button>

            <button
              onClick={() => setMapMode("3d")}
              className="w-1/2 text-xs z-10"
            >
              3D
            </button>
          </div>
        </div>
      </div>

      {/* MAP WRAPPER (FIXED STABLE AREA) */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-dashed">
        <div className="relative w-full h-full">
          {/* 2D */}
          <div
            ref={mapContainerRef}
            className={`absolute inset-0 ${
              mapMode === "2d"
                ? "opacity-100 z-10"
                : "opacity-0 pointer-events-none"
            }`}
          />

          {/* 3D */}
          <div
            id="cesium-container"
            className={`absolute inset-0 ${
              mapMode === "3d"
                ? "opacity-100 z-10"
                : "opacity-0 pointer-events-none"
            }`}
          />
        </div>
      </div>
    </div>
  );
}