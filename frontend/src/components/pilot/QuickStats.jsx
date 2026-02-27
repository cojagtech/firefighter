import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuickStats({ selectedDrone }) {
  const getHealthStatusColor = (status) => {
    switch (status) {
      case "Optimal": return "text-emerald-500";
      case "Degraded": return "text-amber-500";
      case "Requires Service": return "text-orange-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Flight Hours</CardTitle></CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{selectedDrone?.flight_hours != null  ? Number(selectedDrone.flight_hours).toFixed(1) + "h" : "-"}</div>
          <p className="text-xs text-muted-foreground">Total operational time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Health Status</CardTitle></CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getHealthStatusColor(selectedDrone?.health_status)}`}>
            {selectedDrone?.health_status === "Optimal" ? "✓" : "⚠"}
          </div>
          <p className="text-xs text-muted-foreground">{selectedDrone?.health_status ?? "-"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Firmware</CardTitle></CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{selectedDrone?.firmware_version ?? "-"}</div>
          <p className="text-xs text-muted-foreground">Latest available</p>
        </CardContent>
      </Card>
    </div>
  );
}