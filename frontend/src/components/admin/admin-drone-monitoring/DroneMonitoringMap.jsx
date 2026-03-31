import { useEffect, useState, useRef } from "react";
import L from "leaflet";

export default function DroneMonitoringMap({ drones }) {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const hasAutoZoomedRef = useRef(false); // ✅ NEW

  // 🌙 Theme observer
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

  // 🚀 Initialize map ONLY ONCE
  const initializeMap = () => {
    const div = document.getElementById("monitorMap2D");
    if (!div || div.offsetHeight === 0) return;

    if (!mapRef.current) {
      mapRef.current = L.map("monitorMap2D").setView(
        [18.527693, 73.853166],
        14
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);

      markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 0);
  };

  // 📍 Update markers + auto focus
  const updateMarkers = () => {
    if (!markerLayerRef.current) return;

    markerLayerRef.current.clearLayers();

    const validDrones = drones.filter(
      (d) => d.latitude && d.longitude
    );

    const bounds = [];

    validDrones.forEach((d) => {
      const latLng = [d.latitude, d.longitude];
      bounds.push(latLng);

      L.marker(latLng)
        .bindPopup(`
          <b>${d.drone_name}</b><br/>
          Code: ${d.drone_code}<br/>
          Status: ${d.status}
        `)
        .addTo(markerLayerRef.current);
    });

    // ✅ Auto focus ONLY once
    if (bounds.length > 0 && !hasAutoZoomedRef.current) {
      hasAutoZoomedRef.current = true;

      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
      });
    }
  };

  // 🧠 Run once
  useEffect(() => {
    initializeMap();
  }, []);

  // 🔄 Update when drones change
  useEffect(() => {
    initializeMap();
    updateMarkers();
  }, [drones]);

  // 🧹 Cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
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
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: isDark ? "#14171b" : "#f1f5f9" }}
      >
        <div id="monitorMap2D" style={{ height: "350px" }}></div>
      </div>
    </div>
  );
}