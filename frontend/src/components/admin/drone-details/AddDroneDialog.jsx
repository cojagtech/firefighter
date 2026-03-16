import { useState, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { FiSearch } from "react-icons/fi";

const API_ENDPOINT = `${import.meta.env.VITE_API_BASE_URL}/admin/admin-drone-details/addDrone.php`;

const INITIAL_DRONE = {
  drone_code: "",
  drone_name: "",
  status: "standby",
  flight_hours: 0,
  health_status: "Optimal",
  firmware_version: "",
  is_ready: 1,
  station: "",
};

export default function AddDroneDialog({ open, onOpenChange, stations, onSuccess }) {
  const [drone, setDrone] = useState(INITIAL_DRONE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stationOpen, setStationOpen] = useState(false);
  const [stationSearch, setStationSearch] = useState("");
  const [stationSearchMode, setStationSearchMode] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [isReadyOpen, setIsReadyOpen] = useState(false);

  const stationRef = useRef(null);
  const statusRef = useRef(null);
  const healthRef = useRef(null);
  const isReadyRef = useRef(null);

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

  const dropdownBg = isDark ? "#0D0F12" : "#ffffff";
  const dropdownColor = isDark ? "#FAFAFA" : "#000000";
  const dropdownBorder = isDark ? "#2E2E2E" : "#e2e8f0";
  const dropdownStyle = {
    backgroundColor: dropdownBg,
    color: dropdownColor,
    border: `1px solid ${dropdownBorder}`,
  };
  const inputStyle = {
    backgroundColor: isDark ? "#0D0F12" : "#ffffff",
    color: isDark ? "#FAFAFA" : "#000000",
    border: `1px solid ${isDark ? "#2E2E2E" : "#e2e8f0"}`,
  };

  // Close all dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stationRef.current && !stationRef.current.contains(e.target)) {
        setStationOpen(false);
        setStationSearch("");
        setStationSearchMode(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
      if (healthRef.current && !healthRef.current.contains(e.target)) setHealthOpen(false);
      if (isReadyRef.current && !isReadyRef.current.contains(e.target)) setIsReadyOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStations = stationSearchMode
    ? stations.filter((s) =>
        s.name.toLowerCase().includes(stationSearch.toLowerCase())
      )
    : stations;

  const isFormValid =
    drone.drone_code &&
    drone.drone_name &&
    drone.station &&
    drone.firmware_version;

  const updateField = (field, value) => {
    setDrone((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(drone).forEach(([key, value]) =>
        formData.append(key, value)
      );

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await res.json();

      if (res.status === 409) {
        toast.error(result.message || "Drone code already exists");
        return;
      }

      if (!res.ok || !result.success) {
        toast.error(result.message || "Failed to add drone");
        return;
      }

      toast.success("Drone added successfully");
      setDrone(INITIAL_DRONE);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Server error");
    } finally {
      setIsSubmitting(false);
    }
  }, [drone, isFormValid, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg border"
        style={{
          backgroundColor: isDark ? "#0D0F12" : "#ffffff",
          borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
          color: isDark ? "#FAFAFA" : "#000000",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: isDark ? "#FAFAFA" : "#000000" }}>
            Add New Drone
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Drone Code */}
          <div>
            <label className="text-sm text-muted-foreground">Drone Code</label>
            <input
              type="text"
              value={drone.drone_code}
              placeholder="DR-001"
              onChange={(e) => updateField("drone_code", e.target.value)}
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Drone Name */}
          <div>
            <label className="text-sm text-muted-foreground">Drone Name</label>
            <input
              type="text"
              value={drone.drone_name}
              placeholder="Phantom X"
              onChange={(e) => updateField("drone_name", e.target.value)}
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Flight Hours */}
          <div>
            <label className="text-sm text-muted-foreground">Flight Hours</label>
            <input
              type="number"
              value={drone.flight_hours}
              onChange={(e) => {
                const num = Number(e.target.value);
                if (num > 100) {
                  toast.error("Flight hours cannot exceed 100");
                  return;
                }
                updateField("flight_hours", num);
              }}
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Firmware */}
          <div>
            <label className="text-sm text-muted-foreground">Firmware</label>
            <input
              type="text"
              value={drone.firmware_version}
              placeholder="v1.0.0"
              onChange={(e) => updateField("firmware_version", e.target.value)}
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Status - Custom Dropdown */}
          <div className="relative" ref={statusRef}>
            <label className="text-sm text-muted-foreground">Status</label>
            <div
              onClick={() => setStatusOpen((p) => !p)}
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 flex items-center justify-between cursor-pointer"
            >
              <span className="text-sm">{drone.status || "Select Status"}</span>
              <span className="text-xs opacity-60">▼</span>
            </div>
            {statusOpen && (
              <div
                className="absolute z-50 mt-1 w-full rounded-md shadow-lg overflow-hidden"
                style={dropdownStyle}
              >
                {["Active", "StandBy", "Maintenance"].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      updateField("status", opt);
                      setStatusOpen(false);
                    }}
                    style={{
                      backgroundColor:
                        drone.status === opt
                          ? isDark ? "#1A1D23" : "#f1f5f9"
                          : dropdownBg,
                      color: dropdownColor,
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:opacity-75"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Health Status - Custom Dropdown */}
          <div className="relative" ref={healthRef}>
            <label className="text-sm text-muted-foreground">Health Status</label>
            <div
              onClick={() => setHealthOpen((p) => !p)}
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 flex items-center justify-between cursor-pointer"
            >
              <span className="text-sm">{drone.health_status || "Select Health"}</span>
              <span className="text-xs opacity-60">▼</span>
            </div>
            {healthOpen && (
              <div
                className="absolute z-50 mt-1 w-full rounded-md shadow-lg overflow-hidden"
                style={dropdownStyle}
              >
                {["Optimal", "Degraded", "Require Service"].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      updateField("health_status", opt);
                      setHealthOpen(false);
                    }}
                    style={{
                      backgroundColor:
                        drone.health_status === opt
                          ? isDark ? "#1A1D23" : "#f1f5f9"
                          : dropdownBg,
                      color: dropdownColor,
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:opacity-75"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Is Ready - Custom Dropdown */}
          <div className="relative" ref={isReadyRef}>
            <label className="text-sm text-muted-foreground">Is Ready</label>
            <div
              onClick={() => setIsReadyOpen((p) => !p)}
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 flex items-center justify-between cursor-pointer"
            >
              <span className="text-sm">{drone.is_ready ? "Yes" : "No"}</span>
              <span className="text-xs opacity-60">▼</span>
            </div>
            {isReadyOpen && (
              <div
                className="absolute z-50 mt-1 w-full rounded-md shadow-lg overflow-hidden"
                style={dropdownStyle}
              >
                {["Yes", "No"].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      updateField("is_ready", opt === "Yes" ? 1 : 0);
                      setIsReadyOpen(false);
                    }}
                    style={{
                      backgroundColor:
                        (drone.is_ready ? "Yes" : "No") === opt
                          ? isDark ? "#1A1D23" : "#f1f5f9"
                          : dropdownBg,
                      color: dropdownColor,
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:opacity-75"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Station - Searchable Custom Dropdown */}
          <div className="relative" ref={stationRef}>
            <label className="text-sm text-muted-foreground">Station</label>
            <div
              onClick={() => setStationOpen((p) => !p)}
              style={inputStyle}
              className="w-full mt-1 h-9 flex items-center px-3 rounded-md cursor-pointer"
            >
              <div className="flex-1">
                {stationSearchMode ? (
                  <input
                    autoFocus
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    placeholder="Search station..."
                    onClick={(e) => e.stopPropagation()}
                    style={{ backgroundColor: "transparent", color: dropdownColor }}
                    className="text-sm outline-none w-full"
                  />
                ) : (
                  <span className="text-sm truncate">
                    {drone.station || "Select Station"}
                  </span>
                )}
              </div>
              <FiSearch
                size={16}
                className="ml-2 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setStationSearchMode(true);
                  setStationOpen(true);
                }}
              />
            </div>

            {stationOpen && (
              <div
                className="absolute z-50 mt-1 w-full rounded-md shadow-lg max-h-[120px] overflow-y-auto"
                style={dropdownStyle}
              >
                {filteredStations.length ? (
                  filteredStations.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        updateField("station", s.name);
                        setStationOpen(false);
                        setStationSearch("");
                        setStationSearchMode(false);
                      }}
                      style={{
                        backgroundColor:
                          drone.station === s.name
                            ? isDark ? "#1A1D23" : "#f1f5f9"
                            : dropdownBg,
                        color: dropdownColor,
                      }}
                      className="px-3 py-2 text-sm cursor-pointer hover:opacity-75"
                    >
                      {s.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No stations found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Button
          disabled={!isFormValid || isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          onClick={handleSubmit}
        >
          {isSubmitting ? "Saving..." : "Save Drone"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}