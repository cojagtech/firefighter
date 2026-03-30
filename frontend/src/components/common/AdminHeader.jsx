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

export default function AdminHeader({ notificationCount = 0 }) {
  const [mounted, setMounted] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const { name, role, initials } = useUserInfo();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // 🎨 Theme styles
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
              <Avatar
                src="https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/20/382b2788-4a1a-42b3-ad58-7ff36533b34a.png"
                alt={name}
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

            {/* DROPDOWN MENU */}
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
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

              {/* <Divider sx={{ borderColor: dividerColor, my: 1 }} /> */}

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

              {/* <Divider sx={{ borderColor: dividerColor, my: 1 }} /> */}

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
    </>
  );
}