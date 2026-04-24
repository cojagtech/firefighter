import React, { useEffect, useState } from "react";
import { FormModal, FormField, FormSelect, FormAutocomplete } from "../../ui/Form";
import toast from "react-hot-toast";

const DEVICE_PREFIX = "VTS-";

const isAlphaSpace = (v) => /^[A-Za-z\s]*$/.test(v);

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "on-mission", label: "On Mission" },
  { value: "maintenance", label: "Maintenance" },
];

export default function AddVehicleModal({ open, onClose, onSubmit, stations = [] }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    registrationNumber: "",
    deviceId: DEVICE_PREFIX,
    location: "",
    station: "",
    status: "",
  });

  const resetForm = () => {
    setError("");
    setFormData({
      name: "",
      type: "",
      registrationNumber: "",
      deviceId: DEVICE_PREFIX,
      location: "",
      station: "",
      status: "",
    });
  };

  useEffect(() => {
    if (open) resetForm();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === "name" || name === "type") && !isAlphaSpace(value)) {
      setError("Vehicle Name & Type must contain only letters");
      return;
    }

    if (name === "registrationNumber") {
      const upper = value.toUpperCase();

      if (!/^[A-Z0-9\-]*$/.test(upper)) {
        setError("Only letters, numbers and '-' allowed");
        return;
      }

      setError("");
      setFormData((prev) => ({ ...prev, registrationNumber: upper }));
      return;
    }

    if (name === "deviceId") {
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

      setError("");
      setFormData((prev) => ({
        ...prev,
        deviceId: DEVICE_PREFIX + suffix,
      }));
      return;
    }

    setError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (saving) return;

    const { name, type, registrationNumber, deviceId, station } = formData;

    if (!name || !type || !registrationNumber || !deviceId || !station) {
      setError("Please fill all required fields");
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9\-]+$/.test(registrationNumber)) {
      setError("Registration must contain letters and numbers");
      return;
    }

    const suffix = deviceId.replace(DEVICE_PREFIX, "");

    if (!suffix) {
      setError("Device ID cannot be empty");
      return;
    }

    if (!/^(?=.*[0-9])[A-Z0-9\-]+$/.test(suffix)) {
      setError("Device ID must contain at least one number");
      return;
    }

    setSaving(true);

    try {
      const res = await onSubmit(formData);

      if (!res?.success) {
        setError(res?.message || "Failed to add vehicle");
        return;
      }

      toast.success("Vehicle added successfully");

      resetForm();
      onClose();
    } catch {
      setError("Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Add New Vehicle"
      onSubmit={handleSave}
      submitLabel="Save"
      loadingLabel="Saving..."
      loading={saving}
      disabled={saving}
      error={error}
    >
      <FormField label="Vehicle Name" name="name" value={formData.name} onChange={handleChange} required />
      <FormField label="Vehicle Type" name="type" value={formData.type} onChange={handleChange} required />
      <FormField label="Registration No." name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required />

      <FormField
        label="VTS Device ID"
        name="deviceId"
        value={formData.deviceId}
        onChange={handleChange}
        required
      />

      <FormAutocomplete
        label="Station"
        options={Array.isArray(stations) ? stations : []}
        value={formData.station}
        onChange={(val) =>
          setFormData((prev) => ({
            ...prev,
            station: typeof val === "string" ? val : val?.name || "",
          }))
        }
        required
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