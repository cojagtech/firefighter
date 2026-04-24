import React, { useState, useEffect, useRef } from "react";
import { FormModal, FormField, FormSelect, FormAutocomplete } from "../../ui/form";
import toast from "react-hot-toast";

const DEVICE_PREFIX = "VTS-";

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "on-mission", label: "On Mission" },
  { value: "maintenance", label: "Maintenance" },
];

export default function EditVehicleModal({
  open,
  onClose,
  vehicle,
  onUpdate,
  stations = []
}) {
  const [formData, setFormData] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState("");
  const originalRef = useRef(null);

  useEffect(() => {
    if (!vehicle) return;

    const safe = {
      ...vehicle,
      device_id: vehicle.device_id || DEVICE_PREFIX,
      station: vehicle.station || "",
    };

    setFormData(safe);
    setInitialData(safe);
    originalRef.current = JSON.stringify(safe);
    setIsDirty(false);
    setError("");
  }, [vehicle]);

  if (!formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");

    // ✅ DEVICE ID LOGIC
    if (name === "device_id") {
      let val = value.toUpperCase();

      if (!val.startsWith(DEVICE_PREFIX)) {
        val = DEVICE_PREFIX + val.replace(DEVICE_PREFIX, "");
      }

      if (val.length < DEVICE_PREFIX.length) {
        val = DEVICE_PREFIX;
      }

      const suffix = val.slice(DEVICE_PREFIX.length);

      if (!/^[A-Z0-9\-]*$/.test(suffix)) {
        setError("Only letters, numbers and '-' allowed");
        return;
      }

      const updated = {
        ...formData,
        device_id: DEVICE_PREFIX + suffix,
      };

      setFormData(updated);
      setIsDirty(JSON.stringify(updated) !== originalRef.current);
      return;
    }

    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setIsDirty(JSON.stringify(updated) !== originalRef.current);
  };

  const saveChanges = async () => {
    if (!isDirty) return;

    const suffix = formData.device_id.replace(DEVICE_PREFIX, "");

    if (!suffix) {
      setError("Device ID cannot be empty");
      return;
    }

    if (!/^(?=.*[0-9])[A-Z0-9\-]+$/.test(suffix)) {
      setError("Device ID must contain at least one number");
      return;
    }

    try {
      const res = await onUpdate(formData);

      if (!res?.success) {
        setError(res?.message || "Vehicle update failed");
        return;
      }

      toast.success("Vehicle updated successfully");
      onClose();
    } catch {
      setError("Server error");
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={`Edit Vehicle | ${formData.name}`}
      onSubmit={saveChanges}
      submitLabel="Update"
      loadingLabel="Updating..."
      disabled={!isDirty || !!error}
      error={error}
    >
      <FormField
        label="Vehicle Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />

      <FormField
        label="Type"
        name="type"
        value={formData.type}
        onChange={handleChange}
      />

      <FormField
        label="Registration No"
        name="registration"
        value={formData.registration}
        disabled
      />

      <FormField
        label="Device ID"
        name="device_id"
        value={formData.device_id}
        disabled
      />

      <FormAutocomplete
        label="Search Station"
        options={Array.isArray(stations) ? stations : []}
        value={formData.station}
        onChange={(val) => {
          setError("");
          const updated = { ...formData, station: val };
          setFormData(updated);
          setIsDirty(JSON.stringify(updated) !== originalRef.current);
        }}
      />

      <FormSelect
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={STATUS_OPTIONS}
      />
    </FormModal>
  );
}