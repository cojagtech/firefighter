import React, { useEffect, useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BadgeIcon from "@mui/icons-material/Badge";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import HomeIcon from "@mui/icons-material/Home";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { useTheme } from "@/Context/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const InfoRow = ({ icon, title, value, isDark }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5,
      py: 1.4,
      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
    }}
  >
    <Box sx={{ mt: 0.3, color: "#ff5252", display: "flex", alignItems: "center", flexShrink: 0 }}>
      {icon}
    </Box>
    <Box>
      <Typography
        fontSize={11}
        fontWeight={500}
        sx={{ color: isDark ? "#6b7280" : "#9ca3af", letterSpacing: 0.5, textTransform: "uppercase" }}
      >
        {title}
      </Typography>
      <Typography
        fontSize={14}
        fontWeight={500}
        sx={{ color: isDark ? "#e5e7eb" : "#111827", mt: 0.3 }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

export default function ProfileDialog({ open, onClose }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!open) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const sessionData = sessionStorage.getItem("fireOpsSession");
        if (!sessionData) return;
        const { userId } = JSON.parse(sessionData);
        const res = await fetch(
          `${API_BASE}/common/login/get_user_profile.php?id=${userId}`
        );
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [open]);

  const initials = profileData?.fullName
    ? profileData.fullName.split(" ").map((n) => n[0]).join("")
    : "?";

  const dialogBg = isDark ? "#0d0d0d" : "#ffffff";
  const leftPanelBg = isDark ? "#111111" : "#fafafa";
  const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const subtitleColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
        },
      }}
      PaperProps={{
        sx: {
          background: dialogBg,
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${borderColor}`,
          boxShadow: isDark
            ? "0 25px 80px rgba(0,0,0,0.9)"
            : "0 20px 60px rgba(0,0,0,0.15)",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
          color: subtitleColor,
          "&:hover": {
            color: isDark ? "#fff" : "#111",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {loading ? (
        <Box sx={{ p: 8, textAlign: "center" }}>
          <CircularProgress sx={{ color: "#ff5252" }} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>

          {/* LEFT PANEL */}
          <Box
            sx={{
              width: { md: "36%" },
              background: leftPanelBg,
              borderRight: { md: `1px solid ${borderColor}` },
              borderBottom: { xs: `1px solid ${borderColor}`, md: "none" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pt: 5,
              pb: 4,
              px: 3,
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: "#b71c1c",
              }}
            />

            <Avatar
              sx={{
                width: 88,
                height: 88,
                mb: 2,
                fontSize: 28,
                fontWeight: 500,
                background: "#b71c1c",
                color: "#fff",
              }}
            >
              {initials}
            </Avatar>

            <Typography
              fontWeight={500}
              fontSize={17}
              sx={{ color: isDark ? "#ffffff" : "#111827", textAlign: "center" }}
            >
              {profileData?.fullName || "—"}
            </Typography>

            <Typography
              fontSize={12}
              sx={{ color: subtitleColor, mt: 0.5, mb: 2.5, textAlign: "center" }}
            >
              {profileData?.email || "—"}
            </Typography>

            <Chip
              label={profileData?.status === 1 ? "Active" : "Inactive"}
              size="small"
              sx={{
                background: profileData?.status === 1
                  ? (isDark ? "#166534" : "#dcfce7")
                  : (isDark ? "#7f1d1d" : "#fee2e2"),
                color: profileData?.status === 1
                  ? (isDark ? "#86efac" : "#166534")
                  : (isDark ? "#fca5a5" : "#991b1b"),
                fontWeight: 500,
                fontSize: 12,
                px: 1,
              }}
            />

            {/* <Divider sx={{ width: "100%", mt: 3, borderColor: borderColor }} />

            <Box sx={{ mt: 2.5, width: "100%" }}>
              <Typography
                fontSize={11}
                fontWeight={500}
                sx={{ color: subtitleColor, textTransform: "uppercase", letterSpacing: 0.5, mb: 1 }}
              >
                Station
              </Typography>
              <Typography
                fontSize={14}
                fontWeight={500}
                sx={{ color: isDark ? "#e5e7eb" : "#111827" }}
              >
                {profileData?.station || "—"}
              </Typography>
            </Box> */}
          </Box>

          {/* RIGHT PANEL */}
          <Box sx={{ flex: 1, px: 3.5, py: 4 }}>
            <Typography
              fontSize={11}
              fontWeight={500}
              sx={{ color: "#ff5252", textTransform: "uppercase", letterSpacing: 1, mb: 2 }}
            >
              Profile Details
            </Typography>

            <InfoRow icon={<BadgeIcon sx={{ fontSize: 18 }} />} title="Designation" value={profileData?.designation} isDark={isDark} />
            <InfoRow icon={<LocalFireDepartmentIcon sx={{ fontSize: 18 }} />} title="Station" value={profileData?.station} isDark={isDark} />
            <InfoRow icon={<HomeIcon sx={{ fontSize: 18 }} />} title="Address" value={profileData?.address} isDark={isDark} />
            <InfoRow icon={<PhoneIcon sx={{ fontSize: 18 }} />} title="Phone" value={profileData?.phone} isDark={isDark} />
            <InfoRow icon={<EmailIcon sx={{ fontSize: 18 }} />} title="Email" value={profileData?.email} isDark={isDark} />
          </Box>

        </Box>
      )}
    </Dialog>
  );
}