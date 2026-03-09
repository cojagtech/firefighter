import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const API = `${import.meta.env.VITE_API_BASE_URL}/admin/admin-drone-details`;

export default function EditDroneDialog({ open, onOpenChange, drone, onSuccess }) {
  const [editData, setEditData] = useState({
    flight_hours: "",
    health_status: "",
    firmware_version: "",
    status: "",
  });

  const inputClass = "w-full mt-1 h-9 rounded-md bg-[#0D0F12] border border-[#2E2E2E] px-3 text-sm " +
  "hover:border-[#dc2626] focus:outline-none focus:ring-0 focus:border-[#dc2626]";

  useEffect(() => {
    if (drone) {
      setEditData({
        flight_hours: drone.flight_hours ?? "",
        health_status: drone.health_status ?? "",
        firmware_version: drone.firmware_version ?? "",
        status: drone.status ?? "",
      });
    }
  }, [drone, open]);

  const handleUpdate = () => {
    const formData = new FormData();
    formData.append("drone_code", drone.drone_code);
    formData.append("flight_hours", editData.flight_hours);
    formData.append("health_status", editData.health_status);
    formData.append("firmware_version", editData.firmware_version);
    formData.append("status", editData.status);

    fetch(`${API}/updateDroneDetails.php`, {
      method: "POST",
      credentials: "include", 
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Drone updated successfully");
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error("Update failed");
        }
      })
      .catch(() => toast.error("Server error"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#0D0F12] border border-[#2E2E2E] text-[#FAFAFA]">
        <DialogHeader><DialogTitle>Edit Drone: {drone?.drone_name}</DialogTitle></DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm text-muted-foreground">Flight Hours</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={editData.flight_hours}
              onChange={(e) =>
                setEditData({ ...editData, flight_hours: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Health</label>
            <select
              value={editData.health_status}
              onChange={(e) =>
                setEditData({ ...editData, health_status: e.target.value })
              }
              className={inputClass}
            >
              <option value="Optimal">Optimal</option>
              <option value="Degraded">Degraded</option>
              <option value="Requires Service">Require Service</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Firmware Version</label>
            <input
              type="text"
              value={editData.firmware_version}
              onChange={(e) =>
                setEditData({ ...editData, firmware_version: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Status</label>
            <select
              value={editData.status}
              onChange={(e) =>
                setEditData({ ...editData, status: e.target.value })
              }
              className={inputClass}
            >
              <option value="Active">Active</option>
              <option value="StandBy">StandBy</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>


        <Button className="w-full bg-[#dc2626] hover:bg-[#b81f1f]" onClick={handleUpdate}>
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );

  function InputField({ label, value, onChange, type = "text", step }) {
    return (
      <div>
        <label className="text-sm text-muted-foreground">{label}</label>
        <input
          type={type}
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 h-9 rounded-md bg-[#0D0F12] border border-[#2E2E2E]
          px-3 hover:border-[#dc2626] focus:outline-none focus:border-[#dc2626]"
        />
      </div>
    );
  }

}