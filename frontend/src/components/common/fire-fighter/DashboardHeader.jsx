import React, { useState, useEffect, useRef } from "react";
import {
  AppBar, Toolbar, Typography, IconButton, Badge,
  Menu, MenuItem, Box, Chip, Avatar, Divider
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
import ProfileDialog from "@/components/common/profile/ProfileDialog";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/fire-fighter/vehicle-drone-selection`;

export default function DashboardHeader() {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const { name, role, initials } = useUserInfo();

  const sessionData = sessionStorage.getItem("fireOpsSession");
  const stationName = sessionData ? JSON.parse(sessionData).station : null;

  const warningShownRef = useRef(false);
  const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_SHIFT === "true";

  const openProfile = () => {
    setProfileOpen(true);
    setMenuAnchor(null);
  };

  // ⏱ Session Timer
  useEffect(() => {
    const sessionData = sessionStorage.getItem("fireOpsSession");
    let expiryTime = sessionData ? JSON.parse(sessionData).sessionExpiry : null;

    if (!expiryTime) {
      logoutUser();
      return;
    }

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

  // DEV MODE
  useEffect(() => {
    if (DEV_BYPASS) {
      window.forceShiftComplete = () => {
        setTimeRemaining(0);
        toast.success("DEV MODE: Shift force-completed ⚡");
      };
    }
  }, [DEV_BYPASS]);

  // 🔔 Notification Polling
  useEffect(() => {
    if (!stationName) return;

    let isActive = true;

    const poll = async (lastCount = 0) => {
      try {
        const res = await fetch(
          `${API}/get_incident_alert_count.php?station=${encodeURIComponent(
            stationName
          )}&lastCount=${lastCount}`,
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

    return () => {
      isActive = false;
    };
  }, [stationName]);

  // 🧠 Helpers
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
    if (DEV_BYPASS) return logoutUser();

    if (timeRemaining > 0) {
      toast.error("Shift Active! Cannot logout", { icon: "🔒" });
      setMenuAnchor(null);
    } else {
      logoutUser();
    }
  };

  // 🎨 Theme styles
  const headerBg = isDark ? "#0d0d0d" : "#ffffff";
  const headerBorder = isDark ? "#1f1f1f" : "#e2e8f0";
  const textColor = isDark ? "#ffffff" : "#000000";
  const subtitleColor = isDark ? "#bbbbbb" : "#6b7280";
  const chipBg = isDark ? "#1f1f1f" : "#f3f4f6";
  const chipBorder = isDark ? "#333" : "#e2e8f0";
  const avatarBg = isDark ? "#333" : "#e5e7eb";
  const avatarColor = isDark ? "#ffffff" : "#000000";
  const menuColor = isDark ? "#ffffff" : "#000000";
  const menuHoverBg = isDark ? "#2a2a2a" : "#f3f4f6";
  const dividerColor = isDark ? "#333" : "#e2e8f0";

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
          color: textColor,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

          {/* 🔥 LEFT */}
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "#b71c1c" }}>
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

          {/* 🔥 RIGHT */}
          <Box display="flex" alignItems="center" gap={2}>

            {DEV_BYPASS && (
              <Chip label="DEV MODE" color="warning" size="small" />
            )}

            <Chip
              icon={<AccessTimeIcon sx={{ color: textColor }} />}
              label={formatTime(timeRemaining)}
              color={getTimerColor()}
              sx={{
                background: chipBg,
                color: textColor,
                border: `1px solid ${chipBorder}`,
              }}
            />

            <IconButton sx={{ color: textColor }}>
              <Badge
                badgeContent={notificationCount}
                color="error"
                invisible={notificationCount === 0}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* 👤 USER */}
            <Box
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <Avatar sx={{ bgcolor: avatarBg, color: avatarColor }}>
                {initials}
              </Avatar>

              <Box ml={1}>
                <Typography fontWeight="bold">{name}</Typography>
                <Typography fontSize={12} sx={{ color: subtitleColor }}>
                  {role}
                </Typography>
              </Box>

              <ExpandMoreIcon />
            </Box>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  background: headerBg,
                  color: menuColor,
                  width: 225,
                  borderRadius: "7px",
                  border: `1px solid ${dividerColor}`,
                  mt: 1.5,
                  px: 1, 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                },
              }}
            >
              {/* 🧾 HEADER */}
              <Box px={2} py={1}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: subtitleColor,
                    letterSpacing: 0.3,
                  }}
                >
                  My Account
                </Typography>
              </Box>

              <Divider sx={{ borderColor: dividerColor , marginBottom: 1 }} />

              {/* 👤 PROFILE */}
              <MenuItem
                onClick={openProfile}
                sx={{
                  fontSize: 15,
                  py: 1.4,
                  borderRadius: "8px",
                  "&:hover": { background: menuHoverBg },
                }}
              >
                <AccountCircleIcon sx={{ mr: 2 }} />
                Profile
              </MenuItem>

              {/* 🌗 THEME */}
              <MenuItem
                onClick={toggleTheme}
                sx={{
                  fontSize: 15,
                  py: 1.4,
                  borderRadius: "8px",
                  "&:hover": { background: menuHoverBg },
                }}
              >
                <SafeIcon
                  name={isDark ? "Sun" : "Moon"}
                  size={18}
                  style={{ marginRight: 16 }}
                />
                {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              </MenuItem>

              {/* 🚪 LOGOUT */}
              <MenuItem
                onClick={handleLogoutAttempt}
                sx={{
                  fontSize: 15,
                  py: 1.4,
                  borderRadius: "8px",
                  color: "#ef4444",
                  "&:hover": {
                    background: "rgba(239,68,68,0.1)",
                  },
                }}
              >
                {timeRemaining > 0 && !DEV_BYPASS ? (
                  <LockIcon sx={{ mr: 2 }} />
                ) : (
                  <LogoutIcon sx={{ mr: 2 }} />
                )}
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ Independent Dialog */}
      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}