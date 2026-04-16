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

  const [initialData, setInitialData] = useState(null);
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
      const data = {
        flight_hours: drone.flight_hours ?? "",
        health_status: drone.health_status ?? "",
        firmware_version: drone.firmware_version ?? "",
        status: drone.status ?? "",
      };

      setEditData(data);
      setInitialData(data);
    }
  }, [drone, isOpen]);

  if (!isOpen) return null;

  // ✅ change detection
  const isChanged =
    JSON.stringify(editData) !== JSON.stringify(initialData);

  // ✅ delayed close
  const closeWithDelay = (callback) => {
    setTimeout(() => {
      callback && callback();
      onClose();
    }, 200);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!isChanged) {
      toast("No changes made", { icon: "⚠️" });
      return;
    }

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
        closeWithDelay(onSuccess);
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
    backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
    color: isDark ? "#ffffff" : "#000000",
    borderColor: isDark ? "#333333" : "#e5e7eb",
  };

  const labelBg = isDark ? "#2c2c2c" : "#ffffff";
  const labelColor = isDark ? "#9ca3af" : "#6b7280";
  const secondaryBorderColor = isDark ? "#3a3a3a" : "#f0f0f0";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm mt-[25px]"
      onClick={() => closeWithDelay()} // ✅ outside click
    >
      <div
        onClick={(e) => e.stopPropagation()} // ✅ prevent inside click
        className="w-full max-w-md rounded-xl shadow-lg overflow-hidden"
        style={{
          backgroundColor: isDark ? "#1d1d1d" : "#ffffff",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: secondaryBorderColor }}
        >
          <h2 className="text-lg font-bold text-[#dc2626]">
            Edit Drone Configuration
          </h2>

          {/* ✅ Drone info */}
          <p className="text-sm mt-1 text-gray-400">
            {drone?.drone_name || "Unknown Drone"} | ID: {drone?.drone_code}
          </p>

        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="px-6 py-6 space-y-6">

          <div className="mb-4 px-4 py-2 mb-[25px] rounded-lg text-sm border"
            style={{
              background: isDark ? "#2a2a2a" : "#f9fafb",
              borderColor: secondaryBorderColor,
              color: labelColor,
            }}>
            ⚠️ Changes are saved immediately. Review and confirm updates below.
          </div>
          
          {/* Flight Hours */}
          <div className="relative">
            <span className="absolute -top-2 left-3 px-1 text-xs"
              style={{ background: labelBg, color: labelColor }}>
              Flight Hours
            </span>
            <input
              type="number"
              value={editData.flight_hours}
              onChange={(e) =>
                setEditData({ ...editData, flight_hours: e.target.value })
              }
              className="w-full h-10 px-3 rounded-lg border text-base focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
              style={inputStyle}
            />
          </div>

          {/* Firmware */}
          <div className="relative">
            <span className="absolute -top-2 left-3 px-1 text-xs"
              style={{ background: labelBg, color: labelColor }}>
              Firmware Version
            </span>
            <input
              type="text"
              value={editData.firmware_version}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  firmware_version: e.target.value,
                })
              }
              className="w-full h-10 px-3 rounded-lg border text-base focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
              style={inputStyle}
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-xs"
                style={{ background: labelBg, color: labelColor }}>
                Operation
              </span>
              <select
                value={editData.status}
                onChange={(e) =>
                  setEditData({ ...editData, status: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg border text-base focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="Active">Active</option>
                <option value="StandBy">StandBy</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-xs"
                style={{ background: labelBg, color: labelColor }}>
                Health
              </span>
              <select
                value={editData.health_status}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    health_status: e.target.value,
                  })
                }
                className="w-full h-10 px-3 rounded-lg border text-base focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                style={inputStyle}
              >
                <option value="Optimal">Optimal</option>
                <option value="Degraded">Degraded</option>
                <option value="Require Service">Require Service</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t"
               style={{ borderColor: secondaryBorderColor }}>

            {/* Cancel */}
            <button
              type="button"
              onClick={() => closeWithDelay()}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-gray-300 border 
                         transition-all duration-150 
                         hover:bg-[#2c2c2c] 
                         active:scale-95"
              style={{ borderColor: secondaryBorderColor }}
            >
              Cancel
            </button>

            {/* Save */}
            <button
              type="submit"
              disabled={saving || !isChanged}
              style={{ borderColor: secondaryBorderColor }}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm text-gray-300 
                transition-all duration-150 active:scale-95 shadow-sm 
                ${
                  isChanged
                    ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-md"
                    : "bg-red-500 text-white cursor-not-allowed opacity-50"
                }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}