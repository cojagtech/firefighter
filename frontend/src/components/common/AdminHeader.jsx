import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import WhatshotIcon from "@mui/icons-material/Whatshot";

import { useTheme } from "@/Context/ThemeContext";
import SafeIcon from "@/components/common/SafeIcon";
import logoutUser from "./auth/logout";
import useUserInfo from "@/components/common/auth/useUserInfo";
import ProfileDialog from "@/components/common/profile/ProfileDialog";
import MaintenanceDetailDialog from "@/components/common/MaintenanceDetailDialog";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AdminHeader() {
  const [mounted, setMounted] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  const [notifications, setNotifications] = useState([]);
  const [anchorNotif, setAnchorNotif] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const { isDark, toggleTheme } = useTheme();
  const { name, role, initials } = useUserInfo();

  const fetchNotifications = () => {
    fetch(`${API_BASE}/admin/admin-dashboard/get_notifications.php`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNotifications(data.notifications);
      });
  };

  useEffect(() => {
    setMounted(true);

    // Initial fetch
    fetchNotifications();

    // 🔁 Auto refresh every 5 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unreadCount = notifications.filter(
      (n) => Number(n.is_read) === 0
    ).length;

    // 🔔 Play sound only if new notification comes
    if (unreadCount > prevCount) {
      notificationSound.play().catch(() => {});
    }

    setPrevCount(unreadCount);
  }, [notifications]);

  useEffect(() => {
    const refresh = () => fetchNotifications();
    window.addEventListener("new-notification", refresh);
    return () => window.removeEventListener("new-notification", refresh);
  }, []);

  if (!mounted) return null;

  const notificationSound = new Audio("sounds/notification_sound.mp3");

  const notificationCount = notifications.filter(
    (n) => Number(n.is_read) === 0
  ).length;

  const handleNotificationClick = async (notif) => {
    try {
      // ✅ Mark as read in backend
      await fetch(`${API_BASE}/admin/admin-dashboard/mark_read.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id }),
      });

      // ✅ Update UI (DO NOT REMOVE)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, is_read: 1 } : n
        )
      );

      // ✅ Close dropdown
      setAnchorNotif(null);

      // ✅ Open popup
      setSelectedNotification(notif);

    } catch (err) {
      console.error(err);
    }
  };

  // 🎨 Theme styles — same pattern as PilotHeader
  const headerBg = isDark ? "#0d0d0d" : "#ffffff";
  const headerBorder = isDark ? "#1f1f1f" : "#e2e8f0";
  const textColor = isDark ? "#ffffff" : "#000000";
  const subtitleColor = isDark ? "#bbbbbb" : "#6b7280";
  const avatarBg = isDark ? "#333" : "#e5e7eb";
  const avatarColor = isDark ? "#ffffff" : "#000000";
  const menuBg = isDark ? "#1a1a1a" : "#ffffff";
  const menuColor = isDark ? "#ffffff" : "#000000";
  const menuHoverBg = isDark ? "#2a2a2a" : "#f3f4f6";
  const dividerColor = isDark ? "#333" : "#e2e8f0";

  const openProfile = () => {
    setProfileOpen(true);
    setMenuAnchor(null);
  };

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

          {/* LEFT */}
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "#b71c1c" }}>
              <WhatshotIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: "#ff5252" }}>
                Fire Fighter
              </Typography>
              <Typography fontSize={12} sx={{ color: subtitleColor }}>
                Admin Dashboard
              </Typography>
            </Box>
          </Box>

          {/* RIGHT */}
          <Box display="flex" alignItems="center" gap={2}>

            {/* 🔔 Notifications */}
            <IconButton sx={{ color: textColor }} onClick={(e) => setAnchorNotif(e.currentTarget)}>
              <Badge
                badgeContent={notificationCount}
                color="error"
                invisible={notificationCount === 0}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* NOTIFICATIONS MENU */}
            <Menu
              anchorEl={anchorNotif}
              open={Boolean(anchorNotif)}
              onClose={() => setAnchorNotif(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  background: headerBg,
                  color: menuColor,
                  width: 300,
                  maxHeight: 400,
                  overflowY: "auto",
                  borderRadius: "7px",
                  border: `1px solid ${dividerColor}`,
                  mt: 1.5,
                  px: 1,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Box px={2} py={1}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: subtitleColor,
                    letterSpacing: 0.3,
                  }}
                >
                  Notifications
                </Typography>
              </Box>
              <Divider sx={{ borderColor: dividerColor, marginBottom: 1 }} />

              {notifications.length === 0 ? (
                <MenuItem sx={{ color: subtitleColor, fontSize: 14 }}>
                  No notifications
                </MenuItem>
              ) : (
                notifications.map((n) => (
                  <MenuItem
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    sx={{
                      fontSize: 15,
                      py: 1.4,
                      borderRadius: "8px",
                      whiteSpace: "normal",
                      background: Number(n.is_read) === 0 ? menuHoverBg : "transparent",
                      opacity: Number(n.is_read) === 0 ? 1 : 0.6,
                      "&:hover": { background: menuHoverBg },
                    }}
                  >
                    <Box display="flex" flexDirection="column" gap={0.5} width="100%">
                      {/* MESSAGE */}
                      <Typography
                        fontSize={13}
                        sx={{ color: menuColor, fontWeight: 500 }}
                      >
                        {n.message}
                      </Typography>

                      {/* CREATED BY */}
                      <Typography fontSize={11} sx={{ color: subtitleColor }}>
                        By {n.created_by}
                      </Typography>
                    </Box>

                    {/* READ LABEL */}
                    {Number(n.is_read) === 1 && (
                      <Box
                        sx={{
                          fontSize: 10,
                          px: 1,
                          py: 0.3,
                          borderRadius: "12px",
                          background: "rgba(0, 255, 85, 0.88)",
                          color: "#ffffff",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          ml: 1,
                        }}
                      >
                        Read
                      </Box>
                    )}
                  </MenuItem>
                ))
              )}
            </Menu>

            {/* 👤 USER */}
            <Box
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <Avatar
                sx={{ bgcolor: avatarBg, color: avatarColor }}
              >
                {initials}
              </Avatar>

              <Box ml={1}>
                <Typography fontWeight="bold" sx={{ color: textColor }}>
                  {name}
                </Typography>
                <Typography fontSize={12} sx={{ color: subtitleColor }}>
                  {role}
                </Typography>
              </Box>

              <ExpandMoreIcon sx={{ color: textColor }} />
            </Box>

            {/* USER MENU */}
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

              <Divider sx={{ borderColor: dividerColor, marginBottom: 1 }} />

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
                onClick={logoutUser}
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
                <LogoutIcon sx={{ mr: 2 }} />
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

      {/* ✅ Maintenance Detail Dialog */}
      <MaintenanceDetailDialog
        selectedNotification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </>
  );
}