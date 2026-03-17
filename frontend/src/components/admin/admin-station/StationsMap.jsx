import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/station`;

function ChangeMapCenter({ station }) {
  const map = useMap();

  useEffect(() => {
    if (station) {
      map.setView([station.lat, station.lng], 15);
    }
  }, [station, map]);

  return null;
}

export default function StationsMap({ selectedStation }) {
  const [stations, setStations] = useState([]);

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

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await fetch(`${API}/get_stations.php`);
      const data = await res.json();
      if (data.status) {
        setStations(data.stations);
      }
    } catch (err) {
      console.error("Map station fetch failed", err);
    }
  };

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        backgroundColor: isDark ? "#111418" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
      }}
    >
      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={12}
        className="h-[350px] rounded-lg"
        style={{
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {selectedStation && <ChangeMapCenter station={selectedStation} />}

        {stations.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              Code: {s.code}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}