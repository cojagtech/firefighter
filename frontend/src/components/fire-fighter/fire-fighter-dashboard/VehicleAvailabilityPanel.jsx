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

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    if (!station) return;

    async function load() {
      try {
        setLoading(true);

        const v = await fetch(
          `${API_BASE}/admin/admin-vehicle/get_vehicles.php?station=${encodeURIComponent(
            station
          )}`
        ).then((r) => r.json());

        const d = await fetch(
          `${API_BASE}/admin/admin-dashboard/active_drones.php?station=${encodeURIComponent(
            station
          )}`
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

  /* ---------------- COMBINED ASSET LOGIC (HOOK SAFE) ---------------- */

  const allAssets = useMemo(() => {
    return [...vehicles, ...drones];
  }, [vehicles, drones]);

  const available = useMemo(() => {
    return allAssets.filter((a) => a.status === "available").length;
  }, [allAssets]);

  const busy = useMemo(() => {
    return allAssets.filter((a) => a.status !== "available").length;
  }, [allAssets]);

  /* ---------------- STATUS COLOR ---------------- */

  const statusColor = (status) =>
    ({
      available:
        "bg-green-600/30 text-green-300 border-green-500/40",
      busy:
        "bg-yellow-600/30 text-yellow-300 border-yellow-500/40",
      maintenance:
        "bg-red-600/30 text-red-300 border-red-500/40",
    }[status] || "bg-gray-700/30 text-gray-300");

  /* ---------------- LOADING ---------------- */

  if (loading)
    return <p className="text-white p-4">Loading assets...</p>;

  /* ---------------- UI ---------------- */

  return (
    <Card
      sx={{
        background: "#111214",
        border: "1px solid #1d1e21",
        color: "#e3e3e3",
        borderRadius: "14px",
      }}
    >
      <CardHeader
        title={
          <div className="flex items-center gap-2 font-semibold">
            <SafeIcon name="Radio" className="text-red-400" />
            Station Assets – {station}
          </div>
        }
        sx={{ borderBottom: "1px solid #26282b" }}
      />

      <CardContent className="space-y-6">
        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 text-center rounded border border-white/10 hover:border-red-400 transition-all duration-300">
            <p className="text-[11px] text-gray-400">Available</p>
            <p className="text-2xl font-bold text-green-400">
              {available}
            </p>
          </div>

          <div className="p-3 text-center rounded border border-white/10 hover:border-red-400 transition-all duration-300">
            <p className="text-[11px] text-gray-400">Busy</p>
            <p className="text-2xl font-bold text-yellow-400">
              {busy}
            </p>
          </div>
        </div>

        <Divider sx={{ borderColor: "#26282b" }} />

        {/* VEHICLES */}
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <SafeIcon name="Truck" className="text-red-400" />
          Vehicles ({vehicles.length})
        </h3>

        <div className="space-y-2">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="p-3 rounded-lg bg-[#151619] border border-white/10 hover:border-red-400 transition-all duration-300"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-white">
                    {v.name}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {v.type}
                  </p>
                </div>

                <Chip
                  label={v.status}
                  className={`text-[10px] px-2 border ${statusColor(
                    v.status
                  )}`}
                />
              </div>

              <p className="text-[10px] mt-1 text-gray-500">
                {v.registration} | {v.station}
              </p>
            </div>
          ))}
        </div>

        <Divider sx={{ borderColor: "#26282b" }} />

        {/* DRONES */}
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <SafeIcon name="Plane" className="text-red-400" />
          Drones ({drones.length})
        </h3>

        <div className="space-y-2">
          {drones.map((d) => (
            <div
              key={d.drone_code}
              className="p-3 rounded-lg bg-[#151619] border border-white/10 hover:border-red-400 transition-all duration-300"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-200">
                    {d.drone_name}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {d.drone_code} | {d.station}
                  </p>
                </div>

                <Chip
                  label={d.status}
                  className={`text-[10px] px-2 border ${statusColor(
                    d.status
                  )}`}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}