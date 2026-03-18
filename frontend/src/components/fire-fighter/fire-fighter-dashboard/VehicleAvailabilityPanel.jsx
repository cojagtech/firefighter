import { useEffect, useState, useMemo } from "react";
import useUserInfo from "@/components/common/auth/useUserInfo";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import SafeIcon from "@/components/common/SafeIcon";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function VehicleAvailabilityPanel() {
  const { station } = useUserInfo();

  const [vehicles, setVehicles] = useState([]);
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!station) return;

    async function load() {
      try {
        setLoading(true);

        const v = await fetch(
          `${API_BASE}/admin/admin-vehicle/get_vehicles.php?station=${encodeURIComponent(station)}`
        ).then((r) => r.json());

        const d = await fetch(
          `${API_BASE}/admin/admin-dashboard/active_drones.php?station=${encodeURIComponent(station)}`
        ).then((r) => r.json());

        setVehicles(v || []);
        setDrones(d || []);
      } catch (err) {
        console.error("Asset load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [station]);

  const allAssets = useMemo(() => [...vehicles, ...drones], [vehicles, drones]);

  const available = useMemo(
    () => allAssets.filter((a) => a.status === "available").length,
    [allAssets]
  );

  const busy = useMemo(
    () => allAssets.filter((a) => a.status !== "available").length,
    [allAssets]
  );

  const statusColor = (status) =>
    ({
      available: "bg-green-600/30 text-green-300 border-green-500/40",
      busy: "bg-yellow-600/30 text-yellow-300 border-yellow-500/40",
      maintenance: "bg-red-600/30 text-red-300 border-red-500/40",
    }[status] || "bg-gray-700/30 text-gray-300");

  // Theme styles
  const C = isDark
    ? {
        cardBg: "#111214",
        cardBorder: "#1d1e21",
        cardText: "#e3e3e3",
        headerBorder: "#26282b",
        itemBg: "#151619",
        itemBorder: "rgba(255,255,255,0.1)",
        divider: "#26282b",
        title: "#ffffff",
        muted: "#9ca3af",
        faded: "#6b7280",
      }
    : {
        cardBg: "#ffffff",
        cardBorder: "#e2e8f0",
        cardText: "#111827",
        headerBorder: "#e2e8f0",
        itemBg: "#f8fafc",
        itemBorder: "#e2e8f0",
        divider: "#e2e8f0",
        title: "#111827",
        muted: "#6b7280",
        faded: "#9ca3af",
      };

  if (loading)
    return (
      <p style={{ color: C.title }} className="p-4">
        Loading assets...
      </p>
    );

  return (
    <Card
      sx={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        color: C.cardText,
        borderRadius: "14px",
        boxShadow: isDark
          ? "0 4px 12px rgba(0,0,0,0.5)"
          : "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <CardHeader
        title={
          <div
            className="flex items-center gap-2 font-semibold"
            style={{ color: C.title }}
          >
            <SafeIcon name="Radio" className="text-red-400" />
            Station Assets – {station}
          </div>
        }
        sx={{ borderBottom: `1px solid ${C.headerBorder}` }}
      />

      <CardContent className="space-y-6">
        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-3 text-center rounded hover:border-red-400 transition-all duration-300"
            style={{ border: `1px solid ${C.itemBorder}` }}
          >
            <p className="text-[11px]" style={{ color: C.muted }}>
              Available
            </p>
            <p className="text-2xl font-bold text-green-400">{available}</p>
          </div>

          <div
            className="p-3 text-center rounded hover:border-red-400 transition-all duration-300"
            style={{ border: `1px solid ${C.itemBorder}` }}
          >
            <p className="text-[11px]" style={{ color: C.muted }}>
              Busy
            </p>
            <p className="text-2xl font-bold text-yellow-400">{busy}</p>
          </div>
        </div>

        <Divider sx={{ borderColor: C.divider }} />

        {/* VEHICLES */}
        <h3
          className="text-sm font-semibold flex items-center gap-2"
          style={{ color: C.title }}
        >
          <SafeIcon name="Truck" className="text-red-400" />
          Vehicles ({vehicles.length})
        </h3>

        <div className="space-y-2">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="p-3 rounded-lg hover:border-red-400 transition-all duration-300"
              style={{
                backgroundColor: C.itemBg,
                border: `1px solid ${C.itemBorder}`,
              }}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium" style={{ color: C.title }}>
                    {v.name}
                  </p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    {v.type}
                  </p>
                </div>
                <Chip
                  label={v.status}
                  className={`text-[10px] px-2 border ${statusColor(v.status)}`}
                />
              </div>
              <p className="text-[10px] mt-1" style={{ color: C.faded }}>
                {v.registration} | {v.station}
              </p>
            </div>
          ))}
        </div>

        <Divider sx={{ borderColor: C.divider }} />

        {/* DRONES */}
        <h3
          className="text-sm font-semibold flex items-center gap-2"
          style={{ color: C.title }}
        >
          <SafeIcon name="Plane" className="text-red-400" />
          Drones ({drones.length})
        </h3>

        <div className="space-y-2">
          {drones.map((d) => (
            <div
              key={d.drone_code}
              className="p-3 rounded-lg hover:border-red-400 transition-all duration-300"
              style={{
                backgroundColor: C.itemBg,
                border: `1px solid ${C.itemBorder}`,
              }}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium" style={{ color: C.title }}>
                    {d.drone_name}
                  </p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    {d.drone_code} | {d.station}
                  </p>
                </div>
                <Chip
                  label={d.status}
                  className={`text-[10px] px-2 border ${statusColor(d.status)}`}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}