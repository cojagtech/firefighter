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
  const [dronePosition, setDronePosition] = useState({ lat: 21.1458, lng: 79.0882 });

  const cesiumInitRef = useRef(false);
  const hasZoomedRef = useRef(false);

  // Fetch drone location safely
  useEffect(() => {
    if (!droneCode) {
      console.warn("Drone code missing; cannot fetch location yet.");
      return;
    }

    let isMounted = true;

    async function fetchDroneLocation() {
  try {
    const res = await fetch(`${API}/get_drone_location.php?drone_code=${droneCode}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch drone location");

    const data = await res.json();

    if (!data || data.success === false) {
      console.warn("Invalid drone location received:", data);
      return;
    }

    const lat = parseFloat(data.data.latitude);
    const lng = parseFloat(data.data.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn("Invalid LatLng received:", data);
      return;
    }

    setDronePosition({ lat, lng });

    if (droneMarkerRef.current && leafletMapRef.current) {
      droneMarkerRef.current.setLatLng([lat, lng]);
      leafletMapRef.current.setView([lat, lng], leafletMapRef.current.getZoom());
    }

    if (mapMode === "3d" && window.Cesium && window.viewer) {
      const Cesium = window.Cesium;
      const pos = Cesium.Cartesian3.fromDegrees(lng, lat, 800);
      let entity = window.viewer.entities.getById("live_drone");
      if (entity) entity.position = pos;
    }
  } catch (err) {
    console.error("Drone location fetch error:", err);
  }
}

    fetchDroneLocation();
    const interval = setInterval(fetchDroneLocation, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [droneCode, mapMode]);

  // Initialize Leaflet 2D map
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

    droneMarkerRef.current = L.marker([dronePosition.lat, dronePosition.lng], {
      icon: droneIcon,
    }).addTo(leafletMapRef.current);

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      droneMarkerRef.current = null;
    };
  }, [mapMode, dronePosition.lat, dronePosition.lng]);

  // Initialize Cesium 3D map
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
          window.V ||
          window.v;

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
            model: { uri: "/assets/model/drone.glb", scale: 0.5, minimumPixelSize: 64 },
          });
        } else {
          entity.position = pos;
        }

        if (!hasZoomedRef.current) {
          hasZoomedRef.current = true;
          viewer.zoomTo(entity);
        }
      } catch (err) {
        console.error("Cesium load error:", err);
      }
    }

    initCesium();
  }, [mapMode, dronePosition.lat, dronePosition.lng]);

  // Add fire hazard point
  useEffect(() => {
    if (!incident) return;
    const { latitude, longitude } = incident;
    if (mapMode === "3d" && window.addFireHazardPoint) {
      window.addFireHazardPoint(parseFloat(latitude), parseFloat(longitude), 200);
    }
  }, [incident, mapMode]);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg text-white">Drone Live View</h3>

        <div className="flex items-center gap-3">
          <Chip label="LIVE" size="small" color="error" className="animate-pulse" />

          <div className="relative flex items-center bg-black/70 border border-[#2E2E2E] rounded-full p-1 w-[110px] h-8">
            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-red-600 transition-all duration-300 ${
                mapMode === "3d" ? "left-[50%]" : "left-1"
              }`}
            />
            <button
              onClick={() => setMapMode("2d")}
              className={`relative z-10 w-1/2 text-xs font-semibold ${
                mapMode === "2d" ? "text-white" : "text-gray-400"
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setMapMode("3d")}
              className={`relative z-10 w-1/2 text-xs font-semibold ${
                mapMode === "3d" ? "text-white" : "text-gray-400"
              }`}
            >
              3D
            </button>
          </div>

          {!isMaximized && (
            <button onClick={onMaximize} className="p-1 hover:bg-muted rounded">
              <SafeIcon name="Maximize2" className="h-4 w-4" />
            </button>
          )}
          {isMaximized && (
            <button onClick={onExit} className="p-1 hover:bg-muted rounded">
              <SafeIcon name="X" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 border border-dashed border-[#2E2E2E] rounded-lg overflow-hidden">
        <div id="map-container" ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}