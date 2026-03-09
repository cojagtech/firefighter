import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/common/SafeIcon";
import StatusBadge from "@/components/common/StatusBadge";

export default function DroneHeader({ selectedDrone, onAddClick, onEditClick }) {
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
          <Button variant="ghost" size="icon" onClick={() => (window.location.href = "./admin-drone-monitoring.html")}>
            <SafeIcon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-3xl font-bold">{selectedDrone?.drone_name || "Select Drone"}</h1>
          <StatusBadge status={getStatusVariant(selectedDrone?.status)} label={selectedDrone?.status} />
        </div>
        <p className="text-muted-foreground ml-[50px]">Serial: {selectedDrone?.drone_code || "N/A"}</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2" onClick={onAddClick}>
          <SafeIcon name="Plus" size={16} /> Add Drone
        </Button>
        <Button variant="outline" className="gap-2" onClick={onEditClick}>
          <SafeIcon name="Edit" size={16} /> Edit Drone
        </Button>
      </div>
    </div>
  );
}