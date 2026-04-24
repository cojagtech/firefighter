import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AddDroneDialog from "@/components/admin/drone-details/AddDroneDialog";
import EditDroneDialog from "@/components/admin/drone-details/EditDroneDialog";
import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/common/SafeIcon";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ─── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const statusMap = {
    active: "bg-green-600 text-white",
    standby: "bg-amber-500 text-white",
    maintenance: "bg-red-500 text-white",
  };

  const statusClass =
    statusMap[status?.toLowerCase()] || "bg-gray-600 text-white";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
    >
      <span className="w-2 h-2 rounded-full bg-white" />
      {status || "Unknown"}
    </span>
  );
}

export default function DronesList() {
  const [drones, setDrones] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDrone, setEditingDrone] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const navigate = useNavigate();

  // ✅ SAME THEME SYSTEM AS DIALOGS
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

  // ── Fetch stations
  useEffect(() => {
    fetch(`${API_BASE}/admin/station/get_stations.php`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.stations || [];
        setStations(list);
      });
  }, []);

  // ── Fetch drones
  useEffect(() => {
    fetchDrones();
  }, [selectedStation]);

  const fetchDrones = () => {
    setLoading(true);

    const url =
      selectedStation !== "All"
        ? `${API_BASE}/admin/admin-drone-details/getDronesByStation.php?station=${selectedStation}`
        : `${API_BASE}/admin/admin-drone-details/getAllDrones.php`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setDrones(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // ── Delete with toast
  const handleDelete = (drone) => {
    fetch(`${API_BASE}/admin/admin-drone-details/deleteDrone.php`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        drone_code: drone.drone_code,
        station: drone.station, // ✅ ADD THIS
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setDrones((prev) =>
            prev.filter((d) => d.drone_code !== drone.drone_code)
          );
          toast.success(`${drone.drone_name} deleted`);
        } else {
          toast.error(res.message || "Delete failed");
        }
      })
      .catch(() => toast.error("Server error"));
  };

  const filtered = drones.filter((d) => {
    const q = search.toLowerCase();

    return (
      !q ||
      d.drone_name?.toLowerCase().includes(q) ||
      d.drone_code?.toLowerCase().includes(q) ||
      d.status?.toLowerCase().includes(q) ||
      d.station?.toLowerCase().includes(q) ||
      d.station_name?.toLowerCase().includes(q)
    );
  });

  const inputStyle = {
    backgroundColor: isDark ? "#141414" : "#ffffff",
    color: isDark ? "#ffffff" : "#000000",
    borderColor: isDark ? "#2E2E2E" : "#e5e7eb",
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundColor: isDark ? "#0A0C0F" : "#F9FAFB",
        color: isDark ? "#FAFAFA" : "#000000",
      }}
    >
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Drones Management</h1>

        <div className="flex gap-3">
          {/* Add Drone Button */}
          <Button
            variant="outline"
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-2 active:scale-98"
          >
            <Plus size={16} />
            Add Drone
          </Button>
          {/* Back Button */}
          <Button
            onClick={() => navigate("/drones")}
            className="gap-2 border border-[#2E2E2E] hover:bg-[#2c2c2c] active:scale-95"
            style={{
              backgroundColor: isDark ? "none" : "#e5e7eb",
              color: isDark ? "#FAFAFA" : "#111827",
            }}
          >
            <SafeIcon name="ArrowLeft" size={16} /> Back
          </Button>

        </div>
      </div>

      {/* Filters */}
      <div
        className="flex gap-3 mb-6 p-4 rounded-xl border"
        style={{
          backgroundColor: isDark ? "#0D0F12" : "#ffffff",
          borderColor: isDark ? "#2E2E2E" : "#e5e7eb",
        }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, status, or station..."
            style={inputStyle}
            className="w-full h-10 pl-9 pr-3 rounded-lg border"
          />
        </div>

        {/* Station */}
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          style={inputStyle}
          className="h-10 px-3 rounded-lg border"
        >
          <option value="All">All Stations</option>
          {stations.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: isDark ? "#0D0F12" : "#ffffff",
          borderColor: isDark ? "#2E2E2E" : "#e5e7eb",
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                backgroundColor: isDark ? "#111418" : "#F9FAFB",
              }}
            >
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Station</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((drone) => (
              <tr
                key={drone.drone_code}
                className="transition-colors"
                style={{
                  borderTop: `1px solid ${isDark ? "#2E2E2E" : "#e5e7eb"
                    }`,
                }}
              >
                <td className="px-4 py-3">{drone.drone_name}</td>
                <td className="px-4 py-3">{drone.drone_code}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={drone.status} />
                </td>
                <td className="px-4 py-3">{drone.station}</td>
                <td>
                  <div className="px-4 py-3 flex gap-2 justify-end">
                    {/* Edit Button */}
                    <Button
                      variant="edit"
                      size="sm"
                      className={isDark
                        ? "border-[#1D4ED8] text-[#60A5FA] hover:bg-[#1E293B]"
                        : "border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]"
                      }
                      onClick={() => {
                        setEditingDrone(drone);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <SafeIcon name="Pencil" size={14} />
                      Edit
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="delete"
                      size="sm"
                      className={isDark
                        ? "border-[#7F1D1D] text-[#F87171] hover:bg-[#2A0E0E]"
                        : "border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2]"
                      }
                      onClick={() => handleDelete(drone)}
                    >
                      <SafeIcon name="Trash2" size={14} />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <AddDroneDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        stations={stations}
        onSuccess={fetchDrones}
      />

      <EditDroneDialog
        drone={editingDrone}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={fetchDrones}
      />
    </div>
  );
}