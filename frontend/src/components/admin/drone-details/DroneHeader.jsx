import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/common/SafeIcon";
import StatusBadge from "@/components/common/StatusBadge";
import { useNavigate } from "react-router-dom";

export default function DroneHeader({ selectedDrone }) {
  const navigate = useNavigate();

  const getStatusVariant = (status) => {
    switch (status) {
      case "Active": return "active";
      case "StandBy": return "standby";
      case "Maintenance": return "maintenance";
      default: return "offline";
    }
  };

  const handleManageDrone = () => {
    navigate("/manage-drones");
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
        <Button variant="outline" className="gap-2" onClick={handleManageDrone}>
          <SafeIcon name="Settings" size={16} /> Manage Drone
        </Button>
      </div>
    </div>
  );
}