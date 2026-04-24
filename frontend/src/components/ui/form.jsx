/**
 * FormModal — Reusable modal form component
 *
 * Matches the exact styling of AddVehicleModal (MUI + Tailwind + dark-mode aware).
 *
 * Props:
 *  open          {boolean}   – controls Dialog visibility
 *  onClose       {function}  – called when Cancel / backdrop is clicked
 *  title         {string}    – dialog header text
 *  onSubmit      {function}  – called when the primary action button is clicked
 *  submitLabel   {string}    – label for the primary button (default "Save")
 *  loadingLabel  {string}    – label while submitting (default "Saving...")
 *  loading       {boolean}   – disables the submit button and shows loadingLabel
 *  disabled      {boolean}   – extra condition to disable the submit button
 *  error         {string}    – red error banner shown at the top of the content
 *  children      {ReactNode} – your grid of FormField / FormSelect / FormAutocomplete inputs
 *  maxWidth      {string}    – MUI Dialog maxWidth (default "sm")
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@/components/ui/button";


/* ─────────────────────────────────────────────
   Hook: watches the <html> element for dark-mode
   ───────────────────────────────────────────── */
function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/* ─────────────────────────────────────────────
   Theme token builder — call once per render
   ───────────────────────────────────────────── */
export function useFormModalTheme() {
  const isDark = useDarkMode();
  return {
    isDark,
    inputBg:       isDark ? "#151619" : "#ffffff",
    inputColor:    isDark ? "#e3e3e3" : "#111827",
    borderColor:   isDark ? "#2a2b2e" : "#e2e8f0",
    labelColor:    isDark ? "#9ea2a7" : "#6b7280",
    iconColor:     isDark ? "#9ea2a7" : "#6b7280",
    disabledBg:    isDark ? "#101114" : "#f3f4f6",
    disabledColor: isDark ? "#777"    : "#9ca3af",
  };
}

/* ─────────────────────────────────────────────
   Shared MUI sx builders
   ───────────────────────────────────────────── */
export function buildInputSx({ inputBg, inputColor, borderColor, labelColor, disabledBg, disabledColor }) {
  return {
    "& .MuiOutlinedInput-root": {
      background: inputBg,
      color: inputColor,
      borderRadius: "10px",
      "& fieldset": { borderColor },
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
    "& .MuiSvgIcon-root": { color: labelColor },
    "& .MuiInputBase-input": { color: inputColor },
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: disabledColor,
    },
  };
}

export function buildDropdownSx(isDark, borderColor) {
  return {
    background: isDark ? "#1a1b1f" : "#ffffff",
    color: isDark ? "#ffffff" : "#000000",
    border: `1px solid ${isDark ? "#2a2b2e" : borderColor}`,
    "& .MuiMenuItem-root": {
      "&:hover":     { background: isDark ? "#2a2b2e" : "#f3f4f6" },
      "&.Mui-selected": { background: isDark ? "#2a2b2e" : "#f3f4f6" },
    },
  };
}

export function buildListboxSx(isDark) {
  return {
    maxHeight: 48 * 3,
    background: isDark ? "#1a1b1f" : "#ffffff",
    color: isDark ? "#ffffff" : "#000000",
    "& .MuiAutocomplete-option": {
      "&:hover":     { background: isDark ? "#2a2b2e" : "#f3f4f6" },
      "&.Mui-focused": { background: isDark ? "#2a2b2e" : "#f3f4f6" },
    },
  };
}

/* ═══════════════════════════════════════════════
   1. FORMMODAL — wrapper dialog
   ═══════════════════════════════════════════════ */
export function FormModal({
  open,
  onClose,
  title,
  onSubmit,
  submitLabel   = "Save",
  loadingLabel  = "Saving...",
  loading       = false,
  disabled      = false,
  error         = "",
  children,
  maxWidth      = "sm",
}) {
  const { isDark, borderColor } = useFormModalTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          background:   isDark ? "#111214" : "#ffffff",
          border:       `1px solid ${isDark ? "#1d1e21" : "#e2e8f0"}`,
          color:        isDark ? "#e5e7eb" : "#111827",
          borderRadius: "14px",
          boxShadow:    isDark
            ? "0 0 18px rgba(0,0,0,.6)"
            : "0 0 18px rgba(0,0,0,.1)",
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          color:        isDark ? "#ffffff" : "#000000",
          fontWeight:   600,
          borderBottom: `1px solid ${isDark ? "#25262a" : "#e2e8f0"}`,
        }}
      >
        {title}
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent sx={{ py: 2 }}>
        {error && (
          <div className="mb-3 text-sm text-red-500 font-medium p-2">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {children}
        </div>
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          gap: 1,
          borderTop: `1px solid ${isDark ? "#25262a" : "#e2e8f0"}`,
        }}
      >
        {/* Cancel */}
        <Button
            onClick={onClose}
            className="gap-2 border border-[#2E2E2E] hover:bg-[#2c2c2c] active:scale-95"
            style={{
              borderColor:  isDark ? "#3a3b3f" : "#d1d5db",
              color:        isDark ? "#9ea2a7" : "#6b7280",
            }}
          >
            Cancel
        </Button>  

        {/* Submit */}
        <Button
          onClick={onSubmit}
          disabled={loading || disabled}
          variant="outline"
          disableElevation
          className="active:scale-95"
          // sx={{
          //   px: 3,
          //   py: 0.9,
          //   borderRadius: "8px",
          //   fontSize: "0.875rem",
          //   fontWeight: 500,
          //   textTransform: "none",
          //   background: "#ef4444",
          //   color: "#ffffff",
          //   "&:hover": {
          //     background: "#dc2626",
          //   },
          //   "&.Mui-disabled": {
          //     background: isDark ? "#2e2e2e" : "#e5e7eb",
          //     color:      isDark ? "#555"    : "#9ca3af",
          //   },
          // }}
        >
          {loading ? loadingLabel : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   2. FORMFIELD — plain text / number input
   ═══════════════════════════════════════════════
   Props:
     label     {string}
     name      {string}
     value     {string}
     onChange  {function}
     disabled  {boolean}
     required  {boolean}
     type      {string}  (default "text")
     fullWidth {boolean} (default true)
     colSpan   {number}  1 | 2  — wraps in a col-span-2 div when 2
   ═══════════════════════════════════════════════ */
export function FormField({
  label,
  name,
  value,
  onChange,
  disabled  = false,
  required  = false,
  type      = "text",
  fullWidth = true,
  colSpan,
}) {
  const theme   = useFormModalTheme();
  const inputSx = buildInputSx(theme);

  const field = (
    <TextField
      label={`${label}${required ? " *" : ""}`}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      type={type}
      sx={inputSx}
      fullWidth={fullWidth}
    />
  );

  if (colSpan === 2) {
    return <div className="col-span-2">{field}</div>;
  }
  return field;
}

/* ═══════════════════════════════════════════════
   3. FORMSELECT — dropdown (MenuItem list)
   ═══════════════════════════════════════════════
   Props:
     label    {string}
     name     {string}
     value    {string}
     onChange {function}
     options  {Array<{value, label}>}
     required {boolean}
   ═══════════════════════════════════════════════ */
export function FormSelect({
  label,
  name,
  value,
  onChange,
  options   = [],
  required  = false,
}) {
  const theme        = useFormModalTheme();
  const { isDark, borderColor } = theme;
  const inputSx      = buildInputSx(theme);
  const dropdownSx   = buildDropdownSx(isDark, borderColor);

  return (
    <TextField
      select
      label={`${label}${required ? " *" : ""}`}
      name={name}
      value={value}
      onChange={onChange}
      sx={inputSx}
      fullWidth
      SelectProps={{
        MenuProps: {
          PaperProps: { sx: dropdownSx },
        },
      }}
    >
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

/* ═══════════════════════════════════════════════
   4. FORMAUTOCOMPLETE — searchable station/list picker
   ═══════════════════════════════════════════════
   Props:
     label        {string}
     options      {Array<string | {name, id, ...}>}  — list items
     getLabel     {function}  – (option) => string  (default: name or raw string)
     value        {string}    – currently selected name/string
     onChange     {function}  – (selectedName: string) => void
     required     {boolean}
     showSearch   {boolean}   – prepend a search icon (default true)
   ═══════════════════════════════════════════════ */
export function FormAutocomplete({
  label,
  options      = [],
  getLabel     = (opt) => (typeof opt === "string" ? opt : opt.name),
  value        = "",
  onChange,
  required     = false,
  showSearch   = true,
}) {
  const theme        = useFormModalTheme();
  const { isDark, iconColor, borderColor } = theme;
  const inputSx      = buildInputSx(theme);
  const listboxSx    = buildListboxSx(isDark);

  const selected = options.find((opt) => getLabel(opt) === value) || null;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={getLabel}
      value={selected}
      onChange={(_, newValue) => {
        onChange(newValue ? getLabel(newValue) : "");
      }}
      ListboxProps={{ sx: listboxSx }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`${label}${required ? " *" : ""}`}
          placeholder="Type to search..."
          sx={inputSx}
          fullWidth
          InputProps={{
            ...params.InputProps,
            ...(showSearch && {
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: iconColor }} />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }),
          }}
        />
      )}
    />
  );
}

/* ─────────────────────────────────────────────
   Default export: all four pieces together
   ───────────────────────────────────────────── */
export default {
  FormModal,
  FormField,
  FormSelect,
  FormAutocomplete,
  useFormModalTheme,
  buildInputSx,
  buildDropdownSx,
  buildListboxSx,
};