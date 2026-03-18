import React, { useState, useEffect } from "react";
import SafeIcon from "@/components/common/SafeIcon";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Chip,
  Menu,
  MenuItem,
  Divider,
  IconButton,
} from "@mui/material";

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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

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
    <div
      className="backdrop-blur-sm p-4"
      style={{
        backgroundColor: C.toolbarBg,
        borderBottom: `1px solid ${C.toolbarBorder}`,
      }}
    >
      <div className="flex items-center justify-between gap-4">

        {/* Left — Incident Info */}
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
            <p className="text-sm font-medium text-foreground truncate">
              {incidentName}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
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

        {/* Center — Layout Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={layout === "split" ? "contained" : "outlined"}
            size="small"
            onClick={() => onLayoutChange("split")}
            sx={{
              backgroundColor: layout === "split" ? "#dc2626" : "transparent",
              borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
              color: layout === "split"
                ? "#ffffff"
                : isDark ? "#ffffff" : "#111827",
              "&:hover": { backgroundColor: layout === "split" ? "#b91c1c" : isDark ? "#2a2a2a" : "#f3f4f6" },
            }}
          >
            <SafeIcon name="LayoutGrid" className="mr-2 h-4 w-4" />
            Split
          </Button>

          <Button
            variant={layout === "full" ? "contained" : "outlined"}
            size="small"
            onClick={() => onLayoutChange("full")}
            sx={{
              backgroundColor: layout === "full" ? "#dc2626" : "transparent",
              borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
              color: layout === "full"
                ? "#ffffff"
                : isDark ? "#ffffff" : "#111827",
              "&:hover": { backgroundColor: layout === "full" ? "#b91c1c" : isDark ? "#2a2a2a" : "#f3f4f6" },
            }}
          >
            <SafeIcon name="Maximize2" className="mr-2 h-4 w-4" />
            Full
          </Button>

          <Button
            variant={layout === "focus" ? "contained" : "outlined"}
            size="small"
            onClick={() => onLayoutChange("focus")}
            sx={{
              backgroundColor: layout === "focus" ? "#dc2626" : "transparent",
              borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
              color: layout === "focus"
                ? "#ffffff"
                : isDark ? "#ffffff" : "#111827",
              "&:hover": { backgroundColor: layout === "focus" ? "#b91c1c" : isDark ? "#2a2a2a" : "#f3f4f6" },
            }}
          >
            <SafeIcon name="Focus" className="mr-2 h-4 w-4" />
            Focus
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => { window.location.href = "http://13.127.220.89:8081/"; }}
            sx={{
              ml: 1,
              borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
              color: isDark ? "#ffffff" : "#111827",
              "&:hover": { backgroundColor: isDark ? "#2a2a2a" : "#f3f4f6" },
            }}
          >
            Control Panel
          </Button>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={isFullscreen ? onExitFullscreen : onFullscreen}
            sx={{
              borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
              color: isDark ? "#ffffff" : "#111827",
              "&:hover": { backgroundColor: isDark ? "#2a2a2a" : "#f3f4f6" },
            }}
          >
            <SafeIcon
              name={isFullscreen ? "Minimize2" : "Maximize"}
              className="h-4 w-4"
            />
          </Button>

          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ color: isDark ? "#ffffff" : "#111827" }}
          >
            <SafeIcon name="MoreVertical" className="h-4 w-4" />
          </IconButton>

          <Menu
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
              style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
            >
              Command Options
            </span>
            <Divider sx={{ borderColor: C.menuBorder }} />

            <MenuItem
              onClick={() => setAnchorEl(null)}
              sx={{
                color: C.menuColor,
                "&:hover": { background: C.menuHover },
              }}
            >
              <SafeIcon name="Download" className="mr-2 h-4 w-4" /> Export Report
            </MenuItem>

            <MenuItem
              onClick={() => setAnchorEl(null)}
              sx={{
                color: C.menuColor,
                "&:hover": { background: C.menuHover },
              }}
            >
              <SafeIcon name="Share2" className="mr-2 h-4 w-4" /> Share Feed
            </MenuItem>

            <MenuItem
              onClick={() => setAnchorEl(null)}
              sx={{
                color: C.menuColor,
                "&:hover": { background: C.menuHover },
              }}
            >
              <SafeIcon name="Settings" className="mr-2 h-4 w-4" /> Panel Settings
            </MenuItem>

            <Divider sx={{ borderColor: C.menuBorder }} />

            <MenuItem
              sx={{
                color: "error.main",
                "&:hover": { background: C.menuHover },
              }}
              onClick={() => setAnchorEl(null)}
            >
              <SafeIcon name="LogOut" className="mr-2 h-4 w-4" /> End Mission
            </MenuItem>
          </Menu>

          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: isDark ? "#9ca3af" : "#6b7280",
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