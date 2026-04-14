"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function EditDroneDialog({ drone, isOpen, onClose, onSuccess }) {
  const [editData, setEditData] = useState({
    flight_hours: "",
    health_status: "",
    firmware_version: "",
    status: "",
  });

  const [saving, setSaving] = useState(false);

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
    if (drone && isOpen) {
      setEditData({
        flight_hours: drone.flight_hours ?? "",
        health_status: drone.health_status ?? "",
        firmware_version: drone.firmware_version ?? "",
        status: drone.status ?? "",
      });
    }
  }, [drone, isOpen]);

  if (!isOpen) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();

    setSaving(true);

    const formData = new FormData();
    formData.append("drone_code", drone.drone_code);
    formData.append("flight_hours", editData.flight_hours);
    formData.append("health_status", editData.health_status);
    formData.append("firmware_version", editData.firmware_version);
    formData.append("status", editData.status);

    try {
      const response = await fetch(
        `${API_BASE}/admin/admin-drone-details/updateDroneDetails.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Drone updated successfully");
        onClose();
        onSuccess && onSuccess();
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: isDark ? "#141414" : "#ffffff",
    color: isDark ? "#ffffff" : "#000000",
    borderColor: isDark ? "#2E2E2E" : "#e5e7eb",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-lg p-5 mt-[40px]"
        style={{
          backgroundColor: isDark ? "#1d1f22" : "#ffffff",
          color: isDark ? "#FAFAFA" : "#000000",
        }}
      >
        <h2 className="text-lg font-semibold mb-4 text-[#dc2626]">
          Edit Drone: {drone?.drone_name}
        </h2>

        <form onSubmit={handleUpdate} className="flex flex-col gap-3">
          {/* Flight Hours */}
          <div>
            <label className="text-sm mb-1 block">Flight Hours</label>
            <input
              type="number"
              value={editData.flight_hours}
              onChange={(e) =>
                setEditData({ ...editData, flight_hours: e.target.value })
              }
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            />
          </div>

          {/* Firmware */}
          <div>
            <label className="text-sm mb-1 block">Firmware Version</label>
            <input
              value={editData.firmware_version}
              onChange={(e) =>
                setEditData({ ...editData, firmware_version: e.target.value })
              }
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm mb-1 block">Status</label>
            <select
              value={editData.status}
              onChange={(e) =>
                setEditData({ ...editData, status: e.target.value })
              }
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            >
              <option value="Active">Active</option>
              <option value="StandBy">StandBy</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Health */}
          <div>
            <label className="text-sm mb-1 block">Health Status</label>
            <select
              value={editData.health_status}
              onChange={(e) =>
                setEditData({ ...editData, health_status: e.target.value })
              }
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            >
              <option value="Optimal">Optimal</option>
              <option value="Degraded">Degraded</option>
              <option value="Require Service">Require Service</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded h-9 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-600 text-white rounded h-9 text-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}