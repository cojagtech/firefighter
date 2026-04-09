import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SafeIcon from "@/components/common/SafeIcon";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function HistoryTab({ droneId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null); // GPS logs for selected incident
  const [pathLoading, setPathLoading] = useState(false);

  useEffect(() => {
    if (!droneId) return;

    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/admin/admin-drone-details/get_drone_history.php?drone_id=${droneId}`
        );
        const data = await res.json();

        if (!data.success) throw new Error(data.message || "Failed to fetch history");

        setLogs(data.history || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [droneId]);

  // Fetch GPS path for an incident
  const viewPath = async (incidentId) => {
    setPathLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/admin/admin-drone-details/get_drone_gps_logs.php?incident_id=${incidentId}`
      );
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed to fetch GPS logs");

      setSelectedPath({
        incidentId,
        gpsLogs: data.gps_logs, // expect [{lat, lng, timestamp}, ...]
      });
    } catch (err) {
      alert("Error fetching path: " + err.message);
    } finally {
      setPathLoading(false);
    }
  };

  // Close map view handler
  const closePath = () => {
    setSelectedPath(null);
  };

  return (
    <Card>
      <CardContent className="space-y-4 mt-4">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && logs.length === 0 && <p>No flight history available.</p>}

        {logs.map((log, idx) => (
          <div
            key={idx}
            className="flex justify-between border-b pb-4 last:border-0 items-center"
          >
            {/* LEFT SIDE */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <SafeIcon name="Plane" size={20} className="text-primary" />
                <p className="font-semibold text-base">
                  {log.incident_name || `Incident #${log.incident_id}`}
                </p>
              </div>
              {log.incident_location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  📍 {log.incident_location}
                </p>
              )}
              <p className="text-xs text-muted-foreground">ID: {log.incident_id}</p>
            </div>

            {/* CENTER: View Path / Close Button */}
            <div>
              {selectedPath?.incidentId === log.incident_id ? (
                <button
                  type="button"
                  onClick={closePath}
                  className="px-3 py-1 border border-red-500 rounded text-red-500 text-sm font-medium hover:bg-red-50 active:bg-red-100 transition cursor-pointer"
                >
                  Close Path
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => viewPath(log.incident_id)}
                  disabled={pathLoading && selectedPath?.incidentId === log.incident_id}
                  className={`px-3 py-1 border border-blue-500 rounded text-blue-500 text-sm font-medium hover:bg-blue-50 active:bg-blue-100 transition
                    ${
                      pathLoading && selectedPath?.incidentId === log.incident_id
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {pathLoading && selectedPath?.incidentId === log.incident_id
                    ? "Loading..."
                    : "View Path"}
                </button>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="text-right text-xs text-muted-foreground">
              <p>{new Date(log.start_time).toLocaleString()}</p>
              {log.end_time && <p>→ {new Date(log.end_time).toLocaleString()}</p>}
            </div>
          </div>
        ))}

        {/* MAP SECTION */}
        {selectedPath && selectedPath.gpsLogs.length > 0 && (
          <div className="mt-4 h-96 rounded overflow-hidden border border-gray-300">
            <MapContainer
              center={[selectedPath.gpsLogs[0].lat, selectedPath.gpsLogs[0].lng]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline
                positions={selectedPath.gpsLogs.map((p) => [p.lat, p.lng])}
                color="blue"
              />
              {selectedPath.gpsLogs.map((p, idx) => (
                <Marker key={idx} position={[p.lat, p.lng]}>
                  <Popup>{new Date(p.timestamp).toLocaleString()}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}