"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AddDroneDialog({ isOpen, onClose, stations, onSuccess }) {
  const [formData, setFormData] = useState({
    drone_code: "",
    drone_name: "",
    status: "standby",
    station: "",
    flight_hours: 0,
    health_status: "Optimal",
    firmware_version: "",
    is_ready: 1,
  });

  const [statusOpen, setStatusOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const statusRef = useRef(null);
  const healthRef = useRef(null);

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
    const handleClickOutside = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
      if (healthRef.current && !healthRef.current.contains(e.target)) {
        setHealthOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        drone_code: "",
        drone_name: "",
        status: "standby",
        station: "",
        flight_hours: 0,
        health_status: "Optimal",
        firmware_version: "",
        is_ready: 1,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "flight_hours") {
      const num = Number(value);
      if (num > 100) {
        toast.error("Flight hours cannot exceed 100");
        return;
      }
    }

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
      !formData.firmware_version.trim()
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
        onClose();
        onSuccess && onSuccess();
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
    backgroundColor: isDark ? "#141414" : "#ffffff",
    color: isDark ? "#ffffff" : "#000000",
    borderColor: isDark ? "#2E2E2E" : "#e5e7eb",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm ">
      <div
        className="w-full max-w-lg rounded-lg p-5 mt-[40px]"
        style={{
          backgroundColor: isDark ? "#1d1f22" : "#ffffff",
          color: isDark ? "#FAFAFA" : "#000000",
        }}
      >
        <h2 className="text-lg text-[#dc2626] font-semibold mb-4">Add New Drone</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          {/* Drone Code */}
          <div>
            <label className="text-sm mb-1 block">Drone Code</label>
            <input
              name="drone_code"
              value={formData.drone_code}
              onChange={handleChange}
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            />
          </div>

          {/* Drone Name */}
          <div>
            <label className="text-sm mb-1 block">Drone Name</label>
            <input
              name="drone_name"
              value={formData.drone_name}
              onChange={handleChange}
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            />
          </div>

          {/* Flight Hours */}
          <div>
            <label className="text-sm mb-1 block">Flight Hours</label>
            <input
              type="number"
              name="flight_hours"
              value={formData.flight_hours}
              onChange={handleChange}
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            />
          </div>

          {/* Firmware */}
          <div>
            <label className="text-sm mb-1 block">Firmware Version</label>
            <input
              name="firmware_version"
              value={formData.firmware_version}
              onChange={handleChange}
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm mb-1 block">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
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
              name="health_status"
              value={formData.health_status}
              onChange={handleChange}
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            >
              <option value="Optimal">Optimal</option>
              <option value="Degraded">Degraded</option>
              <option value="Require Service">Require Service</option>
            </select>
          </div>

          {/* Ready */}
          <div>
            <label className="text-sm mb-1 block">Ready</label>
            <select
              name="is_ready"
              value={formData.is_ready}
              onChange={(e) =>
                setFormData({ ...formData, is_ready: Number(e.target.value) })
              }
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>

          {/* Station */}
          <div className="col-span-2">
            <label className="text-sm mb-1 block">Station</label>
            <select
              name="station"
              value={formData.station}
              onChange={handleChange}
              style={inputStyle}
              className="h-9 px-2.5 rounded border w-full text-sm"
            >
              <option value="">Select Station</option>
              {stations.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex gap-3 mt-4">
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
              {saving ? "Adding..." : "Add Drone"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}