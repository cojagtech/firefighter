import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SafeIcon from "@/components/common/SafeIcon";
import { Button } from "@/components/ui/button";


export default function MaintenanceTab({ selectedDrone }) {
  const getHealthStatusColor = (status) => status === "Optimal" ? "text-emerald-500" : status === "Require Service" ? "text-amber-500": "text-red-500" ;
  const getHealthStatusBg = (status) => {
    switch (status) {
      case "Optimal":
        return "bg-emerald-500/10";
      case "Degraded":
        return "bg-red-500/20";
      case "Require Service":
        return "bg-amber-500/10";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Maintenance History</CardTitle>
          <CardDescription>
            Service records and maintenance logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`bg-muted p-4 rounded-lg flex justify-between items-center ${getHealthStatusBg(selectedDrone?.health_status)}`}>
            <div><p className="font-medium">Health Status</p><p className={getHealthStatusColor(selectedDrone?.health_status)}>{selectedDrone?.health_status}</p></div>
            <SafeIcon name={selectedDrone?.health_status === "Optimal" ? "CheckCircle2" : selectedDrone?.health_status === "Require Service" ? "AlertTriangle" : "X"} size={24} className={getHealthStatusColor(selectedDrone?.health_status)} />
          </div>

          <Info
            label="Total Flight Hours"
            value={`${Number(selectedDrone?.flight_hours).toFixed(1)} hours`}
          />

          <Info label="Next Service Due" value="2025-12-15" />

          <Button variant="outline" className="w-full gap-2">
            <SafeIcon name="Wrench" size={16} />
            Schedule Maintenance
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: "Battery Replacement", date: "2025-11-01" },
            { title: "Sensor Calibration", date: "2025-10-15" },
            { title: "Propeller Inspection", date: "2025-09-20" },
          ].map((rec, idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b last:border-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <SafeIcon name="Wrench" size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{rec.title}</p>
                <p className="text-xs text-muted-foreground">{rec.date}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  function Info({ label, value, isSmall }) {
    return (
      <div className="flex justify-between">
        <span className={`text-muted-foreground ${isSmall ? "text-sm" : ""}`}>
          {label}
        </span>
        <span className={`font-medium ${isSmall ? "text-sm" : ""}`}>{value}</span>
      </div>
    );
  }
}               