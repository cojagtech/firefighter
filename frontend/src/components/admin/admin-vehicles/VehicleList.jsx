import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SafeIcon from "@/components/common/SafeIcon";
import StatusBadge from "@/components/common/StatusBadge";
import EditVehicleModal from "./EditVehicleModal";
import toast from "react-hot-toast";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/admin-vehicle`;

export default function VehicleList({
  vehicles: initialVehicles = [],
  onUpdated,
  onView,
  stations = [],
}) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [editVehicle, setEditVehicle] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmVehicle, setConfirmVehicle] = useState(null);

  useEffect(() => {
    setVehicles(Array.isArray(initialVehicles) ? initialVehicles : []);
  }, [initialVehicles]);

  const getVehicleTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "fire tender": return "Truck";
      case "ambulance": return "AlertTriangle";
      case "hydrant vehicle": return "Droplet";
      case "quick response vehicle": return "Zap";
      case "drone": return "Plane";
      case "support vehicle": return "Package";
      case "foam truck": return "Wind";
      case "ladder truck": return "Maximize2";
      default: return "Truck";
    }
  };

  const handleEditSave = async (updated) => {
    try {
      const res = await fetch(`${API}/updateVehicle.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      const data = await res.json();

      if (data?.success) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v))
        );
        onUpdated && onUpdated();
        setEditVehicle(null);
      }

      return data;
    } catch (e) {
      console.error(e);
      return { success: false, message: "Server error while updating vehicle" };
    }
  };

  const handleDeleteConfirmed = async () => {
    const vehicle = confirmVehicle;
    setConfirmVehicle(null);
    setDeletingId(vehicle.id);

    try {
      const res = await fetch(`${API}/deleteVehicle.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: vehicle.id }),
      });

      const data = await res.json();

      if (data?.success) {
        setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
        onUpdated && onUpdated();
        toast.success(data.message || "Vehicle deleted successfully");
      } else {
        toast.error(data?.message || "Failed to delete vehicle");
      }
    } catch (e) {
      console.error(e);
      toast.error("Server error while deleting vehicle");
    } finally {
      setDeletingId(null);
    }
  };

  if (!vehicles.length) {
    return (
      <Card>
        <CardContent className="p-12 text-center">No Vehicles Found</CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {vehicles.map((vehicle) => (
          <Card
            key={vehicle.id}
            className="hover:border-primary/50 transition-colors"
          >
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <SafeIcon
                      name={getVehicleTypeIcon(vehicle.type)}
                      className="text-primary"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{vehicle.name}</p>
                    <p className="text-xs text-muted-foreground">{vehicle.type}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Registration</p>
                  <p className="font-mono font-semibold">{vehicle.registration}</p>
                  <p className="text-xs text-muted-foreground mt-2">Device ID</p>
                  <p className="text-xs">{vehicle.device_id}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mt-2">Station</p>
                  <Badge className="text-xs">{vehicle.station || "—"}</Badge>
                </div>

                <div>
                  <p className="text-xs mb-1 text-muted-foreground">Status</p>
                  <StatusBadge status={vehicle.status} showIcon />

                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(vehicle)}
                      className="gap-1"
                    >
                      <SafeIcon name="Eye" size={14} />
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditVehicle(vehicle)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deletingId === vehicle.id}
                      onClick={() => setConfirmVehicle(vehicle)}
                      className="gap-1 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500"
                    >
                      <SafeIcon name="Trash2" size={14} />
                      {deletingId === vehicle.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={!!confirmVehicle}
        title="Delete Vehicle"
        description="Are you sure you want to delete"
        itemName={confirmVehicle?.name}
        itemSub={confirmVehicle?.registration}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmVehicle(null)}
      />

      {editVehicle && (
        <EditVehicleModal
          open={true}
          vehicle={editVehicle}
          onClose={() => setEditVehicle(null)}
          onUpdate={handleEditSave}
          stations={stations}
        />
      )}
    </>
  );
}