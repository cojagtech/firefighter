import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SafeIcon from "@/components/common/SafeIcon";

import VehicleStats from "./VehicleStats";
import VehicleList from "./VehicleList";
import AddVehicleModal from "./AddVehicleModal";
import VehicleDetailsModal from "./VehicleDetailsModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/admin-vehicle`;

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStation, setSelectedStation] = useState("all");

  const [openModal, setOpenModal] = useState(false);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [stationOpen, setStationOpen] = useState(false);
  const [stationSearch, setStationSearch] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);

  const dropdownRef = useRef(null);
  const statusRef = useRef(null);

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

  const dropdownBg = isDark ? "#141414" : "#ffffff";
  const dropdownColor = isDark ? "#ffffff" : "#000000";
  const dropdownStyle = { backgroundColor: dropdownBg, color: dropdownColor };

  const loadVehicles = async () => {
    try {
      const res = await fetch(`${API}/get_vehicles.php`);
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("Vehicle Fetch Error:", e);
      setVehicles([]);
    }
  };

  const loadStations = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/station/get_stations.php`);
      const data = await res.json();
      const stationArray = Array.isArray(data) ? data : data.stations || [];
      setStations(stationArray);
    } catch (e) {
      console.log("Station fetch error:", e);
      setStations([]);
    }
  };

  useEffect(() => {
    loadVehicles();
    loadStations();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setStationOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStations = stations.filter((st) =>
    st.name.toLowerCase().includes(stationSearch.toLowerCase())
  );

  const handleAddVehicle = async (vehicleData) => {
    try {
      const res = await fetch(`${API}/add_vehicle.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });
      const data = await res.json();
      if (data?.success) loadVehicles();
      return data;
    } catch (e) {
      console.error(e);
      return { success: false, message: "Server error while adding vehicle" };
    }
  };

  const handleViewVehicle = (vehicle) => {
    setViewVehicle(vehicle);
    setViewOpen(true);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const s = searchQuery.toLowerCase();
    const matchSearch =
      v.name?.toLowerCase().includes(s) ||
      v.location?.toLowerCase().includes(s) ||
      v.registration?.toLowerCase().includes(s);
    const matchStatus =
      selectedStatus === "all" || v.status === selectedStatus;
    const matchStation =
      selectedStation === "all" || v.station === selectedStation;
    return matchSearch && matchStatus && matchStation;
  });

  const statuses = ["all", "available", "on-mission", "maintenance"];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage & monitor station vehicles</p>
        </div>
        <Button variant="outline" onClick={() => setOpenModal(true)} className="gap-2">
          <SafeIcon name="Plus" size={18} /> Add New Vehicle
        </Button>
      </div>

      <VehicleStats vehicles={vehicles} />

      <Card className="bg-card shadow-sm hover:shadow-md transition">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div>
            <label className="text-sm font-medium text-foreground">Search</label>
            <div className="relative border border-border rounded bg-background">
              <SafeIcon
                name="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-10 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                placeholder="Search by name, reg, location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status - Custom Dropdown */}
          <div className="relative" ref={statusRef}>
            <label className="text-sm font-medium text-foreground">Status</label>
            <div
              onClick={() => setStatusOpen(!statusOpen)}
              className="w-full p-2 rounded border border-border cursor-pointer flex justify-between items-center bg-background text-foreground"
            >
              <span>{selectedStatus}</span>
              <span className="text-muted-foreground text-xs">▼</span>
            </div>

            {statusOpen && (
              <div
                className="absolute z-50 mt-1 w-full border border-border rounded shadow-lg"
                style={dropdownStyle}
              >
                {statuses.map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      setSelectedStatus(s);
                      setStatusOpen(false);
                    }}
                    style={dropdownStyle}
                    className="px-4 py-2 cursor-pointer hover:opacity-75 capitalize"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Station - Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-sm font-medium text-foreground">Station</label>
            <div
              onClick={() => setStationOpen(!stationOpen)}
              className="w-full p-2 rounded border border-border cursor-pointer flex justify-between items-center bg-background text-foreground"
            >
              <span>{selectedStation === "all" ? "All Stations" : selectedStation}</span>
              <span className="text-muted-foreground text-xs">▼</span>
            </div>

            {stationOpen && (
              <div
                className="absolute z-50 mt-1 w-full border border-border rounded shadow-lg"
                style={dropdownStyle}
              >
                <input
                  type="text"
                  placeholder="Search station..."
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  style={dropdownStyle}
                  className="w-full px-3 py-2 border-b border-border outline-none rounded-t placeholder:text-gray-400"
                />

                <div className="max-h-36 overflow-y-auto no-scrollbar">
                  <div
                    onClick={() => {
                      setSelectedStation("all");
                      setStationOpen(false);
                      setStationSearch("");
                    }}
                    style={dropdownStyle}
                    className="px-4 py-2 cursor-pointer hover:opacity-75"
                  >
                    All
                  </div>

                  {filteredStations.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedStation(st.name);
                        setStationOpen(false);
                        setStationSearch("");
                      }}
                      style={dropdownStyle}
                      className="px-4 py-2 cursor-pointer hover:opacity-75"
                    >
                      {st.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <VehicleList
        vehicles={filteredVehicles}
        onUpdated={loadVehicles}
        onView={handleViewVehicle}
        stations={stations}
      />

      <AddVehicleModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddVehicle}
        stations={stations}
      />

      <VehicleDetailsModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        vehicle={viewVehicle}
      />
    </div>
  );
}