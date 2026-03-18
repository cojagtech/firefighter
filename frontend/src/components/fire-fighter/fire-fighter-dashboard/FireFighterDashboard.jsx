import { useEffect, useRef, useState } from "react";
import SummaryStatsGrid from "@/components/fire-fighter/fire-fighter-dashboard/SummaryStatsGrid.jsx";
import IncidentStreamTable from "@/components/fire-fighter/fire-fighter-dashboard/IncidentStreamTable.jsx";
import VehicleAvailabilityPanel from "@/components/fire-fighter/fire-fighter-dashboard/VehicleAvailabilityPanel.jsx";
import IncidentAlertFeed from "@/components/fire-fighter/fire-fighter-dashboard/IncidentAlertFeed";
import useUserInfo from "@/components/common/auth/useUserInfo";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/fire-fighter/fire-fighter-dashboard`;

export default function FireFighterDashboard() {
  const { station, role, name } = useUserInfo();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incidentFilter, setIncidentFilter] = useState("all");
  const tableRef = useRef(null);

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

  // ✅ All backend logic unchanged
  useEffect(() => {
    if (!station) {
      setLoading(false);
      return;
    }

    const url = `${API}/incidents.php?station=${encodeURIComponent(station)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status && Array.isArray(data.data)) {
          setIncidents(
            data.data.map((inc) => ({
              id: inc.id,
              name: inc.name,
              location: inc.location,
              latitude: inc.latitude,
              longitude: inc.longitude,
              status: inc.status?.toLowerCase(),
              timeReported: inc.time,
              isNewAlert: inc.isNewAlert,
            }))
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching incidents:", err);
        setLoading(false);
      });
  }, [station]);

  const pageBg = isDark ? "#0d0d0f" : "#f8fafc";
  const cardBg = isDark ? "#131416" : "#ffffff";
  const cardBorder = isDark ? "#1e1f22" : "#e2e8f0";
  const textColor = isDark ? "#e5e7eb" : "#111827";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";

  if (loading) return (
    <p style={{ color: textColor }} className="p-4">
      Loading incidents...
    </p>
  );

  if (!station) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: pageBg }}
      >
        <p style={{ color: mutedColor }}>
          No station linked with this account. Please contact admin.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: pageBg, color: textColor }}
    >
      <main className="min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-6 py-6 space-y-8">

          {/* Stats Card */}
          <div
            className="rounded-xl p-4 shadow-md"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <SummaryStatsGrid
              apiBase={API}
              station={station}
              activeFilter={incidentFilter}
              onFilterChange={(filter) => {
                setIncidentFilter(filter);
                setTimeout(() => {
                  tableRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 100);
              }}
            />
          </div>

          {/* Alert Feed */}
          <IncidentAlertFeed
            IncidentAPI_BASE={API}
            station={station}
          />

          {/* Incident Table */}
          <div
            ref={tableRef}
            className="rounded-xl p-4 shadow"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <IncidentStreamTable
              incidents={incidents}
              filter={incidentFilter}
              onFilterChange={setIncidentFilter}
            />
          </div>

          {/* Vehicle Panel */}
          <div
            className="rounded-xl p-5 shadow"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <VehicleAvailabilityPanel
              apiBase={API}
              station={station}
            />
          </div>

        </div>
      </main>
    </div>
  );
}