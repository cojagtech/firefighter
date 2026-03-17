import { useState, useEffect } from "react";

export default function StationCard({ station, onViewMap, onEditStation }) {
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

  return (
    <div
      className="rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-red-500/40 transition"
      style={{
        backgroundColor: isDark ? "#111418" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
      }}
    >
      {/* Left - Station Info */}
      <div className="space-y-2">
        <h2
          className="text-xl font-semibold"
          style={{ color: isDark ? "#ffffff" : "#000000" }}
        >
          {station.name}
        </h2>
        <p
          className="text-sm"
          style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}
        >
          Station Code: {station.code}
        </p>
        <div
          className="flex gap-4 text-sm"
          style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}
        >
          <p>Lat: {station.lat}</p>
          <p>Lng: {station.lng}</p>
        </div>
      </div>

      {/* Middle - Badge */}
      <div className="flex items-center">
        <div className="bg-red-600/10 text-red-400 px-4 py-2 rounded-lg text-sm border border-red-600/20">
          Fire Station • Pune Zone
        </div>
      </div>

      {/* Right - Status + Actions */}
      <div className="flex flex-col items-end gap-3">
        <span className="px-3 py-1 rounded-full text-sm bg-green-600/20 text-green-400">
          Active
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => onViewMap && onViewMap(station)}
            style={{
              border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "#e2e8f0"}`,
              color: isDark ? "#ffffff" : "#000000",
              backgroundColor: "transparent",
            }}
            className="px-4 py-2 rounded-lg hover:bg-red-600 hover:!text-white hover:!border-red-600 transition"
          >
            View on Map
          </button>

          <button
            onClick={() => onEditStation && onEditStation(station)}
            style={{
              border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "#e2e8f0"}`,
              color: isDark ? "#ffffff" : "#000000",
              backgroundColor: "transparent",
            }}
            className="px-4 py-2 rounded-lg hover:bg-red-600 hover:!text-white hover:!border-red-600 transition"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}