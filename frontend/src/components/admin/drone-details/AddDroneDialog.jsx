import { useState, useEffect } from "react";
import { FormModal, FormField, FormSelect, FormAutocomplete } from "../../ui/Form";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const isValidDroneCode = (v) => /^DRN-?\d+$/.test(v);

const OPERATION_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "StandBy", label: "StandBy" },
  { value: "Maintenance", label: "Maintenance" },
];

const HEALTH_OPTIONS = [
  { value: "Optimal", label: "Optimal" },
  { value: "Degraded", label: "Degraded" },
  { value: "Require Service", label: "Require Service" },
];

const READY_OPTIONS = [
  { value: "1", label: "Yes" },
  { value: "0", label: "No" },
];

const EMPTY_FORM = {
  drone_code: "",
  drone_name: "",
  status: "",
  station: "",
  flight_hours: 0,
  health_status: "",
  firmware_version: "",
  is_ready: "1",
};

export default function AddDroneDialog({ isOpen, onClose, stations, onSuccess }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFormData(EMPTY_FORM);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "flight_hours") {
    // block negative typing
    if (value < 0) return;
  }

    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: name === "drone_code" ? value.toUpperCase() : value, // optional auto uppercase
    }));
  };

  const isAllFilled =
    formData.drone_code.trim() &&
    formData.drone_name.trim() &&
    formData.station &&
    formData.firmware_version.trim() &&
    formData.status &&
    formData.health_status;

  const handleSubmit = async () => {
    if (!isAllFilled) {
      setError("Please fill all required fields");
      return;
    }

    if (!isValidDroneCode(formData.drone_code)) {
      setError("Drone code format must be (DRN001 or DRN-001)");
      return;
    }

    setSaving(true);
    setError("");

    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => form.append(k, v));

    try {
      const res = await fetch(
        `${API_BASE}/admin/admin-drone-details/addDrone.php`,
        { method: "POST", credentials: "include", body: form }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.message || "Failed to add drone");
        return;
      }

      toast.success("Drone added successfully");

      onSuccess?.();
      onClose();
    } catch {
      setError("Server error");
    } finally {
      setSaving(false);
    }
  };

  const stationNames = (stations || []).map((s) => s.name);

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Add New Drone"
      onSubmit={handleSubmit}
      submitLabel="Add Drone"
      loadingLabel="Adding..."
      loading={saving}
      disabled={!isAllFilled || !!error}
      error={error}
    >
      <FormField label="Drone Code" name="drone_code" value={formData.drone_code} onChange={handleChange} required />
      <FormField label="Drone Name" name="drone_name" value={formData.drone_name} onChange={handleChange} required />
      <FormField label="Flight Hours" name="flight_hours" value={formData.flight_hours} onChange={handleChange} type="number" min="0" step="0.1"/>
      <FormField label="Firmware Version" name="firmware_version" value={formData.firmware_version} onChange={handleChange} required />

      <FormSelect label="Operation" name="status" value={formData.status} onChange={handleChange} options={OPERATION_OPTIONS} />
      <FormSelect label="Health" name="health_status" value={formData.health_status} onChange={handleChange} options={HEALTH_OPTIONS} />

      <FormAutocomplete
        label="Station"
        options={stationNames}
        value={formData.station}
        onChange={(val) => setFormData((prev) => ({ ...prev, station: val }))}
      />

      <FormSelect label="Ready" name="is_ready" value={String(formData.is_ready)} onChange={handleChange} options={READY_OPTIONS} />
    </FormModal>
  );
}