import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const API = `${import.meta.env.VITE_API_BASE_URL}/admin/admin-drone-details`;

export default function EditDroneDialog({ open, onOpenChange, drone, onSuccess }) {
  const [editData, setEditData] = useState({
    flight_hours: "",
    health_status: "",
    firmware_version: "",
    status: "",
  });

  const [healthOpen, setHealthOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const healthRef = useRef(null);
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

  const dropdownBg = isDark ? "#0D0F12" : "#ffffff";
  const dropdownColor = isDark ? "#FAFAFA" : "#000000";
  const dropdownBorder = isDark ? "#2E2E2E" : "#e2e8f0";
  const inputStyle = {
    backgroundColor: isDark ? "#0D0F12" : "#ffffff",
    color: isDark ? "#FAFAFA" : "#000000",
    border: `1px solid ${isDark ? "#2E2E2E" : "#e2e8f0"}`,
  };
  const dropdownStyle = {
    backgroundColor: dropdownBg,
    color: dropdownColor,
    border: `1px solid ${dropdownBorder}`,
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (healthRef.current && !healthRef.current.contains(e.target)) setHealthOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (drone) {
      setEditData({
        flight_hours: drone.flight_hours ?? "",
        health_status: drone.health_status ?? "",
        firmware_version: drone.firmware_version ?? "",
        status: drone.status ?? "",
      });
    }
  }, [drone, open]);

  const handleUpdate = () => {
    const formData = new FormData();
    formData.append("drone_code", drone.drone_code);
    formData.append("flight_hours", editData.flight_hours);
    formData.append("health_status", editData.health_status);
    formData.append("firmware_version", editData.firmware_version);
    formData.append("status", editData.status);

    fetch(`${API}/updateDroneDetails.php`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Drone updated successfully");
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error("Update failed");
        }
      })
      .catch(() => toast.error("Server error"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md border"
        style={{
          backgroundColor: isDark ? "#0D0F12" : "#ffffff",
          borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
          color: isDark ? "#FAFAFA" : "#000000",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: isDark ? "#FAFAFA" : "#000000" }}>
            Edit Drone: {drone?.drone_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Flight Hours */}
          <div>
            <label className="text-sm text-muted-foreground">Flight Hours</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={editData.flight_hours}
              onChange={(e) =>
                setEditData({ ...editData, flight_hours: e.target.value })
              }
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 text-sm focus:outline-none focus:ring-0 focus:border-red-600 hover:border-red-600"
            />
          </div>

          {/* Health - Custom Dropdown */}
          <div className="relative" ref={healthRef}>
            <label className="text-sm text-muted-foreground">Health</label>
            <div
              onClick={() => setHealthOpen((p) => !p)}
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 text-sm flex items-center justify-between cursor-pointer hover:border-red-600"
            >
              <span>{editData.health_status || "Select Health"}</span>
              <span className="text-xs opacity-60">▼</span>
            </div>
            {healthOpen && (
              <div
                className="absolute z-50 mt-1 w-full rounded-md shadow-lg overflow-hidden"
                style={dropdownStyle}
              >
                {["Optimal", "Degraded", "Requires Service"].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setEditData({ ...editData, health_status: opt });
                      setHealthOpen(false);
                    }}
                    style={{
                      backgroundColor:
                        editData.health_status === opt
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

          {/* Firmware Version */}
          <div>
            <label className="text-sm text-muted-foreground">Firmware Version</label>
            <input
              type="text"
              value={editData.firmware_version}
              onChange={(e) =>
                setEditData({ ...editData, firmware_version: e.target.value })
              }
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 text-sm focus:outline-none focus:ring-0 focus:border-red-600 hover:border-red-600"
            />
          </div>

          {/* Status - Custom Dropdown */}
          <div className="relative" ref={statusRef}>
            <label className="text-sm text-muted-foreground">Status</label>
            <div
              onClick={() => setStatusOpen((p) => !p)}
              style={inputStyle}
              className="w-full mt-1 h-9 rounded-md px-3 text-sm flex items-center justify-between cursor-pointer hover:border-red-600"
            >
              <span>{editData.status || "Select Status"}</span>
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
                      setEditData({ ...editData, status: opt });
                      setStatusOpen(false);
                    }}
                    style={{
                      backgroundColor:
                        editData.status === opt
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

        </div>

        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          onClick={handleUpdate}
        >
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}