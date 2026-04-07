import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SafeIcon from "@/components/common/SafeIcon";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function HistoryTab({ droneId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!droneId) return;

    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/admin/admin-drone-details/get_drone_history.php?drone_id=${droneId}`
        );
        const data = await res.json();

        console.log("🚀 Full API Response:", data);

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch history");
        }

        setLogs(data.history || []);
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [droneId]);

  return (
    <Card>
      <CardContent className="space-y-4 mt-4">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && logs.length === 0 && (
          <p>No flight history available.</p>
        )}

        {logs.map((log, idx) => (
          <div
            key={idx}
            className="flex justify-between border-b pb-4 last:border-0"
          >
            {/* LEFT SIDE */}
            <div className="flex gap-3">
              <SafeIcon
                name="Plane"
                size={20}
                className="text-primary mt-1"
              />

              <div className="space-y-1">
                {/* Incident Name */}
                <p className="font-semibold text-base">
                  {log.incident_name || `Incident #${log.incident_id}`}
                </p>

                {/* Location */}
                {log.incident_location && (
                  <p className="text-sm text-muted-foreground">
                    📍 {log.incident_location}
                  </p>
                )}

                {/* Incident ID */}
                <p className="text-xs text-muted-foreground">
                  ID: {log.incident_id}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE (Time) */}
            <div className="text-right text-xs text-muted-foreground">
              <p>
                {new Date(log.start_time).toLocaleString()}
              </p>

              {log.end_time && (
                <p>
                  → {new Date(log.end_time).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}