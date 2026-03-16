import { useEffect, useState, useRef } from "react";
import L from "leaflet";

export default function DroneMonitoringMap({ drones }) {
  const [mapMode, setMapMode] = useState("2d");
  const mapRef = useRef(null);

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

  function loadLeafletMap() {
    const div = document.getElementById("monitorMap2D");
    if (!div || div.offsetHeight === 0) return;

    if (!mapRef.current) {
      mapRef.current = L.map("monitorMap2D").setView([18.527693, 73.853166], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);
    }

    if (!window.monitorMarkerLayer) {
      window.monitorMarkerLayer = L.layerGroup().addTo(mapRef.current);
    } else {
      window.monitorMarkerLayer.clearLayers();
    }

    drones.forEach((d) => {
      if (!d.latitude || !d.longitude) return;

      L.marker([d.latitude, d.longitude])
        .bindPopup(`
          <b>${d.drone_name}</b><br>
          Code: ${d.drone_code}<br>
          Status: ${d.status}<br>
        `)
        .addTo(window.monitorMarkerLayer);
    });

    setTimeout(() => mapRef.current?.invalidateSize(), 200);
  }

  useEffect(() => {
    const mapDiv = document.getElementById("monitorMap2D");
    if (!mapDiv) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && mapMode === "2d") {
        loadLeafletMap();
      }
    });

    observer.observe(mapDiv);
    return () => observer.disconnect();
  }, [mapMode]);

  useEffect(() => {
    if (mapMode === "2d") {
      setTimeout(loadLeafletMap, 200);
    }
  }, [drones, mapMode]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-semibold mt-2 text-foreground">
            Drone Monitoring
          </h2>
          <p className="text-sm text-muted-foreground mb-2">
            Live drone locations
          </p>
        </div>
      </div>

      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ backgroundColor: isDark ? "#14171b" : "#f1f5f9" }}
      >
        <div id="monitorMap2D" style={{ height: "350px" }}></div>
      </div>
    </div>
  );
}