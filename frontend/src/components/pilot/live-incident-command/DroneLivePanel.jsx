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

export default function DroneLivePanel({
  incident, onMaximize, isMaximized = false, onExit,
}) {
  const { droneId: droneCode } = useParams();

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const droneMarkerRef = useRef(null);

  const hasFocusedRef = useRef(false);
  const isUserInteractingRef = useRef(false);

  const [mapMode, setMapMode] = useState("2d");
  const [dronePosition, setDronePosition] = useState({ lat: 21.1458, lng: 79.0882 });

  const cesiumInitRef = useRef(false);
  const hasZoomedRef = useRef(false);

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

  // 🔥 FETCH + AUTO FOLLOW
  useEffect(() => {
    if (!droneCode) return;

    async function fetchDroneLocation() {
      try {
        const res = await fetch(`${API}/get_drone_location.php?drone_code=${droneCode}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        if (!data || data.success === false) return;

        const lat = parseFloat(data.data.latitude);
        const lng = parseFloat(data.data.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        setDronePosition({ lat, lng });

        // ✅ 2D FOLLOW
        if (droneMarkerRef.current && leafletMapRef.current) {
          const map = leafletMapRef.current;

          droneMarkerRef.current.setLatLng([lat, lng]);

          if (!isUserInteractingRef.current) {
            if (!hasFocusedRef.current) {
              hasFocusedRef.current = true;

              map.setView([lat, lng], 17, {
                animate: true,
                duration: 1.5,
              });
            } else {
              map.panTo([lat, lng], {
                animate: true,
                duration: 1.2,
              });
            }
          }
        }

        // ✅ 3D FOLLOW
        if (mapMode === "3d" && window.Cesium && window.viewer) {
          const Cesium = window.Cesium;
          const pos = Cesium.Cartesian3.fromDegrees(lng, lat, 800);
          let entity = window.viewer.entities.getById("live_drone");

          if (entity) {
            entity.position = pos;
          }
        }

      } catch (err) {
        console.error(err);
      }
    }

    fetchDroneLocation();
    const interval = setInterval(fetchDroneLocation, 5000);
    return () => clearInterval(interval);
  }, [droneCode, mapMode]);

  // ✅ Leaflet Init + User Interaction Detection
  useEffect(() => {
    if (mapMode !== "2d") return;
    if (leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [dronePosition.lat, dronePosition.lng], 16
    );

    leafletMapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    droneMarkerRef.current = L.marker(
      [dronePosition.lat, dronePosition.lng],
      { icon: droneIcon }
    ).addTo(map);

    // 👇 detect user interaction
    map.on("dragstart zoomstart", () => {
      isUserInteractingRef.current = true;
    });

    return () => {
      map.remove();
      leafletMapRef.current = null;
      droneMarkerRef.current = null;
    };
  }, [mapMode]);

  // ✅ 3D INIT
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

        const Cesium = window.Cesium;
        const viewer = window.viewer;
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

          // 🔥 AUTO FOLLOW IN 3D
          viewer.trackedEntity = entity;
        } else {
          entity.position = pos;
        }

      } catch (err) {
        console.error(err);
      }
    }

    initCesium();
  }, [mapMode, dronePosition]);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">
          Drone Live View
        </h3>

        <div className="flex items-center gap-3">
          <Chip label="LIVE" size="small" color="error" />

          <div className="flex">
            <button onClick={() => setMapMode("2d")}>2D</button>
            <button onClick={() => setMapMode("3d")}>3D</button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}