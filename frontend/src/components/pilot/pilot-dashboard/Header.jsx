import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/common/SafeIcon";
import StatusBadge from "@/components/common/StatusBadge";

export default function Header({ selectedDrone }) {
  const getStatusVariant = (status) => {
    switch (status) {
      case "Active": return "active";
      case "StandBy": return "standby";
      case "Maintenance": return "maintenance";
      default: return "offline";
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              (window.location.href = "./admin-drone-monitoring.html")
            }
          >
            <SafeIcon name="ArrowLeft" size={20} />
          </Button>

          <h1 className="text-3xl font-bold">
            {selectedDrone?.drone_name || "Select Drone"}
          </h1>

          {selectedDrone && (
            <StatusBadge
              status={getStatusVariant(selectedDrone.status)}
              label={selectedDrone.status}
            />
          )}
        </div>

        <p className="text-muted-foreground ml-[50px]">
          Serial: {selectedDrone?.drone_code || "N/A"}
        </p>
      </div>
    </div>
  );
}