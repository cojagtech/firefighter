import { useState, useEffect } from "react";
import { FormModal, FormField, FormSelect } from "../../ui/Form";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const isValidDroneCode = (v) => /^DRN-?[0-9]+$/.test(v);

const isAlphaNumeric = (v) => /^[A-Za-z0-9]+$/.test(v);

const OPERATION_OPTIONS = [
  { value: "", label: "Select" },
  { value: "Active", label: "Active" },
  { value: "StandBy", label: "StandBy" },
  { value: "Maintenance", label: "Maintenance" },
];

const HEALTH_OPTIONS = [
  { value: "Optimal", label: "Optimal" },
  { value: "Degraded", label: "Degraded" },
  { value: "Require Service", label: "Require Service" },
];

const EMPTY = {
  flight_hours: "",
  health_status: "",
  firmware_version: "",
  status: "",
};

export default function EditDroneDialog({ drone, isOpen, onClose, onSuccess }) {
  const [editData, setEditData] = useState(EMPTY);
  const [initialData, setInitialData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (drone && isOpen) {
      const data = {
        flight_hours: drone.flight_hours ?? "",
        health_status: drone.health_status ?? "",
        firmware_version: drone.firmware_version ?? "",
        status: drone.status ?? "",
      };
      setEditData(data);
      setInitialData(data);
      setError("");
    }
  }, [drone, isOpen]);

  if (!isOpen) return null;

  const isChanged = JSON.stringify(editData) !== JSON.stringify(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "flight_hours") {
      if (value < 0) return;
    }

    setError("");
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!isChanged) return;

    if (!isValidDroneCode(drone.drone_code)) {
      setError("Drone code must contain letter, numbers and hypen only");
      return;
    }


    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("drone_code", drone.drone_code);
    formData.append("flight_hours", editData.flight_hours);
    formData.append("health_status", editData.health_status);
    formData.append("firmware_version", editData.firmware_version);
    formData.append("status", editData.status);

    try {
      const res = await fetch(
        `${API_BASE}/admin/admin-drone-details/updateDroneDetails.php`,
        { method: "POST", credentials: "include", body: formData }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.message || "Update failed");
        return;
      }

      // ✅ SUCCESS ONLY
      toast.success("Drone updated successfully");

      onSuccess?.();
      onClose();
    } catch {
      setError("Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title={`Edit Drone — ${drone?.drone_name || "Unknown"} | ID: ${drone?.drone_code}`}
      onSubmit={handleUpdate}
      submitLabel="Save"
      loadingLabel="Saving..."
      loading={saving}
      disabled={!isChanged || !!error}
      error={error}
      maxWidth="xs"
    >
      <div className="col-span-2 flex flex-col gap-2.5">
        <FormField label="Flight Hours" name="flight_hours" value={editData.flight_hours} onChange={handleChange} type="number" min="0" step="0.1" />
        <FormField label="Firmware Version" name="firmware_version" value={editData.firmware_version} onChange={handleChange} />
        <FormSelect label="Operation" name="status" value={editData.status} onChange={handleChange} options={OPERATION_OPTIONS} />
        <FormSelect label="Health" name="health_status" value={editData.health_status} onChange={handleChange} options={HEALTH_OPTIONS} />
      </div>
    </FormModal>
  );
}