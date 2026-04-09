"use client";

import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { Eye, Pencil, Trash2, Drone } from "lucide-react"; // fallback icon below

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ─── Drone icon SVG (since lucide doesn't have "Drone") ───────────────────────
function DroneIcon({ size = 28, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M5 5l2.5 2.5M19 5l-2.5 2.5M5 19l2.5-2.5M19 19l-2.5-2.5" />
      <ellipse cx="4" cy="4" rx="2" ry="1.2" transform="rotate(-45 4 4)" />
      <ellipse cx="20" cy="4" rx="2" ry="1.2" transform="rotate(45 20 4)" />
      <ellipse cx="4" cy="20" rx="2" ry="1.2" transform="rotate(45 4 20)" />
      <ellipse cx="20" cy="20" rx="2" ry="1.2" transform="rotate(-45 20 20)" />
    </svg>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {

  const s = status?.toLowerCase();

  let bg = "#6b7280"; // default grey

  if (s === "active") {
    bg = "#16a34a"; // green
  } 
  else if (s === "standby") {
    bg = "#f59e0b"; // orange
  } 
  else if (s === "maintenance") {
    bg = "#ef4444"; // red
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 14px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 500,
        backgroundColor: bg,
        color: "#ffffff",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="4"/>
      </svg>

      {status || "unknown"}

    </span>
  );
}
export default function DroneList() {
  const [drones, setDrones] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Theme detection
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // ── Styles (mirrors vehicle list) ──────────────────────────────────────────
  const bg       = isDark ? "#0a0a0a" : "#f9fafb";
  const cardBg   = isDark ? "#111111" : "#ffffff";
  const border   = isDark ? "#2E2E2E" : "#e5e7eb";
  const textMain = isDark ? "#ffffff" : "#111827";
  const textSub  = isDark ? "#9ca3af" : "#6b7280";
  const inputBg  = isDark ? "#141414" : "#ffffff";

  // ── Fetch stations ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/admin/station/get_stations.php`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.stations || [];
        setStations(list);
      })
      .catch(() => {});
  }, []);

  // ── Fetch drones ────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const url =
      selectedStation && selectedStation !== "All"
        ? `${API_BASE}/admin/admin-drone-details/getDronesByStation.php?station=${selectedStation}`
        : `${API_BASE}/admin/admin-drone-details/getAllDrones.php`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setDrones(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedStation]);


  const handleDelete = (drone) => {
    if (!window.confirm(`Delete ${drone.drone_name}?`)) return;
    fetch(`${API_BASE}/admin/admin-drone-details/deleteDrone.php`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" }, // ← change
  body: `drone_code=${drone.drone_code}`,                            // ← change
})
  .then((r) => r.json())
  .then((res) => {
    if (res.success) {  // ← "success" not "status"
      setDrones((prev) => prev.filter((d) => d.drone_code !== drone.drone_code));
    }
  });
  };

  // ── Filter by search ────────────────────────────────────────────────────────
  const filtered = drones.filter((d) => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.drone_name?.toLowerCase().includes(q) ||
      d.drone_code?.toLowerCase().includes(q) ||
      d.drone_type?.toLowerCase().includes(q)
    );
  });

  // ── Shared button style ─────────────────────────────────────────────────────
  const btnBase = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    border: `1px solid ${border}`,
  };

  return (
    <div style={{ backgroundColor: bg, minHeight: "100%", padding: "24px" }}>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: cardBg,
          border: `1px solid ${border}`,
          borderRadius: "10px",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <FiSearch
            size={15}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: textSub,
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drones..."
            style={{
              width: "100%",
              height: "36px",
              paddingLeft: "32px",
              paddingRight: "12px",
              borderRadius: "6px",
              fontSize: "13px",
              backgroundColor: inputBg,
              color: textMain,
              border: `1px solid ${border}`,
              outline: "none",
            }}
          />
        </div>

        {/* Station filter */}
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          style={{
            height: "36px",
            padding: "0 12px",
            borderRadius: "6px",
            fontSize: "13px",
            backgroundColor: inputBg,
            color: textMain,
            border: `1px solid ${border}`,
            cursor: "pointer",
            flex: "1 1 180px",
          }}
        >
          <option value="All">All Stations</option>
          {stations.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Drone cards ────────────────────────────────────────────────────── */}
      {loading ? (
        <p style={{ color: textSub, textAlign: "center", marginTop: "40px" }}>
          Loading drones...
        </p>
      ) : filtered.length === 0 ? (
        <p style={{ color: textSub, textAlign: "center", marginTop: "40px" }}>
          No drones found.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((drone) => (
            <div
              key={drone.drone_code}
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "10px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: isDark ? "#1c1c1c" : "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <DroneIcon size={26} color={textSub} />
              </div>

              {/* Name + type */}
              <div style={{ minWidth: "160px", flex: "1 1 160px" }}>
                <div style={{ color: textMain, fontWeight: 600, fontSize: "15px" }}>
                  {drone.drone_name}
                </div>
                <div style={{ color: textSub, fontSize: "13px", marginTop: "2px" }}>
                  {drone.drone_type || "—"}
                </div>
              </div>

              {/* Drone code */}
              <div style={{ flex: "1 1 150px" }}>
                <div style={{ color: textSub, fontSize: "12px", marginBottom: "2px" }}>
                  Drone Code
                </div>
                <div style={{ color: textMain, fontWeight: 600, fontSize: "14px" }}>
                  {drone.drone_code}
                </div>
                {drone.device_id && (
                  <>
                    <div style={{ color: textSub, fontSize: "12px", marginTop: "4px" }}>
                      Device ID
                    </div>
                    <div style={{ color: textMain, fontSize: "13px" }}>
                      {drone.device_id}
                    </div>
                  </>
                )}
              </div>

              {/* Station */}
              <div style={{ flex: "1 1 150px" }}>
                <div style={{ color: textSub, fontSize: "12px", marginBottom: "2px" }}>
                  Station
                </div>
                <div style={{ color: textMain, fontWeight: 600, fontSize: "14px" }}>
                  {drone.station || drone.station_name || "—"}
                </div>
              </div>

              {/* Status + actions */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "10px",
                  flexShrink: 0,
                }}
              >
                <div>
                  <div style={{ color: textSub, fontSize: "12px", marginBottom: "4px" }}>
                    Status
                  </div>
                  <StatusBadge status={drone.status} />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(drone)}
                    style={{
                      ...btnBase,
                      backgroundColor: "transparent",
                      color: "#ef4444",
                      borderColor: "#ef444440",
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}