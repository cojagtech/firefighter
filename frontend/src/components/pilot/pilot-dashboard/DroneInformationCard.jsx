import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/common/StatusBadge";

const getStatusVariant = (status) => {
    switch (status) {
      case "Active": return "active";
      case "StandBy": return "standby";
      case "Maintenance": return "maintenance";
      default: return "offline";
    }
  };
  
export default function DroneInformationCard({ selectedDrone }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Drone Information</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Serial</span>
          <span className="font-medium">
            {selectedDrone?.drone_code || "N/A"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Station</span>
          <span className="font-medium">
            {selectedDrone?.station || "N/A"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Firmware</span>
          <span className="font-medium">
            {selectedDrone?.firmware_version || "N/A"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Current Status</span>
          <StatusBadge
            status={getStatusVariant(selectedDrone?.status)}
            label={selectedDrone?.status}
            showIcon={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}