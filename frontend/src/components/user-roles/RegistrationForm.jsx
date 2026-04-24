import React, { useState, useEffect } from "react";
import { FormModal, FormField, FormSelect, FormAutocomplete } from "../ui/form";
import toast from "react-hot-toast";

export default function RegistrationForm({
  form,
  setForm,
  roles,
  editUserId,
  setEditUserId,
  onSubmit,
  onCancel,
}) {
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [error, setError] = useState("");
  const [originalForm, setOriginalForm] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const API = `${API_BASE}/admin/admin-user-roles`;

  const roleOptions = roles.map((r) => ({ value: r, label: r }));

  /* ---------- FETCH STATIONS ---------- */
  useEffect(() => {
    fetch(`${API_BASE}/admin/station/get_stations.php`)
      .then((res) => res.json())
      .then((data) =>
        setStations(Array.isArray(data) ? data : data.stations || [])
      )
      .catch(() => setStations([]));
  }, []);

  /* ---------- STORE ORIGINAL DATA (EDIT MODE) ---------- */
  useEffect(() => {
    if (editUserId) {
      setOriginalForm(JSON.stringify(form));
    }
  }, [editUserId]);

  /* ---------- HANDLE CHANGE ---------- */
  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------- VALIDATIONS ---------- */
  const isValidPhone = (v) => /^[0-9]{10}$/.test(v);
  const isValidEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  /* ---------- CHECK IF FORM CHANGED ---------- */
  const isChanged =
    !editUserId || JSON.stringify(form) !== originalForm;

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    const isEdit = Boolean(editUserId);

    if (!form.fullName || !form.phone || !form.role || !form.station) {
      setError("Required fields missing");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Please enter valid Email");
      return;
    }

    if (!isValidPhone(form.phone)) {
      setError("Please enter valid number");
      return;
    }

    if (isEdit && !isChanged) {
      setError("No changes detected");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        isEdit
          ? `${API}/update_user.php`
          : `${API}/register_user.php`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEdit ? { ...form, id: editUserId } : form
          ),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Operation failed");
        return;
      }

      // ✅ SUCCESS ONLY
      toast.success(
        isEdit
          ? "User Updated Successfully"
          : "User Registered Successfully"
      );

      setForm({
        fullName: "",
        address: "",
        email: "",
        phone: "",
        designation: "",
        role: "",
        station: "",
      });

      setEditUserId(null);
      onSubmit();
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      open={true}
      onClose={onCancel}
      title={editUserId ? "Update User" : "User Registration"}
      onSubmit={handleSubmit}
      submitLabel={editUserId ? "Update User" : "Register User"}
      loadingLabel={editUserId ? "Updating..." : "Registering..."}
      loading={loading}
      disabled={editUserId && !isChanged} // ✅ disable if no change
      error={error}
      maxWidth="sm"
    >
      <FormField
        label="Full Name"
        name="fullName"
        value={form.fullName}
        onChange={handleChange}
        required
      />

      <FormField
        label="Address"
        name="address"
        value={form.address}
        onChange={handleChange}
      />

      <FormField
        label="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
        type="email"
      />

      <FormField
        label="Phone"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        required
      />

      <FormField
        label="Designation"
        name="designation"
        value={form.designation}
        onChange={handleChange}
        required
      />

      <FormSelect
        label="Role"
        name="role"
        value={form.role}
        onChange={handleChange}
        options={roleOptions}
        required
      />

      <FormAutocomplete
        label="Fire Station"
        options={stations}
        value={form.station}
        onChange={(val) => {
          setError("");
          setForm({ ...form, station: val });
        }}
      />
    </FormModal>
  );
}