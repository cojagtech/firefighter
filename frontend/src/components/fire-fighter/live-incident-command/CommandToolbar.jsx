import React, { useState, useEffect } from "react";
import SafeIcon from "@/components/common/SafeIcon";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Button,
  Chip,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

// API CONFIG
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API =
  `${API_BASE}/fire-fighter/live-incident-command/end_mission.php`;

export default function CommandToolbar({
  layout,
  onLayoutChange,
  onFullscreen,
  onExitFullscreen,
  isFullscreen,
  incidentId,
  incidentName,
}) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 🔥 End Mission API
  const handleEndMission = async () => {
    try {
      setLoading(true);

      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incidentId }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Mission Ended ✅");
        setConfirmOpen(false);
      } else {
        toast.error(data.error || "Failed to end mission ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error ending mission ❌");
    } finally {
      setLoading(false);
    }
  };

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

  const C = isDark
    ? {
        toolbarBg: "#141414",
        toolbarBorder: "#1f1f1f",
        iconBoxBg: "#291818",
        iconBoxBorder: "#dc2626",
        menuBg: "#1a1a1a",
        menuColor: "#ffffff",
        menuHover: "#2a2a2a",
        menuBorder: "#2E2E2E",
      }
    : {
        toolbarBg: "#ffffff",
        toolbarBorder: "#e2e8f0",
        iconBoxBg: "#fff1f2",
        iconBoxBorder: "#dc2626",
        menuBg: "#ffffff",
        menuColor: "#111827",
        menuHover: "#f3f4f6",
        menuBorder: "#e2e8f0",
      };

  return (
    <>
      <div
        className="backdrop-blur-sm p-4"
        style={{
          backgroundColor: C.toolbarBg,
          borderBottom: `1px solid ${C.toolbarBorder}`,
        }}
      >
        <div className="flex items-center justify-between gap-4">

          {/* Left */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                backgroundColor: C.iconBoxBg,
                border: `1px solid ${C.iconBoxBorder}`,
              }}
            >
              <SafeIcon name="AlertTriangle" className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {incidentName}
              </p>
              <p className="text-xs font-mono">
                {incidentId}
              </p>
            </div>

            <Chip
              label={
                <span className="flex items-center gap-1">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-white"></span>
                  LIVE
                </span>
              }
              color="error"
              className="ml-2 animate-pulse"
              size="small"
            />
          </div>

          {/* Center */}
          <div className="flex items-center gap-2">
            {["split", "full", "focus"].map((type) => (
              <Button
                key={type}
                variant={layout === type ? "contained" : "outlined"}
                size="small"
                onClick={() => onLayoutChange(type)}
                sx={{
                  backgroundColor: layout === type ? "#dc2626" : "transparent",
                  color: layout === type ? "#fff" : undefined,
                }}
              >
                {type}
              </Button>
            ))}

            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                window.location.href = "";
              }}
            >
              Control Panel
            </Button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            <Button
              size="small"
              onClick={isFullscreen ? onExitFullscreen : onFullscreen}
            >
              <SafeIcon
                name={isFullscreen ? "Minimize2" : "Maximize"}
                className="h-4 w-4"
              />
            </Button>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <SafeIcon name="MoreVertical" className="h-4 w-4" />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);

                  const phpUrl = `${API_BASE}/fire-fighter/live-incident-command/export-report.php?incidentId=${incidentId}`;
                  const win = window.open(phpUrl, "_blank");

                  win.onload = () => {
                    win.print();
                  };
                }}
              >
                Export Report
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setConfirmOpen(true);
                }}
                sx={{ color: "red" }}
                disabled={loading}
              >
                {loading ? "Ending..." : "End Mission"}
              </MenuItem>
            </Menu>

            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* 🔥 CONFIRM DIALOG */}
      <Dialog
        open={confirmOpen}
        onClose={() => !loading && setConfirmOpen(false)}
      >
        <DialogTitle>⚠️ End Mission</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to end this mission?
            <br />
            <b>{incidentName}</b>
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleEndMission}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Ending..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}