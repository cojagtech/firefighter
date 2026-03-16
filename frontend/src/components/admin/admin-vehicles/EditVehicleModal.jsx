import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Autocomplete,
} from "@mui/material";

export default function EditVehicleModal({
  open,
  onClose,
  vehicle,
  onUpdate,
  stations = [],
}) {
  const [formData, setFormData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState("");

  const originalRef = useRef(null);

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

  useEffect(() => {
    if (!vehicle) return;
    const safeVehicle = { ...vehicle, station: vehicle.station || "" };
    setFormData(safeVehicle);
    originalRef.current = JSON.stringify(safeVehicle);
    setIsDirty(false);
    setError("");
  }, [vehicle]);

  if (!formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setError("");
    setIsDirty(JSON.stringify(updated) !== originalRef.current);
  };

  const saveChanges = async () => {
    if (!isDirty) return;
    const res = await onUpdate(formData);
    if (!res?.success) {
      setError(res?.message || "Update failed");
      return;
    }
    onClose();
  };

  // Theme-aware MUI styles
  const inputBg = isDark ? "#151619" : "#ffffff";
  const inputColor = isDark ? "#e3e3e3" : "#111827";
  const borderColor = isDark ? "#2a2b2e" : "#e2e8f0";
  const labelColor = isDark ? "#9ea2a7" : "#6b7280";
  const disabledBg = isDark ? "#101114" : "#f3f4f6";
  const disabledColor = isDark ? "#777" : "#9ca3af";

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
      "&.Mui-disabled": {
        background: disabledBg,
        color: disabledColor,
      },
    },
    "& label": { color: labelColor },
    "& label.Mui-focused": { color: "#ef4444" },
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: disabledColor,
    },
  };

  const stationOptions = Array.isArray(stations) ? stations : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          background: isDark ? "#111214" : "#ffffff",
          color: isDark ? "#ffffff" : "#000000",
          borderRadius: "14px",
          border: `1px solid ${isDark ? "#1d1e21" : "#e2e8f0"}`,
          boxShadow: isDark
            ? "0 0 18px rgba(0,0,0,.6)"
            : "0 0 18px rgba(0,0,0,.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${isDark ? "#25262a" : "#e2e8f0"}`,
          pb: 2,
          fontWeight: 600,
          color: isDark ? "#ffffff" : "#000000",
        }}
      >
        ✏ Edit Vehicle -{" "}
        <span style={{ color: "#ef4444" }}>{formData.name}</span>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {error && (
          <div
            style={{
              marginBottom: "14px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.6)",
              color: "#ef4444",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <TextField
            label="Vehicle Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={inputStyle}
            fullWidth
          />

          <TextField
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            sx={inputStyle}
            fullWidth
          />

          <TextField
            label="Registration No"
            name="registration"
            value={formData.registration}
            sx={inputStyle}
            fullWidth
            disabled
          />

          <TextField
            label="Device ID"
            name="device_id"
            value={formData.device_id}
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
              const updated = { ...formData, station: selected };
              setFormData(updated);
              setIsDirty(JSON.stringify(updated) !== originalRef.current);
            }}
            disableClearable
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
                label="Search Station"
                placeholder="Type to search..."
                sx={inputStyle}
                fullWidth
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
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    background: isDark ? "#1a1b1f" : "#ffffff",
                    color: isDark ? "#ffffff" : "#000000",
                    border: `1px solid ${isDark ? "#2a2b2e" : "#e2e8f0"}`,
                    "& .MuiMenuItem-root": {
                      "&:hover": {
                        background: isDark ? "#2a2b2e" : "#f3f4f6",
                      },
                    },
                  },
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
          borderTop: `1px solid ${isDark ? "#25262a" : "#e2e8f0"}`,
          p: 2,
        }}
      >
        <Button
          onClick={onClose}
          sx={{ color: isDark ? "#a1a1a1" : "#6b7280" }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={saveChanges}
          disabled={!isDirty}
          sx={{
            background: isDirty ? "#ef4444" : isDark ? "#444" : "#e5e7eb",
            color: isDirty ? "#ffffff" : isDark ? "#ffffff" : "#9ca3af",
            px: 4,
            cursor: isDirty ? "pointer" : "not-allowed",
            "&:hover": {
              background: isDirty ? "#dc2626" : isDark ? "#444" : "#e5e7eb",
            },
          }}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}