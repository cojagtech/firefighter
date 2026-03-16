import { useEffect, useRef, useState, useCallback, memo } from "react";
import L from "leaflet";
import { PlayCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/common/StatusBadge";
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

function preloadCesium() {
  if (window.__CESIUM_PRELOADED__) return;
  window.__CESIUM_PRELOADED__ = true;

  loadCss(
    "https://cesium.com/downloads/cesiumjs/releases/1.96/Build/Cesium/Widgets/widgets.css"
  );
  loadCss("/assets/css/style.css");

  loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/cesium/1.96.0/Cesium.js"
  );
  loadScript("/assets/js/globel.js");
  loadScript("/assets/js/map.js");
}


function DashboardMapSection({
  droneLocations = [],
  mapMode,
  setMapMode,
  activeDrones = [],
}) {
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const retryRef = useRef(0);
  const cesiumInitRef = useRef(false);
  const hasAutoZoomedRef = useRef(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => preloadCesium());
    } else {
      setTimeout(preloadCesium, 2000);
    }
  }, []);


  const init2DMap = useCallback(() => {
    const div = document.getElementById("liveMap");
    if (!div) return;

    if (div.offsetHeight === 0) {
      retryRef.current++;
      if (retryRef.current < 20) {
        setTimeout(init2DMap, 150);
      }
      return;
    }

    retryRef.current = 0;

    if (!mapRef.current) {
      mapRef.current = L.map("liveMap").setView(
        [18.527693, 73.853166],
        14
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);

      markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    markerLayerRef.current.clearLayers();

    (Array.isArray(droneLocations) ? droneLocations : []).forEach((d) => {
      if (!d.latitude || !d.longitude) return;

      L.marker([d.latitude, d.longitude])
        .bindPopup(`<b>${d.drone_name}</b><br>${d.drone_code}`)
        .addTo(markerLayerRef.current);
    });

    setTimeout(() => mapRef.current.invalidateSize(), 80);
    setTimeout(() => mapRef.current.invalidateSize(), 200);
  }, [droneLocations]);

  useEffect(() => {
    if (mapMode !== "2d") return;

    setTimeout(init2DMap, 50);

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) init2DMap();
      },
      { threshold: 0.1 }
    );

    const div = document.getElementById("liveMap");
    if (div) obs.observe(div);

    return () => obs.disconnect();
  }, [mapMode, init2DMap]);


  useEffect(() => {
    if (mapMode !== "3d") return;

    async function initCesium() {
      try {
        if (!cesiumInitRef.current) {
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
      } catch (err) {
        console.error("Error loading Cesium scripts:", err);
      }
    }

    initCesium();
  }, [mapMode]);

  useEffect(() => {
    if (mapMode !== "3d") return;

    const locs = Array.isArray(droneLocations) ? droneLocations : [];
    if (locs.length === 0) return;

    let cancelled = false;

    async function placeAllDrones() {
      const Cesium = window.Cesium;

      const viewer =
        window.viewer ||
        window.VIEWER ||
        window.cesiumViewer ||
        window.V ||
        window.v;

      if (!Cesium || !viewer) {
        setTimeout(() => {
          if (!cancelled) placeAllDrones();
        }, 400);
        return;
      }

      for (const d of locs) {
        if (!d.latitude || !d.longitude) continue;

        const id = `drone_${d.drone_code}`;

        const carto = Cesium.Cartographic.fromDegrees(
          d.longitude,
          d.latitude
        );

        const updated = await Cesium.sampleTerrainMostDetailed(
          viewer.terrainProvider,
          [carto]
        );

        if (cancelled) return;

        const groundHeight = updated[0].height || 0;
        const finalHeight = groundHeight + 600;

        const pos = Cesium.Cartesian3.fromDegrees(
          d.longitude,
          d.latitude,
          finalHeight
        );

        let entity = viewer.entities.getById(id);

        if (!entity) {
          viewer.entities.add({
            id,
            position: pos,
            model: {
              uri: "../assets/model/drone.glb",
              scale: 0.5,
              minimumPixelSize: 64,
            },
          });
        } else {
          entity.position = pos;
        }
      }

      if (!hasAutoZoomedRef.current) {
        hasAutoZoomedRef.current = true;

        setTimeout(() => {
          try {
            viewer.zoomTo(
              viewer.entities,
              new Cesium.HeadingPitchRange(0, -0.8, 1000)
            );
          } catch (e) {
            console.log("Zoom error:", e);
          }
        }, 1200);
      }
    }

    placeAllDrones();

    return () => {
      cancelled = true;
    };
  }, [mapMode, droneLocations]);

  useEffect(() => {
    if (mapMode === "3d") {
      hasAutoZoomedRef.current = false;
    }
  }, [mapMode]);

  return (
    <>
      <Card className="mb-0 bg-card border border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle size={18} className="text-red-400" />
            <CardTitle className="text-lg font-semibold">
              Live Monitoring
            </CardTitle>
          </div>
<div className="flex gap-2">
  <button
    onClick={() => setMapMode("2d")}
    className={`px-3 py-1 rounded-md text-sm transition-colors ${
      mapMode === "2d"
        ? "bg-red-600 text-white"
        : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }`}
  >
    2D Map
  </button>

  <button
    onClick={() => setMapMode("3d")}
    className={`px-3 py-1 rounded-md text-sm transition-colors ${
      mapMode === "3d"
        ? "bg-red-600 text-white"
        : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }`}
  >
    3D Map
  </button>
</div>
        </CardHeader>

        <CardContent className="pb-0 overflow-hidden">
          <div
            id="liveMap"
            style={{
              display: mapMode === "2d" ? "block" : "none",
              height: "350px",
              borderRadius: "10px",
            }}
          ></div>

          <div
            id="map-container"
            style={{
              display: mapMode === "3d" ? "block" : "none",
              height: "350px",
            }}
          ></div>
        </CardContent>
      </Card>
    </>
  );
}

export default memo(DashboardMapSection);
