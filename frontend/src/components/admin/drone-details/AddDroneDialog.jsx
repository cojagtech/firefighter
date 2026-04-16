"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AddDroneDialog({ isOpen, onClose, stations, onSuccess }) {
  const [formData, setFormData] = useState({
    drone_code: "",
    drone_name: "",
    status: "",
    station: "",
    flight_hours: 0,
    health_status: "",
    firmware_version: "",
    is_ready: 1,
  });

  const [saving, setSaving] = useState(false);

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // ✅ Check if all required fields are filled
  const isAllFieldsFilled =
    formData.drone_code.trim() &&
    formData.drone_name.trim() &&
    formData.station &&
    formData.firmware_version.trim() &&
    formData.status &&
    formData.health_status;

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
    if (!isOpen) {
      setFormData({
        drone_code: "",
        drone_name: "",
        status: "",
        station: "",
        flight_hours: 0,
        health_status: "",
        firmware_version: "",
        is_ready: 1,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ✅ delayed close
  const closeWithDelay = (callback) => {
    setTimeout(() => {
      callback && callback();
      onClose();
    }, 200);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.drone_code.trim() ||
      !formData.drone_name.trim() ||
      !formData.station ||
      !formData.firmware_version.trim() ||
      !formData.status ||
      !formData.health_status
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    try {
      const response = await fetch(
        `${API_BASE}/admin/admin-drone-details/addDrone.php`,
        {
          method: "POST",
          credentials: "include",
          body: form,
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Drone added successfully");
        closeWithDelay(onSuccess);
      } else {
        toast.error(result.message || "Failed to add drone");
      }
    } catch (error) {
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
        className="w-full max-w-xl rounded-xl shadow-lg overflow-hidden"
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
            Add New Drone
          </h2>
          <p className="text-sm mt-1 text-gray-400">
            Register a new drone to your fleet
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6">

          <div className="mb-4 px-4 py-2 rounded-lg text-sm border"
            style={{
              background: isDark ? "#2a2a2a" : "#f9fafb",
              borderColor: secondaryBorderColor,
              color: labelColor,
            }}>
            ⚠️ All fields are required to add a drone.
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Row 1 */}
            {/* Drone Code */}
            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-xs"
                style={{ background: labelBg, color: labelColor }}>
                Drone Code *
              </span>
              <input
                type="text"
                name="drone_code"
                value={formData.drone_code}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border text-base placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                style={inputStyle}
                placeholder="e.g., DRONE-001"
              />
            </div>

            {/* Drone Name */}
            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-xs"
                style={{ background: labelBg, color: labelColor }}>
                Drone Name *
              </span>
              <input
                type="text"
                name="drone_name"
                value={formData.drone_name}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border text-base placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                style={inputStyle}
                placeholder="e.g., DJI Phantom 4"
              />
            </div>

            {/* Row 2 */}
            {/* Flight Hours */}
            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-xs"
                style={{ background: labelBg, color: labelColor }}>
                Flight Hours
              </span>
              <input
                type="number"
                name="flight_hours"
                value={formData.flight_hours}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border text-base placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                style={inputStyle}
                placeholder="0"
              />
            </div>

            {/* Firmware Version */}
            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-xs"
                style={{ background: labelBg, color: labelColor }}>
                Firmware Version *
              </span>
              <input
                type="text"
                name="firmware_version"
                value={formData.firmware_version}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border text-base placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                style={inputStyle}
                placeholder="e.g., v2.1.0"
              />
            </div>

            {/* Row 3 */}
            {/* Status */}
            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-xs"
                style={{ background: labelBg, color: labelColor }}>
                Operation *
              </span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border text-base focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                style={inputStyle}
              >
                <option value="Active">Active</option>
                <option value="StandBy">StandBy</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Health */}
            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-xs"
                style={{ background: labelBg, color: labelColor }}>
                Health *
              </span>
              <select
                name="health_status"
                value={formData.health_status}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border text-base focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                style={inputStyle}
              >
                <option value="Optimal">Optimal</option>
                <option value="Degraded">Degraded</option>
                <option value="Require Service">Require Service</option>
              </select>
            </div>

            {/* Row 4 */}
            {/* Station */}
            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-xs"
                style={{ background: labelBg, color: labelColor }}>
                Station *
              </span>
              <select
                name="station"
                value={formData.station}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border text-base focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                style={inputStyle}
              >
                <option value="" disabled>Select Station</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ready */}
            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-xs"
                style={{ background: labelBg, color: labelColor }}>
                Ready
              </span>
              <select
                name="is_ready"
                value={formData.is_ready}
                onChange={(e) =>
                  setFormData({ ...formData, is_ready: Number(e.target.value) })
                }
                className="w-full h-10 px-3 rounded-lg border text-base focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
                style={inputStyle}
              >
                <option value={1}>Yes</option>
                <option value={0}>No</option>
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

            {/* Add Drone */}
            <button
              type="submit"
              disabled={saving || !isAllFieldsFilled}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 active:scale-95 shadow-sm
                ${
                  isAllFieldsFilled && !saving
                    ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-md"
                    : "bg-red-500 text-white cursor-not-allowed opacity-50"
                }`}
            >
              {saving ? "Adding..." : "Add Drone"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
} 