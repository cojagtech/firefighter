import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/common/SafeIcon";

export default function StationCard({ station, onViewMap, onEditStation, onDeleteStation }) {
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
        <h2 className="text-xl font-semibold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
          {station.name}
        </h2>
        <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}>
          Station Code: {station.code}
        </p>
        <div className="flex gap-4 text-sm" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}>
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
          <Button
            onClick={() => onViewMap && onViewMap(station)}
            variant="edit"
            size="sm"
            className={isDark
              ? "border-[#14532D] text-[#4ADE80] hover:bg-[#052E16]"
              : "border-[#BBF7D0] text-[#16A34A] hover:bg-[#F0FDF4]"
            }
          >
            <SafeIcon name="Eye" size={14} />
            View on Map
          </Button>

          <Button
            variant="edit"
            size="sm"
            onClick={() => onEditStation && onEditStation(station)}
            className={isDark
              ? "border-[#1D4ED8] text-[#60A5FA] hover:bg-[#1E293B]"
              : "border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]"
            }
          >
            <SafeIcon name="Pencil" size={14} />
            Edit
          </Button>

          <Button
            variant="delete"
            size="sm"
            onClick={() => onDeleteStation && onDeleteStation(station)}
            className={isDark
              ? "border-[#7F1D1D] text-[#F87171] hover:bg-[#2A0E0E]"
              : "border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2]"
            }
          >
            <SafeIcon name="Trash2" size={14} />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}