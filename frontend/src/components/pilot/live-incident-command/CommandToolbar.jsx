import React, { useState, useEffect } from "react";
import SafeIcon from "@/components/common/SafeIcon";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import {
  Button, Menu, MenuItem, Divider, IconButton, Select, FormControl,
} from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/pilot`;

export default function CommandToolbar({
  layout, onLayoutChange, onFullscreen, onExitFullscreen,
  isFullscreen, selectedDrone, onDroneChange,
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [drones, setDrones] = React.useState([]);

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

  // ✅ Backend unchanged
  React.useEffect(() => {
    async function fetchDrones() {
      try {
        const res = await fetch(`${API}/get_station_drones.php`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.drones) {
          setDrones(data.drones);
          if (!selectedDrone && data.drones.length > 0) {
            onDroneChange(data.drones[0].drone_code);
          }
        }
      } catch (err) {
        console.error("Drone fetch error:", err);
      }
    }
    fetchDrones();
  }, []);

  const C = isDark
    ? {
        toolbarBg: "#141414",
        toolbarBorder: "#1f1f1f",
        iconBoxBg: "#291818",
        iconBoxBorder: "#dc2626",
        selectBg: "#1f1f1f",
        selectColor: "#ffffff",
        selectBorder: "#2E2E2E",
        selectIconColor: "#ffffff",
        btnBorder: "#2E2E2E",
        btnColor: "#ffffff",
        btnHover: "#2a2a2a",
        menuBg: "#1a1a1a",
        menuColor: "#ffffff",
        menuHover: "#2a2a2a",
        menuBorder: "#2E2E2E",
        muted: "#9ca3af",
      }
    : {
        toolbarBg: "#ffffff",
        toolbarBorder: "#e2e8f0",
        iconBoxBg: "#fff1f2",
        iconBoxBorder: "#dc2626",
        selectBg: "#f8fafc",
        selectColor: "#111827",
        selectBorder: "#e2e8f0",
        selectIconColor: "#111827",
        btnBorder: "#e2e8f0",
        btnColor: "#111827",
        btnHover: "#f3f4f6",
        menuBg: "#ffffff",
        menuColor: "#111827",
        menuHover: "#f3f4f6",
        menuBorder: "#e2e8f0",
        muted: "#6b7280",
      };

  const layoutBtnSx = (name) => ({
    backgroundColor: layout === name ? "#dc2626" : "transparent",
    borderColor: layout === name ? "#dc2626" : C.btnBorder,
    color: layout === name ? "#ffffff" : C.btnColor,
    "&:hover": {
      backgroundColor: layout === name ? "#b91c1c" : C.btnHover,
    },
  });

  return (
    <div
      className="backdrop-blur-sm p-4"
      style={{
        backgroundColor: C.toolbarBg,
        borderBottom: `1px solid ${C.toolbarBorder}`,
      }}
    >
      <div className="flex items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: C.iconBoxBg, border: `1px solid ${C.iconBoxBorder}` }}
          >
            <SafeIcon name="AlertTriangle" className="h-5 w-5 text-primary" />
          </div>

          {/* Drone Select */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={selectedDrone || ""}
              onChange={(e) => {
                navigate(`/pilot-live-incident-command/${e.target.value}`);
              }}  
              displayEmpty
              sx={{
                color: C.selectColor,
                backgroundColor: C.selectBg,
                ".MuiOutlinedInput-notchedOutline": { borderColor: C.selectBorder },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#dc2626" },
                "& .MuiSvgIcon-root": { color: C.selectIconColor },
              }}
            >
              {drones.map((drone) => (
                <MenuItem key={drone.id} value={drone.drone_code}>
                  {drone.drone_code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* CENTER */}
        <div className="flex items-center gap-2">
          {["split", "full", "focus"].map((name) => (
            <Button
              key={name}
              variant={layout === name ? "contained" : "outlined"}
              size="small"
              onClick={() => onLayoutChange(name)}
              sx={layoutBtnSx(name)}
            >
              <SafeIcon
                name={name === "split" ? "LayoutGrid" : name === "full" ? "Maximize2" : "Focus"}
                className="mr-2 h-4 w-4"
              />
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Button>
          ))}

          <Button
            variant="outlined"
            size="small"
            onClick={() => { window.location.href = "http://43.205.31.167:8081/"; }}
            sx={{
              ml: 1,
              borderColor: C.btnBorder,
              color: C.btnColor,
              "&:hover": { backgroundColor: C.btnHover },
            }}
          >
            Control Panel
          </Button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={isFullscreen ? onExitFullscreen : onFullscreen}
            sx={{
              borderColor: C.btnBorder,
              color: C.btnColor,
              "&:hover": { backgroundColor: C.btnHover },
            }}
          >
            <SafeIcon
              name={isFullscreen ? "Minimize2" : "Maximize"}
              className="h-4 w-4"
            />
          </Button>

          {/* <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ color: C.btnColor }}
          >
            <SafeIcon name="MoreVertical" className="h-4 w-4" />
          </IconButton> */}

          {/* <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                background: C.menuBg,
                color: C.menuColor,
                border: `1px solid ${C.menuBorder}`,
                boxShadow: isDark
                  ? "0 4px 12px rgba(0,0,0,0.5)"
                  : "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <span
              className="px-4 py-2 text-xs font-semibold"
              style={{ color: C.muted }}
            >
              Command Options
            </span>
            <Divider sx={{ borderColor: C.menuBorder }} />

            {["Download", "Share2", "Settings"].map((icon, i) => (
              <MenuItem
                key={i}
                onClick={() => setAnchorEl(null)}
                sx={{ color: C.menuColor, "&:hover": { background: C.menuHover } }}
              >
                <SafeIcon name={icon} className="mr-2 h-4 w-4" />
                {icon === "Download" ? "Export Report" : icon === "Share2" ? "Share Feed" : "Panel Settings"}
              </MenuItem>
            ))}

            <Divider sx={{ borderColor: C.menuBorder }} />

            <MenuItem
              sx={{ color: "error.main", "&:hover": { background: C.menuHover } }}
              onClick={() => setAnchorEl(null)}
            >
              <SafeIcon name="LogOut" className="mr-2 h-4 w-4" /> End Mission
            </MenuItem>
          </Menu> */}

          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: C.muted,
              ":hover": { backgroundColor: "#dc2626", color: "white" },
            }}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}