import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";

const isAlphaSpace = (v) => /^[A-Za-z\s]*$/.test(v);
const isAlphaNumeric = (v) => /^[A-Za-z0-9\-]*$/.test(v);

export default function AddVehicleModal({
  open,
  onClose,
  onSubmit,
  stations = [],
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    registrationNumber: "",
    deviceId: "",
    location: "",
    station: "",
    status: "available",
  });

  // Theme observer
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const resetForm = () => {
    setError("");
    setFormData({
      name: "",
      type: "",
      registrationNumber: "",
      deviceId: "",
      location: "",
      station: "",
      status: "available",
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
    if (
      (name === "registrationNumber" || name === "deviceId") &&
      !isAlphaNumeric(value)
    ) {
      setError("Registration & Device ID must be alphanumeric");
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
    setSaving(true);
    try {
      const res = await onSubmit(formData);
      if (!res?.success) {
        setError(res?.message || "Failed to add vehicle");
        return;
      }
      toast.success(res.message || "Vehicle added successfully");
      resetForm();
      onClose();
    } catch {
      setError("Server error");
    } finally {
      setSaving(false);
    }
  };

  // Theme-aware MUI styles
  const inputBg = isDark ? "#151619" : "#ffffff";
  const inputColor = isDark ? "#e3e3e3" : "#111827";
  const borderColor = isDark ? "#2a2b2e" : "#e2e8f0";
  const labelColor = isDark ? "#9ea2a7" : "#6b7280";
  const iconColor = isDark ? "#9ea2a7" : "#6b7280";

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      background: inputBg,
      color: inputColor,
      borderRadius: "10px",
      "& fieldset": { borderColor: borderColor },
      "&:hover fieldset": { borderColor: "#ef4444" },
      "&.Mui-focused fieldset": {
        borderColor: "#ef4444",
        boxShadow: "0 0 6px rgba(239,68,68,.6)",
      },
    },
    "& label": { color: labelColor },
    "& label.Mui-focused": { color: "#ef4444" },
    "& .MuiSvgIcon-root": { color: iconColor },
    "& .MuiInputBase-input": { color: inputColor },
  };

  const dropdownPaperStyle = {
    background: isDark ? "#1a1b1f" : "#ffffff",
    color: isDark ? "#ffffff" : "#000000",
    border: `1px solid ${isDark ? "#2a2b2e" : "#e2e8f0"}`,
    "& .MuiMenuItem-root": {
      "&:hover": {
        background: isDark ? "#2a2b2e" : "#f3f4f6",
      },
      "&.Mui-selected": {
        background: isDark ? "#2a2b2e" : "#f3f4f6",
      },
    },
  };

  const stationOptions = Array.isArray(stations) ? stations : [];

  return (
    <Dialog
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          background: isDark ? "#111214" : "#ffffff",
          border: `1px solid ${isDark ? "#1d1e21" : "#e2e8f0"}`,
          color: isDark ? "#e5e7eb" : "#111827",
          borderRadius: "14px",
          boxShadow: isDark
            ? "0 0 18px rgba(0,0,0,.6)"
            : "0 0 18px rgba(0,0,0,.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: isDark ? "#ffffff" : "#000000",
          fontWeight: 600,
          borderBottom: `1px solid ${isDark ? "#25262a" : "#e2e8f0"}`,
        }}
      >
        Add New Vehicle
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {error && (
          <div className="mb-3 text-lg text-red-500 font-medium">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <TextField
            label="Vehicle Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={inputStyle}
            fullWidth
          />

          <TextField
            label="Vehicle Type *"
            name="type"
            value={formData.type}
            onChange={handleChange}
            sx={inputStyle}
            fullWidth
          />

          <TextField
            label="Registration No. *"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            sx={inputStyle}
            fullWidth
          />

          <TextField
            label="VTS Device ID *"
            name="deviceId"
            value={formData.deviceId}
            onChange={handleChange}
            sx={inputStyle}
            fullWidth
          />

          <Autocomplete
            options={stationOptions}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option.name
            }
            value={
              stationOptions.find(
                (st) =>
                  (typeof st === "string" ? st : st.name) === formData.station
              ) || null
            }
            onChange={(event, newValue) => {
              const selected =
                typeof newValue === "string" ? newValue : newValue?.name || "";
              setFormData((prev) => ({ ...prev, station: selected }));
            }}
            ListboxProps={{
              sx: {
                maxHeight: 48 * 3,
                background: isDark ? "#1a1b1f" : "#ffffff",
                color: isDark ? "#ffffff" : "#000000",
                "& .MuiAutocomplete-option": {
                  "&:hover": {
                    background: isDark ? "#2a2b2e" : "#f3f4f6",
                  },
                  "&.Mui-focused": {
                    background: isDark ? "#2a2b2e" : "#f3f4f6",
                  },
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Station *"
                placeholder="Type to search..."
                sx={inputStyle}
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: iconColor }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            sx={inputStyle}
            fullWidth
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: dropdownPaperStyle,
                },
              },
            }}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="busy">Busy</MenuItem>
            <MenuItem value="on-mission">On Mission</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
          </TextField>
        </div>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${isDark ? "#25262a" : "#e2e8f0"}`,
        }}
      >
        <Button
          onClick={() => {
            resetForm();
            onClose();
          }}
          sx={{ color: isDark ? "#9ea2a7" : "#6b7280" }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving || !!error}
          variant="contained"
          sx={{
            background: "#ef4444",
            color: "#ffffff",
            "&:hover": { background: "#dc2626" },
            "&.Mui-disabled": {
              background: isDark ? "#444" : "#e5e7eb",
              color: isDark ? "#777" : "#9ca3af",
            },
          }}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}