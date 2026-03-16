import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function VehicleDetailsModal({ open, onClose, vehicle }) {
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

  if (!vehicle) return null;

  const dialogStyle = {
    backgroundColor: isDark ? "#141414" : "#ffffff",
    borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
    color: isDark ? "#ffffff" : "#000000",
    "--background": isDark ? "20 20 20" : "255 255 255",
    "--foreground": isDark ? "255 255 255" : "0 0 0",
    "--border": isDark ? "46 46 46" : "226 232 240",
    "--muted-foreground": isDark ? "161 161 170" : "100 116 139",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg border"
        style={dialogStyle}
      >
        <DialogHeader>
          <DialogTitle
            className="text-xl font-bold"
            style={{ color: isDark ? "#ffffff" : "#000000" }}
          >
            Vehicle Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <Detail label="Name" value={vehicle.name} isDark={isDark} />
          <Detail label="Type" value={vehicle.type} isDark={isDark} />
          <Detail label="Registration" value={vehicle.registration} isDark={isDark} />
          <Detail label="Device ID" value={vehicle.device_id} isDark={isDark} />
          <Detail label="Location" value={vehicle.location} isDark={isDark} />
          <Detail label="Station" value={vehicle.station} isDark={isDark} />

          <div
            className="flex justify-between items-center"
            style={{ borderBottom: `1px solid ${isDark ? "#2E2E2E" : "#e2e8f0"}`, paddingBottom: "4px" }}
          >
            <span style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>Status</span>
            <Badge variant="outline">{vehicle.status}</Badge>
          </div>

          <Detail label="Created At" value={vehicle.created_at} isDark={isDark} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value, isDark }) {
  return (
    <div
      className="flex justify-between pb-1"
      style={{ borderBottom: `1px solid ${isDark ? "#2E2E2E" : "#e2e8f0"}` }}
    >
      <span style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>{label}</span>
      <span
        className="font-medium"
        style={{ color: isDark ? "#ffffff" : "#000000" }}
      >
        {value || "-"}
      </span>
    </div>
  );
}