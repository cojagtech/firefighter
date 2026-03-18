import React, { useState, useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  AppBar, Toolbar, Typography, IconButton, Badge,
  Menu, MenuItem, Box, Chip, Avatar, Divider,
  Dialog, DialogTitle, DialogContent, Grid
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LockIcon from "@mui/icons-material/Lock";
import WhatshotIcon from "@mui/icons-material/Whatshot";

import logoutUser from "@/components/common/auth/logout";
import useUserInfo from "@/components/common/auth/useUserInfo";
import { useTheme } from "@/Context/ThemeContext";
import SafeIcon from "@/components/common/SafeIcon";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/fire-fighter/vehicle-drone-selection`;

export default function DashboardHeader() {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const { isDark, toggleTheme } = useTheme();
  const { name, role, initials } = useUserInfo();

  const sessionData = sessionStorage.getItem("fireOpsSession");
  const stationName = sessionData ? JSON.parse(sessionData).station : null;

  const warningShownRef = useRef(false);
  const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_SHIFT === "true";

  // ✅ All backend logic unchanged
  const openProfile = async () => {
    try {
      const sessionData = sessionStorage.getItem("fireOpsSession");
      if (!sessionData) return;
      const { userId } = JSON.parse(sessionData);
      const res = await fetch(`${API_BASE}/common/login/get_user_profile.php?id=${userId}`);
      const data = await res.json();
      console.log("Profile API Response:", data);
      setProfileData(data);
      setProfileOpen(true);
      setMenuAnchor(null);
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  useEffect(() => {
    const sessionData = sessionStorage.getItem("fireOpsSession");
    let expiryTime = null;
    if (sessionData) expiryTime = JSON.parse(sessionData).sessionExpiry;
    if (!expiryTime) { logoutUser(); return; }

    const updateTimer = () => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeRemaining(secondsLeft);
      if (secondsLeft === 300 && !warningShownRef.current) {
        toast("Session expiring in 5 minutes!", { icon: "⚠️" });
        warningShownRef.current = true;
      }
      if (secondsLeft === 0) logoutUser();
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (DEV_BYPASS) {
      window.forceShiftComplete = () => {
        setTimeRemaining(0);
        toast.success("DEV MODE: Shift force-completed ⚡");
      };
    }
  }, [DEV_BYPASS]);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 300) return "error";
    if (timeRemaining <= 1800) return "warning";
    return "success";
  };

  const handleLogoutAttempt = () => {
    if (DEV_BYPASS) { logoutUser(); return; }
    if (timeRemaining > 0) {
      toast.error(`Shift Active! Cannot logout`, { icon: "🔒" });
      setMenuAnchor(null);
    } else {
      logoutUser();
    }
  };

  useEffect(() => {
    if (!stationName) return;
    let isActive = true;

    const poll = async (lastCount = 0) => {
      try {
        const res = await fetch(
          `${API}/get_incident_alert_count.php?station=${encodeURIComponent(stationName)}&lastCount=${lastCount}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!isActive) return;
        setNotificationCount(data.count);
        poll(data.count);
      } catch (err) {
        console.error("Polling error:", err);
        setTimeout(() => poll(lastCount), 2000);
      }
    };

    poll(0);
    return () => { isActive = false; };
  }, [stationName]);

  // Theme-aware styles
  const headerBg = isDark ? "#0d0d0d" : "#ffffff";
  const headerBorder = isDark ? "#1f1f1f" : "#e2e8f0";
  const textColor = isDark ? "#ffffff" : "#000000";
  const subtitleColor = isDark ? "#bbbbbb" : "#6b7280";
  const chipBg = isDark ? "#1f1f1f" : "#f3f4f6";
  const chipBorder = isDark ? "#333" : "#e2e8f0";
  const avatarBg = isDark ? "#333" : "#e5e7eb";
  const avatarColor = isDark ? "#ffffff" : "#000000";
  const menuBg = isDark ? "#1a1a1a" : "#ffffff";
  const menuColor = isDark ? "#ffffff" : "#000000";
  const menuHoverBg = isDark ? "#2a2a2a" : "#f3f4f6";
  const dividerColor = isDark ? "#333" : "#e2e8f0";

  // Profile dialog theme
  const dialogBg = isDark ? "#1A1D21" : "#ffffff";
  const dialogBorder = isDark ? "#2a2a2a" : "#e2e8f0";
  const dialogText = isDark ? "#ffffff" : "#111827";
  const dialogMuted = isDark ? "#aaaaaa" : "#6b7280";

  const InfoRow = ({ title, value }) => (
    <Box sx={{ borderBottom: `1px solid ${dialogBorder}`, pb: 1.2, mb: 1.5 }}>
      <Typography fontSize={13} fontWeight="bold" sx={{ color: dialogText }}>
        {title}
      </Typography>
      <Typography fontSize={14} sx={{ color: dialogMuted }}>
        {value || "-"}
      </Typography>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      sx={{
        background: headerBg,
        borderBottom: `1px solid ${headerBorder}`,
        color: textColor,
        boxShadow: isDark
          ? "0 2px 8px rgba(0,0,0,0.6)"
          : "0 2px 8px rgba(0,0,0,0.08)",
      }}
      elevation={3}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left — Logo */}
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "#b71c1c", border: "2px solid #ff5252" }}>
            <WhatshotIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#ff5252" }}>
              FireOps Command
            </Typography>
            <Typography fontSize={12} sx={{ color: subtitleColor }}>
              Emergency Operations Dashboard
            </Typography>
          </Box>
        </Box>

        {/* Right — Actions */}
        <Box display="flex" alignItems="center" gap={2}>
          {DEV_BYPASS && (
            <Chip label="DEV MODE" color="warning" size="small" sx={{ fontWeight: "bold" }} />
          )}

          <Chip
            icon={<AccessTimeIcon sx={{ color: textColor }} />}
            label={formatTime(timeRemaining)}
            color={getTimerColor()}
            sx={{
              fontWeight: "bold",
              background: chipBg,
              color: textColor,
              border: `1px solid ${chipBorder}`,
            }}
          />

          <IconButton sx={{ color: textColor }}>
            <Badge badgeContent={notificationCount} color="error" invisible={notificationCount === 0}>
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu Trigger */}
          <Box
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 1 }}
          >
            <Avatar sx={{ bgcolor: avatarBg, color: avatarColor }}>{initials}</Avatar>
            <Box>
              <Typography sx={{ fontWeight: "bold", color: textColor }}>{name}</Typography>
              <Typography sx={{ fontSize: 12, color: subtitleColor }}>{role}</Typography>
            </Box>
            <ExpandMoreIcon sx={{ color: textColor }} />
          </Box>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            PaperProps={{
              sx: {
                background: menuBg,
                color: menuColor,
                width: 220,
                border: `1px solid ${headerBorder}`,
                boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <MenuItem onClick={openProfile} sx={{ color: menuColor, "&:hover": { background: menuHoverBg } }}>
              <AccountCircleIcon sx={{ mr: 1, color: menuColor }} /> Profile
            </MenuItem>

            <MenuItem onClick={toggleTheme} sx={{ color: menuColor, "&:hover": { background: menuHoverBg } }}>
              <SafeIcon name={isDark ? "Sun" : "Moon"} size={16} className="mr-2" />
              {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </MenuItem>

            <MenuItem sx={{ color: menuColor, "&:hover": { background: menuHoverBg } }}>
              <SettingsIcon sx={{ mr: 1, color: menuColor }} /> Settings
            </MenuItem>

            <Divider sx={{ my: 1, borderColor: dividerColor }} />

            <MenuItem
              onClick={handleLogoutAttempt}
              sx={{
                color: timeRemaining > 0 && !DEV_BYPASS ? "#777" : "red",
                cursor: timeRemaining > 0 && !DEV_BYPASS ? "not-allowed" : "pointer",
                "&:hover": { background: menuHoverBg },
              }}
            >
              {timeRemaining > 0 && !DEV_BYPASS ? <LockIcon sx={{ mr: 1 }} /> : <LogoutIcon sx={{ mr: 1 }} />}
              {timeRemaining > 0 && !DEV_BYPASS ? "Shift Locked" : "Logout"}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Profile Dialog */}
      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        maxWidth="md"
        fullWidth
        BackdropProps={{
          sx: {
            backdropFilter: "blur(6px)",
            background: "rgba(0,0,0,0.6)",
          },
        }}
        PaperProps={{
          sx: {
            maxWidth: "800px",
            width: "100%",
            position: "relative",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            borderRadius: "16px",
            overflow: "hidden",
            background: dialogBg,
            color: dialogText,
            border: `1px solid ${dialogBorder}`,
            my: 4,
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={() => setProfileOpen(false)}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            color: isDark ? "#aaa" : "#6b7280",
            zIndex: 10,
            "&:hover": {
              color: isDark ? "#fff" : "#111827",
              background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Left Side */}
        <Box
          sx={{
            width: { md: "32%" },
            p: 4,
            textAlign: "center",
            borderRight: { md: `1px solid ${dialogBorder}` },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              mb: 2,
              fontSize: 32,
              background: "linear-gradient(135deg,#ff5252,#b71c1c)",
            }}
          >
            {initials}
          </Avatar>

          <Typography fontWeight="bold" fontSize={18} sx={{ color: dialogText }}>
            {profileData?.fullName}
          </Typography>

          <Typography fontSize={13} sx={{ color: dialogMuted, mb: 2 }}>
            {profileData?.email}
          </Typography>

          <Chip
            label={profileData?.status === 1 ? "Active" : "Inactive"}
            sx={{
              background: profileData?.status === 1 ? "#1b5e20" : "#b71c1c",
              color: "#fff",
              fontWeight: "bold",
            }}
          />
        </Box>

        {/* Right Side */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", px: 4 }}>
          <Box sx={{ width: "100%", p: 4 }}>
            <InfoRow title="Designation" value={profileData?.designation} />
            <InfoRow title="Role" value={profileData?.role} />
            <InfoRow title="Station" value={profileData?.station} />
            <InfoRow title="Address" value={profileData?.address} />
            <InfoRow title="Phone" value={profileData?.phone} />
          </Box>
        </Box>
      </Dialog>
    </AppBar>
  );
}